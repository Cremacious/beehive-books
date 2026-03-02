'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { hiveVersionSnapshots, hiveMembers, hives, chapters } from '@/db/schema';
import type { ActionResult, VersionSnapshot, HiveUser } from '@/lib/types/hive.types';

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

export async function getVersionSnapshotsAction(
  hiveId: string,
  chapterId: string,
): Promise<VersionSnapshot[]> {
  const { userId } = await auth();
  if (!userId) return [];

  const membership = await db.query.hiveMembers.findFirst({
    where: and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, userId)),
  });
  if (!membership) return [];

  const snapshots = await db.query.hiveVersionSnapshots.findMany({
    where: and(
      eq(hiveVersionSnapshots.hiveId, hiveId),
      eq(hiveVersionSnapshots.chapterId, chapterId),
    ),
    with: { author: true },
    orderBy: [desc(hiveVersionSnapshots.createdAt)],
  });

  return snapshots.map((s) => ({
    id: s.id,
    hiveId: s.hiveId,
    chapterId: s.chapterId,
    authorId: s.authorId,
    name: s.name,
    content: s.content,
    wordCount: s.wordCount,
    createdAt: s.createdAt,
    author: s.author as HiveUser,
  }));
}


export async function createVersionSnapshotAction(
  hiveId: string,
  chapterId: string,
  name: string,
): Promise<ActionResult & { snapshotId?: string }> {
  try {
    const { userId } = await requireHiveMember(hiveId);

    if (!name.trim()) return { success: false, message: 'Snapshot name is required.' };
    if (name.length > 100) return { success: false, message: 'Name too long (max 100 chars).' };

  
    const hive = await db.query.hives.findFirst({ where: eq(hives.id, hiveId) });
    if (!hive?.bookId) return { success: false, message: 'No book linked to this hive.' };

    const chapter = await db.query.chapters.findFirst({
      where: and(eq(chapters.id, chapterId), eq(chapters.bookId, hive.bookId)),
    });
    if (!chapter) return { success: false, message: 'Chapter not found.' };

    const [snapshot] = await db
      .insert(hiveVersionSnapshots)
      .values({
        hiveId,
        chapterId,
        authorId: userId,
        name: name.trim(),
        content: chapter.content ?? '',
        wordCount: chapter.wordCount,
      })
      .returning({ id: hiveVersionSnapshots.id });

    revalidatePath(`/hive/${hiveId}/history`);
    return { success: true, message: 'Snapshot saved.', snapshotId: snapshot.id };
  } catch {
    return { success: false, message: 'Failed to save snapshot.' };
  }
}

export async function restoreVersionSnapshotAction(
  hiveId: string,
  snapshotId: string,
): Promise<ActionResult> {
  try {
    const userId = await requireAuth();

    const membership = await db.query.hiveMembers.findFirst({
      where: and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, userId)),
    });
    const canRestore =
      membership?.role === 'OWNER' || membership?.role === 'MODERATOR';
    if (!canRestore) {
      return { success: false, message: 'Only owners and moderators can restore snapshots.' };
    }

    const snapshot = await db.query.hiveVersionSnapshots.findFirst({
      where: and(
        eq(hiveVersionSnapshots.id, snapshotId),
        eq(hiveVersionSnapshots.hiveId, hiveId),
      ),
    });
    if (!snapshot) return { success: false, message: 'Snapshot not found.' };

    await db
      .update(chapters)
      .set({
        content: snapshot.content,
        wordCount: snapshot.wordCount,
        updatedAt: new Date(),
      })
      .where(eq(chapters.id, snapshot.chapterId));

    revalidatePath(`/hive/${hiveId}/history`);
    revalidatePath(`/library/${snapshot.chapterId}`);
    return { success: true, message: `Restored to "${snapshot.name}".` };
  } catch {
    return { success: false, message: 'Failed to restore snapshot.' };
  }
}

export async function deleteVersionSnapshotAction(
  hiveId: string,
  snapshotId: string,
): Promise<ActionResult> {
  try {
    const userId = await requireAuth();

    const snapshot = await db.query.hiveVersionSnapshots.findFirst({
      where: and(
        eq(hiveVersionSnapshots.id, snapshotId),
        eq(hiveVersionSnapshots.hiveId, hiveId),
      ),
    });
    if (!snapshot) return { success: false, message: 'Snapshot not found.' };

    const membership = await db.query.hiveMembers.findFirst({
      where: and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, userId)),
    });
    const canDelete =
      snapshot.authorId === userId ||
      membership?.role === 'OWNER' ||
      membership?.role === 'MODERATOR';
    if (!canDelete) return { success: false, message: 'No permission.' };

    await db.delete(hiveVersionSnapshots).where(eq(hiveVersionSnapshots.id, snapshotId));
    revalidatePath(`/hive/${hiveId}/history`);
    return { success: true, message: 'Snapshot deleted.' };
  } catch {
    return { success: false, message: 'Failed to delete snapshot.' };
  }
}
