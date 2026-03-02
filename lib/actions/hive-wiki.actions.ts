'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { hiveWikiEntries, hiveMembers } from '@/db/schema';
import type { ActionResult, WikiCategory, WikiEntryWithAuthor, HiveUser } from '@/lib/types/hive.types';

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

export async function getWikiEntriesAction(hiveId: string): Promise<WikiEntryWithAuthor[]> {
  const { userId } = await auth();
  if (!userId) return [];

  const membership = await db.query.hiveMembers.findFirst({
    where: and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, userId)),
  });
  if (!membership) return [];

  const entries = await db.query.hiveWikiEntries.findMany({
    where: eq(hiveWikiEntries.hiveId, hiveId),
    with: { author: true },
    orderBy: [desc(hiveWikiEntries.updatedAt)],
  });

  return entries.map((e) => ({
    id: e.id,
    hiveId: e.hiveId,
    authorId: e.authorId,
    title: e.title,
    content: e.content,
    category: e.category as WikiCategory,
    tags: e.tags as string[],
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
    author: e.author as HiveUser,
  }));
}

export async function createWikiEntryAction(
  hiveId: string,
  title: string,
  content: string,
  category: WikiCategory,
  tags: string[],
): Promise<ActionResult & { entryId?: string }> {
  try {
    const { userId } = await requireHiveMember(hiveId);

    if (!title.trim()) return { success: false, message: 'Title is required.' };
    if (title.length > 200) return { success: false, message: 'Title too long (max 200 chars).' };

    const cleanTags = tags.map((t) => t.trim()).filter(Boolean).slice(0, 10);

    const [entry] = await db
      .insert(hiveWikiEntries)
      .values({
        hiveId,
        authorId: userId,
        title: title.trim(),
        content,
        category,
        tags: cleanTags,
      })
      .returning({ id: hiveWikiEntries.id });

    revalidatePath(`/hive/${hiveId}/wiki`);
    return { success: true, message: 'Entry created.', entryId: entry.id };
  } catch {
    return { success: false, message: 'Failed to create entry.' };
  }
}

export async function updateWikiEntryAction(
  entryId: string,
  title: string,
  content: string,
  category: WikiCategory,
  tags: string[],
): Promise<ActionResult> {
  try {
    const userId = await requireAuth();

    const entry = await db.query.hiveWikiEntries.findFirst({
      where: eq(hiveWikiEntries.id, entryId),
    });
    if (!entry) return { success: false, message: 'Entry not found.' };

    const membership = await db.query.hiveMembers.findFirst({
      where: and(eq(hiveMembers.hiveId, entry.hiveId), eq(hiveMembers.userId, userId)),
    });
    const canEdit =
      entry.authorId === userId ||
      membership?.role === 'OWNER' ||
      membership?.role === 'MODERATOR';
    if (!canEdit) return { success: false, message: 'No permission to edit.' };

    if (!title.trim()) return { success: false, message: 'Title is required.' };

    const cleanTags = tags.map((t) => t.trim()).filter(Boolean).slice(0, 10);

    await db
      .update(hiveWikiEntries)
      .set({ title: title.trim(), content, category, tags: cleanTags, updatedAt: new Date() })
      .where(eq(hiveWikiEntries.id, entryId));

    revalidatePath(`/hive/${entry.hiveId}/wiki`);
    return { success: true, message: 'Entry updated.' };
  } catch {
    return { success: false, message: 'Failed to update entry.' };
  }
}

export async function deleteWikiEntryAction(entryId: string): Promise<ActionResult> {
  try {
    const userId = await requireAuth();

    const entry = await db.query.hiveWikiEntries.findFirst({
      where: eq(hiveWikiEntries.id, entryId),
    });
    if (!entry) return { success: false, message: 'Entry not found.' };

    const membership = await db.query.hiveMembers.findFirst({
      where: and(eq(hiveMembers.hiveId, entry.hiveId), eq(hiveMembers.userId, userId)),
    });
    const canDelete =
      entry.authorId === userId ||
      membership?.role === 'OWNER' ||
      membership?.role === 'MODERATOR';
    if (!canDelete) return { success: false, message: 'No permission to delete.' };

    await db.delete(hiveWikiEntries).where(eq(hiveWikiEntries.id, entryId));
    revalidatePath(`/hive/${entry.hiveId}/wiki`);
    return { success: true, message: 'Entry deleted.' };
  } catch {
    return { success: false, message: 'Failed to delete entry.' };
  }
}
