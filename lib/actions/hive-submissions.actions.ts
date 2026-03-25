'use server';

import { requireAuth } from '@/lib/require-auth';
import { checkActionRateLimit } from '@/lib/check-action-rate-limit';
import { insertNotification } from '@/lib/notifications';
import { revalidatePath } from 'next/cache';
import { and, count, desc, eq, max, sql } from 'drizzle-orm';
import { db } from '@/db';
import { hiveChapterSubmissions, hiveMembers, hives, chapters, books } from '@/db/schema';
import type { ActionResult, HiveSubmissionWithAuthor, HiveRole } from '@/lib/types/hive.types';

async function requireHiveMember(hiveId: string) {
  const userId = await requireAuth();
  const membership = await db.query.hiveMembers.findFirst({
    where: and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, userId)),
  });
  if (!membership) throw new Error('Not a member of this hive');
  return { userId, membership };
}

async function requireHiveMod(hiveId: string) {
  const { userId, membership } = await requireHiveMember(hiveId);
  if (membership.role === 'CONTRIBUTOR' || membership.role === 'BETA_READER') {
    throw new Error('Insufficient permissions');
  }
  return { userId, membership };
}

function countWords(html: string): number {
  const text = html.replace(/<[^>]+>/g, ' ');
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export async function getPendingSubmissionCountAction(hiveId: string): Promise<number> {
  try {
    const userId = await requireAuth();
    const membership = await db.query.hiveMembers.findFirst({
      where: and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, userId)),
    });
    if (!membership) return 0;
    if (membership.role !== 'OWNER' && membership.role !== 'MODERATOR') return 0;

    const [result] = await db
      .select({ total: count() })
      .from(hiveChapterSubmissions)
      .where(
        and(
          eq(hiveChapterSubmissions.hiveId, hiveId),
          eq(hiveChapterSubmissions.status, 'PENDING'),
        ),
      );
    return result?.total ?? 0;
  } catch {
    return 0;
  }
}

export async function getHiveSubmissionsAction(hiveId: string): Promise<{
  pending: HiveSubmissionWithAuthor[];
  approved: HiveSubmissionWithAuthor[];
  rejected: HiveSubmissionWithAuthor[];
  myRole: HiveRole;
  currentUserId: string;
}> {
  const userId = await requireAuth();
  const membership = await db.query.hiveMembers.findFirst({
    where: and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, userId)),
  });
  if (!membership) {
    return { pending: [], approved: [], rejected: [], myRole: 'CONTRIBUTOR', currentUserId: userId };
  }

  const isMod = membership.role === 'OWNER' || membership.role === 'MODERATOR';

  const rows = await db.query.hiveChapterSubmissions.findMany({
    where: isMod
      ? eq(hiveChapterSubmissions.hiveId, hiveId)
      : and(
          eq(hiveChapterSubmissions.hiveId, hiveId),
          eq(hiveChapterSubmissions.userId, userId),
        ),
    with: { author: true },
    orderBy: [desc(hiveChapterSubmissions.createdAt)],
  });

  const toTyped = (r: typeof rows[number]): HiveSubmissionWithAuthor => ({
    id: r.id,
    hiveId: r.hiveId,
    userId: r.userId,
    title: r.title,
    content: r.content,
    targetChapterOrder: r.targetChapterOrder,
    status: r.status as 'PENDING' | 'APPROVED' | 'REJECTED',
    reviewedById: r.reviewedById,
    reviewNote: r.reviewNote,
    reviewedAt: r.reviewedAt,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    author: { id: r.author.id, username: r.author.username, image: r.author.image },
  });

  return {
    pending: rows.filter((r) => r.status === 'PENDING').map(toTyped),
    approved: rows.filter((r) => r.status === 'APPROVED').map(toTyped),
    rejected: rows.filter((r) => r.status === 'REJECTED').map(toTyped),
    myRole: membership.role as HiveRole,
    currentUserId: userId,
  };
}

export async function createSubmissionAction(
  hiveId: string,
  data: { title: string; content: string; targetChapterOrder?: number | null },
): Promise<ActionResult & { submissionId?: string }> {
  try {
    const { userId } = await requireHiveMember(hiveId);
    const limited = await checkActionRateLimit(userId);
    if (limited) return { success: false, message: limited };

    const title = data.title.trim();
    if (!title) return { success: false, message: 'Title is required.' };
    if (title.length > 120) return { success: false, message: 'Title too long (max 120 chars).' };
    if (!data.content.trim()) return { success: false, message: 'Content is required.' };

    const [inserted] = await db
      .insert(hiveChapterSubmissions)
      .values({
        hiveId,
        userId,
        title,
        content: data.content,
        targetChapterOrder: data.targetChapterOrder ?? null,
      })
      .returning({ id: hiveChapterSubmissions.id });

    revalidatePath(`/hive/${hiveId}/submissions`);
    return { success: true, message: 'Submission created.', submissionId: inserted.id };
  } catch {
    return { success: false, message: 'Failed to create submission.' };
  }
}

export async function approveSubmissionAction(submissionId: string): Promise<ActionResult> {
  try {
    const submission = await db.query.hiveChapterSubmissions.findFirst({
      where: eq(hiveChapterSubmissions.id, submissionId),
      with: { hive: true, author: true },
    });
    if (!submission) return { success: false, message: 'Submission not found.' };

    const { userId } = await requireHiveMod(submission.hiveId);

    // Create chapter on the hive's linked book if it has one
    if (submission.hive.bookId) {
      const maxOrderResult = await db
        .select({ maxOrder: max(chapters.order) })
        .from(chapters)
        .where(eq(chapters.bookId, submission.hive.bookId));
      const nextOrder = (maxOrderResult[0]?.maxOrder ?? 0) + 1;
      const wordCount = countWords(submission.content);

      await db.insert(chapters).values({
        bookId: submission.hive.bookId,
        title: submission.title,
        content: submission.content,
        wordCount,
        order: nextOrder,
      });

      await db
        .update(books)
        .set({
          chapterCount: sql`${books.chapterCount} + 1`,
          wordCount: sql`${books.wordCount} + ${wordCount}`,
          updatedAt: new Date(),
        })
        .where(eq(books.id, submission.hive.bookId));

      await db
        .update(hives)
        .set({ chapterCount: sql`${hives.chapterCount} + 1` })
        .where(eq(hives.id, submission.hiveId));
    }

    await db
      .update(hiveChapterSubmissions)
      .set({ status: 'APPROVED', reviewedById: userId, reviewedAt: new Date(), updatedAt: new Date() })
      .where(eq(hiveChapterSubmissions.id, submissionId));

    await insertNotification({
      recipientId: submission.userId,
      actorId: userId,
      type: 'SUBMISSION_APPROVED',
      link: `/hive/${submission.hiveId}/submissions`,
      metadata: { hiveId: submission.hiveId, submissionTitle: submission.title },
    });

    revalidatePath(`/hive/${submission.hiveId}/submissions`);
    return { success: true, message: 'Submission approved.' };
  } catch {
    return { success: false, message: 'Failed to approve submission.' };
  }
}

export async function rejectSubmissionAction(
  submissionId: string,
  reviewNote?: string,
): Promise<ActionResult> {
  try {
    const submission = await db.query.hiveChapterSubmissions.findFirst({
      where: eq(hiveChapterSubmissions.id, submissionId),
    });
    if (!submission) return { success: false, message: 'Submission not found.' };

    const { userId } = await requireHiveMod(submission.hiveId);

    await db
      .update(hiveChapterSubmissions)
      .set({
        status: 'REJECTED',
        reviewedById: userId,
        reviewNote: reviewNote?.trim() ?? null,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(hiveChapterSubmissions.id, submissionId));

    await insertNotification({
      recipientId: submission.userId,
      actorId: userId,
      type: 'SUBMISSION_REJECTED',
      link: `/hive/${submission.hiveId}/submissions`,
      metadata: { hiveId: submission.hiveId, submissionTitle: submission.title },
    });

    revalidatePath(`/hive/${submission.hiveId}/submissions`);
    return { success: true, message: 'Submission rejected.' };
  } catch {
    return { success: false, message: 'Failed to reject submission.' };
  }
}
