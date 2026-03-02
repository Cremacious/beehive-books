'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { and, desc, eq, sql } from 'drizzle-orm';
import { db } from '@/db';
import { hiveBuzzItems, hiveBuzzLikes, hiveMembers } from '@/db/schema';
import type { ActionResult, BuzzItemWithAuthor, BuzzType, HiveUser } from '@/lib/types/hive.types';

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

export async function getBuzzItemsAction(hiveId: string): Promise<BuzzItemWithAuthor[]> {
  const { userId } = await auth();
  if (!userId) return [];

  const membership = await db.query.hiveMembers.findFirst({
    where: and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, userId)),
  });
  if (!membership) return [];

  const items = await db.query.hiveBuzzItems.findMany({
    where: eq(hiveBuzzItems.hiveId, hiveId),
    with: { author: true, likes: true },
    orderBy: [desc(hiveBuzzItems.createdAt)],
  });

  return items.map((item) => ({
    id: item.id,
    hiveId: item.hiveId,
    authorId: item.authorId,
    content: item.content,
    type: item.type as BuzzType,
    mediaUrl: item.mediaUrl,
    likeCount: item.likeCount,
    createdAt: item.createdAt,
    author: item.author as HiveUser,
    likedByMe: item.likes.some((l) => l.userId === userId),
  }));
}

export async function createBuzzItemAction(
  hiveId: string,
  content: string,
  type: BuzzType,
  mediaUrl?: string,
): Promise<ActionResult & { itemId?: string }> {
  try {
    const { userId } = await requireHiveMember(hiveId);

    const trimmed = content.trim();
    if (!trimmed) return { success: false, message: 'Content is required.' };
    if (trimmed.length > 1000) return { success: false, message: 'Content too long (max 1000 chars).' };

    const [item] = await db
      .insert(hiveBuzzItems)
      .values({
        hiveId,
        authorId: userId,
        content: trimmed,
        type,
        mediaUrl: mediaUrl?.trim() || null,
      })
      .returning({ id: hiveBuzzItems.id });

    revalidatePath(`/hive/${hiveId}/buzz`);
    return { success: true, message: 'Posted to Buzz Board.', itemId: item.id };
  } catch {
    return { success: false, message: 'Failed to post.' };
  }
}

export async function toggleBuzzLikeAction(
  buzzId: string,
): Promise<{ success: boolean; liked: boolean; message: string }> {
  try {
    const userId = await requireAuth();

    const item = await db.query.hiveBuzzItems.findFirst({
      where: eq(hiveBuzzItems.id, buzzId),
    });
    if (!item) return { success: false, liked: false, message: 'Item not found.' };

    const existing = await db.query.hiveBuzzLikes.findFirst({
      where: and(eq(hiveBuzzLikes.buzzId, buzzId), eq(hiveBuzzLikes.userId, userId)),
    });

    if (existing) {
      await db
        .delete(hiveBuzzLikes)
        .where(and(eq(hiveBuzzLikes.buzzId, buzzId), eq(hiveBuzzLikes.userId, userId)));
      await db
        .update(hiveBuzzItems)
        .set({ likeCount: sql`GREATEST(${hiveBuzzItems.likeCount} - 1, 0)` })
        .where(eq(hiveBuzzItems.id, buzzId));
      return { success: true, liked: false, message: 'Unliked.' };
    } else {
      await db.insert(hiveBuzzLikes).values({ buzzId, userId });
      await db
        .update(hiveBuzzItems)
        .set({ likeCount: sql`${hiveBuzzItems.likeCount} + 1` })
        .where(eq(hiveBuzzItems.id, buzzId));
      return { success: true, liked: true, message: 'Liked.' };
    }
  } catch {
    return { success: false, liked: false, message: 'Failed to update like.' };
  }
}

export async function deleteBuzzItemAction(buzzId: string): Promise<ActionResult> {
  try {
    const userId = await requireAuth();

    const item = await db.query.hiveBuzzItems.findFirst({
      where: eq(hiveBuzzItems.id, buzzId),
    });
    if (!item) return { success: false, message: 'Item not found.' };

    const membership = await db.query.hiveMembers.findFirst({
      where: and(eq(hiveMembers.hiveId, item.hiveId), eq(hiveMembers.userId, userId)),
    });
    const canDelete =
      item.authorId === userId ||
      membership?.role === 'OWNER' ||
      membership?.role === 'MODERATOR';
    if (!canDelete) return { success: false, message: 'No permission.' };

    await db.delete(hiveBuzzItems).where(eq(hiveBuzzItems.id, buzzId));
    revalidatePath(`/hive/${item.hiveId}/buzz`);
    return { success: true, message: 'Deleted.' };
  } catch {
    return { success: false, message: 'Failed to delete.' };
  }
}
