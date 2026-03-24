'use server';

import { requireAuth } from '@/lib/require-auth';
import { db } from '@/db';
import { userChapterReads, chapters, readingProgress } from '@/db/schema';
import { and, desc, eq, inArray } from 'drizzle-orm';

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

export async function trackChapterOpenAction(
  bookId: string,
  chapterId: string,
): Promise<void> {
  try {
    const userId = await requireAuth();
    await db
      .insert(readingProgress)
      .values({ userId, bookId, chapterId, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: [readingProgress.userId, readingProgress.bookId],
        set: { chapterId, updatedAt: new Date() },
      });
  } catch {
    // Non-critical — never throw from a tracking action
  }
}

export async function getContinueReadingAction(): Promise<
  {
    bookId: string;
    bookTitle: string;
    coverUrl: string | null;
    chapterId: string;
    chapterTitle: string;
    updatedAt: Date;
  }[]
> {
  const userId = await requireAuth();

  const rows = await db.query.readingProgress.findMany({
    where: eq(readingProgress.userId, userId),
    orderBy: desc(readingProgress.updatedAt),
    limit: 5,
    with: {
      book: { columns: { id: true, title: true, coverUrl: true } },
      chapter: { columns: { id: true, title: true } },
    },
  });

  return rows.map((r) => ({
    bookId: r.book.id,
    bookTitle: r.book.title,
    coverUrl: r.book.coverUrl,
    chapterId: r.chapter.id,
    chapterTitle: r.chapter.title,
    updatedAt: r.updatedAt,
  }));
}
