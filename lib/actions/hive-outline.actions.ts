'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { and, asc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { hiveOutlineItems, hiveMembers } from '@/db/schema';
import type { ActionResult, OutlineItem, OutlineItemType } from '@/lib/types/hive.types';

async function requireAuth() {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  return userId;
}

async function requireHiveMember(hiveId: string) {
  const userId = await requireAuth();
  const membership = await db.query.hiveMembers.findFirst({
    where: and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, userId)),
  });
  if (!membership) throw new Error('Not a member of this hive');
  return { userId, membership };
}

export async function getOutlineItemsAction(hiveId: string): Promise<OutlineItem[]> {
  const { userId } = await auth();
  if (!userId) return [];

  const membership = await db.query.hiveMembers.findFirst({
    where: and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, userId)),
  });
  if (!membership) return [];

  const items = await db.query.hiveOutlineItems.findMany({
    where: eq(hiveOutlineItems.hiveId, hiveId),
    orderBy: [asc(hiveOutlineItems.order)],
  });

  return items.map((item) => ({
    id: item.id,
    hiveId: item.hiveId,
    createdById: item.createdById,
    title: item.title,
    description: item.description,
    type: item.type as OutlineItemType,
    order: item.order,
    parentId: item.parentId,
    color: item.color,
    assignedToId: item.assignedToId,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));
}

export async function createOutlineItemAction(
  hiveId: string,
  title: string,
  description: string,
  type: OutlineItemType,
  color: string,
  parentId?: string | null,
): Promise<ActionResult & { itemId?: string }> {
  try {
    const { userId } = await requireHiveMember(hiveId);

    if (!title.trim()) return { success: false, message: 'Title is required.' };

    // Determine the next order value
    const existing = await db.query.hiveOutlineItems.findMany({
      where: and(
        eq(hiveOutlineItems.hiveId, hiveId),
        parentId
          ? eq(hiveOutlineItems.parentId, parentId)
          : eq(hiveOutlineItems.parentId, hiveOutlineItems.parentId),
      ),
    });
    const nextOrder = existing.length;

    const [item] = await db
      .insert(hiveOutlineItems)
      .values({
        hiveId,
        createdById: userId,
        title: title.trim(),
        description: description.trim(),
        type,
        color,
        parentId: parentId ?? null,
        order: nextOrder,
      })
      .returning({ id: hiveOutlineItems.id });

    revalidatePath(`/hive/${hiveId}/outline`);
    return { success: true, message: 'Item added.', itemId: item.id };
  } catch {
    return { success: false, message: 'Failed to add item.' };
  }
}

export async function updateOutlineItemAction(
  itemId: string,
  updates: Partial<{
    title: string;
    description: string;
    type: OutlineItemType;
    color: string;
    assignedToId: string | null;
  }>,
): Promise<ActionResult> {
  try {
    const userId = await requireAuth();

    const item = await db.query.hiveOutlineItems.findFirst({
      where: eq(hiveOutlineItems.id, itemId),
    });
    if (!item) return { success: false, message: 'Item not found.' };

    const membership = await db.query.hiveMembers.findFirst({
      where: and(eq(hiveMembers.hiveId, item.hiveId), eq(hiveMembers.userId, userId)),
    });
    if (!membership) return { success: false, message: 'No permission.' };

    await db
      .update(hiveOutlineItems)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(hiveOutlineItems.id, itemId));

    revalidatePath(`/hive/${item.hiveId}/outline`);
    return { success: true, message: 'Item updated.' };
  } catch {
    return { success: false, message: 'Failed to update item.' };
  }
}

export async function reorderOutlineItemsAction(
  hiveId: string,
  orderedIds: string[],
): Promise<ActionResult> {
  try {
    const userId = await requireAuth();

    const membership = await db.query.hiveMembers.findFirst({
      where: and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, userId)),
    });
    if (!membership) return { success: false, message: 'No permission.' };

    // Update each item's order in parallel
    await Promise.all(
      orderedIds.map((id, index) =>
        db
          .update(hiveOutlineItems)
          .set({ order: index })
          .where(and(eq(hiveOutlineItems.id, id), eq(hiveOutlineItems.hiveId, hiveId))),
      ),
    );

    revalidatePath(`/hive/${hiveId}/outline`);
    return { success: true, message: 'Order saved.' };
  } catch {
    return { success: false, message: 'Failed to save order.' };
  }
}

export async function deleteOutlineItemAction(itemId: string): Promise<ActionResult> {
  try {
    const userId = await requireAuth();

    const item = await db.query.hiveOutlineItems.findFirst({
      where: eq(hiveOutlineItems.id, itemId),
    });
    if (!item) return { success: false, message: 'Item not found.' };

    const membership = await db.query.hiveMembers.findFirst({
      where: and(eq(hiveMembers.hiveId, item.hiveId), eq(hiveMembers.userId, userId)),
    });
    const canDelete =
      item.createdById === userId ||
      membership?.role === 'OWNER' ||
      membership?.role === 'MODERATOR';
    if (!canDelete) return { success: false, message: 'No permission.' };

    await db.delete(hiveOutlineItems).where(eq(hiveOutlineItems.id, itemId));
    revalidatePath(`/hive/${item.hiveId}/outline`);
    return { success: true, message: 'Item deleted.' };
  } catch {
    return { success: false, message: 'Failed to delete item.' };
  }
}
