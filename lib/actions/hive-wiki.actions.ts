'use server';

import { requireAuth, getOptionalUserId } from '@/lib/require-auth';
import { checkActionRateLimit } from '@/lib/check-action-rate-limit';

import { revalidatePath } from 'next/cache';
import { and, asc, desc, eq, ne } from 'drizzle-orm';
import { db } from '@/db';
import { hiveWikiEntries, hiveMembers, hives, users } from '@/db/schema';
import { insertOrBundleHiveActivityNotification } from '@/lib/notifications';
import type { ActionResult, WikiCategory, WikiEntryWithAuthor, HiveUser } from '@/lib/types/hive.types';

async function requireHiveMember(hiveId: string) {
  const userId = await requireAuth();
  const membership = await db.query.hiveMembers.findFirst({
    where: and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, userId)),
  });
  if (!membership) throw new Error('Not a member of this hive');
  return { userId, membership };
}

export async function getWikiEntriesByCategoryAction(
  hiveId: string,
  category: WikiCategory,
): Promise<WikiEntryWithAuthor[]> {
  const userId = await requireAuth();
  if (!userId) return [];

  const membership = await db.query.hiveMembers.findFirst({
    where: and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, userId)),
  });
  if (!membership) return [];

  const entries = await db.query.hiveWikiEntries.findMany({
    where: and(eq(hiveWikiEntries.hiveId, hiveId), eq(hiveWikiEntries.category, category)),
    with: { author: true },
    orderBy: [asc(hiveWikiEntries.title)],
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

export async function getWikiEntriesAction(hiveId: string): Promise<WikiEntryWithAuthor[]> {
  const userId = await requireAuth();
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
    const limited = await checkActionRateLimit(userId);
    if (limited) return { success: false, message: limited };

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

    void (async () => {
      try {
        const [hive, actor, otherMembers] = await Promise.all([
          db.query.hives.findFirst({ where: eq(hives.id, hiveId), columns: { name: true } }),
          db.query.users.findFirst({ where: eq(users.id, userId), columns: { username: true } }),
          db.query.hiveMembers.findMany({
            where: and(eq(hiveMembers.hiveId, hiveId), ne(hiveMembers.userId, userId)),
            columns: { userId: true },
          }),
        ]);
        if (!hive || !actor) return;
        await Promise.all(
          otherMembers.map((m) =>
            insertOrBundleHiveActivityNotification({
              recipientId: m.userId,
              actorId: userId,
              hiveId,
              hiveName: hive.name,
              actorUsername: actor.username ?? 'A hive member',
            }),
          ),
        );
      } catch {}
    })();

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
