'use server';

import { requireAuth, getOptionalUserId } from '@/lib/require-auth';

import { revalidatePath } from 'next/cache';
import { and, asc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { hiveOutlineItems, hiveMembers } from '@/db/schema';
import type { ActionResult, OutlineItem, OutlineItemType } from '@/lib/types/hive.types';

async function requireHiveMember(hiveId: string) {
  const userId = await requireAuth();
  const membership = await db.query.hiveMembers.findFirst({
    where: and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, userId)),
  });
  if (!membership) throw new Error('Not a member of this hive');
  return { userId, membership };
}

export async function getOutlineItemsAction(hiveId: string): Promise<OutlineItem[]> {
  const userId = await requireAuth();
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

export async function createGroupAction(
  hiveId: string,
  name: string,
  color: string,
): Promise<ActionResult & { itemId?: string }> {
  try {
    const { userId } = await requireHiveMember(hiveId);
    if (!name.trim()) return { success: false, message: 'Name is required.' };

    const existing = await db.query.hiveOutlineItems.findMany({
      where: and(eq(hiveOutlineItems.hiveId, hiveId), eq(hiveOutlineItems.parentId, hiveOutlineItems.parentId)),
    });
    const nextOrder = existing.length;

    const [group] = await db
      .insert(hiveOutlineItems)
      .values({
        hiveId,
        createdById: userId,
        title: name.trim(),
        description: '',
        type: 'GROUP',
        color,
        parentId: null,
        order: nextOrder,
      })
      .returning({ id: hiveOutlineItems.id });

    revalidatePath(`/hive/${hiveId}/outline`);
    return { success: true, message: 'Group created.', itemId: group.id };
  } catch {
    return { success: false, message: 'Failed to create group.' };
  }
}

export async function moveItemToGroupAction(
  hiveId: string,
  itemId: string,
  groupId: string | null,
): Promise<ActionResult> {
  try {
    await requireHiveMember(hiveId);

    await db
      .update(hiveOutlineItems)
      .set({ parentId: groupId, updatedAt: new Date() })
      .where(and(eq(hiveOutlineItems.id, itemId), eq(hiveOutlineItems.hiveId, hiveId)));

    revalidatePath(`/hive/${hiveId}/outline`);
    return { success: true, message: 'Item moved.' };
  } catch {
    return { success: false, message: 'Failed to move item.' };
  }
}

export async function deleteGroupAction(groupId: string): Promise<ActionResult> {
  try {
    const userId = await requireAuth();

    const group = await db.query.hiveOutlineItems.findFirst({
      where: eq(hiveOutlineItems.id, groupId),
    });
    if (!group || group.type !== 'GROUP') return { success: false, message: 'Group not found.' };

    const membership = await db.query.hiveMembers.findFirst({
      where: and(eq(hiveMembers.hiveId, group.hiveId), eq(hiveMembers.userId, userId)),
    });
    const canDelete =
      group.createdById === userId ||
      membership?.role === 'OWNER' ||
      membership?.role === 'MODERATOR';
    if (!canDelete) return { success: false, message: 'No permission.' };

    await db
      .update(hiveOutlineItems)
      .set({ parentId: null, updatedAt: new Date() })
      .where(eq(hiveOutlineItems.parentId, groupId));

    await db.delete(hiveOutlineItems).where(eq(hiveOutlineItems.id, groupId));
    revalidatePath(`/hive/${group.hiveId}/outline`);
    return { success: true, message: 'Group deleted.' };
  } catch {
    return { success: false, message: 'Failed to delete group.' };
  }
}
