'use server';

import { requireAuth } from '@/lib/require-auth';
import { db } from '@/db';
import { userChapterReads, chapters } from '@/db/schema';
import { and, eq, inArray } from 'drizzle-orm';

export async function toggleChapterReadAction(
  chapterId: string,
): Promise<{ success: boolean; isRead: boolean }> {
  const userId = await requireAuth();

  const existing = await db.query.userChapterReads.findFirst({
    where: and(
      eq(userChapterReads.userId, userId),
      eq(userChapterReads.chapterId, chapterId),
    ),
    columns: { id: true },
  });

  if (existing) {
    await db
      .delete(userChapterReads)
      .where(
        and(
          eq(userChapterReads.userId, userId),
          eq(userChapterReads.chapterId, chapterId),
        ),
      );
    return { success: true, isRead: false };
  } else {
    await db.insert(userChapterReads).values({ userId, chapterId });
    return { success: true, isRead: true };
  }
}

export async function getBookReadStatusAction(bookId: string): Promise<string[]> {
  const userId = await requireAuth();

  const bookChapters = await db.query.chapters.findMany({
    where: eq(chapters.bookId, bookId),
    columns: { id: true },
  });

  const chapterIds = bookChapters.map((c) => c.id);
  if (chapterIds.length === 0) return [];

  const reads = await db.query.userChapterReads.findMany({
    where: and(
      eq(userChapterReads.userId, userId),
      inArray(userChapterReads.chapterId, chapterIds),
    ),
    columns: { chapterId: true },
  });

  return reads.map((r) => r.chapterId);
}
