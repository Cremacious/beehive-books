'use server';

import { requireAuth, getOptionalUserId } from '@/lib/require-auth';

import { revalidatePath } from 'next/cache';
import { and, asc, desc, eq, ne } from 'drizzle-orm';
import { db } from '@/db';
import { hiveInlineComments, hiveMembers, chapters, hives, users } from '@/db/schema';
import { insertOrBundleHiveActivityNotification } from '@/lib/notifications';
import type {
  ActionResult,
  AnnotationLayer,
  InlineComment,
  HiveUser,
} from '@/lib/types/hive.types';

async function requireHiveMember(hiveId: string) {
  const userId = await requireAuth();
  const membership = await db.query.hiveMembers.findFirst({
    where: and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, userId)),
  });
  if (!membership) throw new Error('Not a member of this hive');
  return { userId, membership };
}

export async function getInlineCommentsAction(
  hiveId: string,
  chapterId: string,
): Promise<InlineComment[]> {
  const userId = await requireAuth();
  if (!userId) return [];

  const membership = await db.query.hiveMembers.findFirst({
    where: and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, userId)),
  });
  if (!membership) return [];

  const comments = await db.query.hiveInlineComments.findMany({
    where: and(
      eq(hiveInlineComments.hiveId, hiveId),
      eq(hiveInlineComments.chapterId, chapterId),
    ),
    with: { author: true },
    orderBy: [asc(hiveInlineComments.selectionStart), desc(hiveInlineComments.createdAt)],
  });

  return comments.map((c) => ({
    id: c.id,
    hiveId: c.hiveId,
    chapterId: c.chapterId,
    authorId: c.authorId,
    selectionStart: c.selectionStart,
    selectionEnd: c.selectionEnd,
    selectedText: c.selectedText,
    content: c.content,
    layer: c.layer as AnnotationLayer,
    status: c.status as 'OPEN' | 'RESOLVED',
    createdAt: c.createdAt,
    author: c.author as HiveUser,
  }));
}


export async function getChapterContentAction(
  hiveId: string,
  chapterId: string,
): Promise<{ title: string; content: string } | null> {
  const userId = await requireAuth();
  if (!userId) return null;

  const membership = await db.query.hiveMembers.findFirst({
    where: and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, userId)),
  });
  if (!membership) return null;


  const hive = await db.query.hives.findFirst({ where: eq(hives.id, hiveId) });
  if (!hive?.bookId) return null;

  const chapter = await db.query.chapters.findFirst({
    where: and(eq(chapters.id, chapterId), eq(chapters.bookId, hive.bookId)),
  });
  if (!chapter) return null;

  return { title: chapter.title, content: chapter.content ?? '' };
}

export async function createInlineCommentAction(
  hiveId: string,
  chapterId: string,
  selectedText: string,
  selectionStart: number,
  selectionEnd: number,
  content: string,
  layer: AnnotationLayer,
): Promise<ActionResult & { commentId?: string }> {
  try {
    const { userId } = await requireHiveMember(hiveId);

    if (!content.trim()) return { success: false, message: 'Comment text is required.' };
    if (content.length > 2000) return { success: false, message: 'Comment too long (max 2000 chars).' };

    const [comment] = await db
      .insert(hiveInlineComments)
      .values({
        hiveId,
        chapterId,
        authorId: userId,
        selectedText: selectedText.trim(),
        selectionStart,
        selectionEnd,
        content: content.trim(),
        layer,
        status: 'OPEN',
      })
      .returning({ id: hiveInlineComments.id });

    revalidatePath(`/hive/${hiveId}/comments`);

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

    return { success: true, message: 'Comment added.', commentId: comment.id };
  } catch {
    return { success: false, message: 'Failed to add comment.' };
  }
}

export async function resolveInlineCommentAction(commentId: string): Promise<ActionResult> {
  try {
    const userId = await requireAuth();

    const comment = await db.query.hiveInlineComments.findFirst({
      where: eq(hiveInlineComments.id, commentId),
    });
    if (!comment) return { success: false, message: 'Comment not found.' };

    const membership = await db.query.hiveMembers.findFirst({
      where: and(eq(hiveMembers.hiveId, comment.hiveId), eq(hiveMembers.userId, userId)),
    });
    const canResolve =
      comment.authorId === userId ||
      membership?.role === 'OWNER' ||
      membership?.role === 'MODERATOR';
    if (!canResolve) return { success: false, message: 'No permission.' };

    const newStatus = comment.status === 'OPEN' ? 'RESOLVED' : 'OPEN';
    await db
      .update(hiveInlineComments)
      .set({ status: newStatus })
      .where(eq(hiveInlineComments.id, commentId));

    revalidatePath(`/hive/${comment.hiveId}/comments`);
    return { success: true, message: newStatus === 'RESOLVED' ? 'Resolved.' : 'Reopened.' };
  } catch {
    return { success: false, message: 'Failed to update comment.' };
  }
}

export async function deleteInlineCommentAction(commentId: string): Promise<ActionResult> {
  try {
    const userId = await requireAuth();

    const comment = await db.query.hiveInlineComments.findFirst({
      where: eq(hiveInlineComments.id, commentId),
    });
    if (!comment) return { success: false, message: 'Comment not found.' };

    const membership = await db.query.hiveMembers.findFirst({
      where: and(eq(hiveMembers.hiveId, comment.hiveId), eq(hiveMembers.userId, userId)),
    });
    const canDelete =
      comment.authorId === userId ||
      membership?.role === 'OWNER' ||
      membership?.role === 'MODERATOR';
    if (!canDelete) return { success: false, message: 'No permission.' };

    await db.delete(hiveInlineComments).where(eq(hiveInlineComments.id, commentId));
    revalidatePath(`/hive/${comment.hiveId}/comments`);
    return { success: true, message: 'Comment deleted.' };
  } catch {
    return { success: false, message: 'Failed to delete comment.' };
  }
}
