'use server';

import { db } from '@/db';
import { bookLikes, books } from '@/db/schema';
import { requireAuth, getOptionalUserId } from '@/lib/require-auth';
import { checkActionRateLimit } from '@/lib/check-action-rate-limit';
import { insertNotification } from '@/lib/notifications';
import { and, eq, sql } from 'drizzle-orm';

export async function toggleBookLikeAction(bookId: string): Promise<{
  success: boolean;
  message?: string;
  liked?: boolean;
  likeCount?: number;
}> {
  let userId: string;
  try {
    userId = await requireAuth();
  } catch {
    return { success: false, message: 'Unauthorized' };
  }

  const limited = await checkActionRateLimit(userId);
  if (limited) return { success: false, message: 'Too many requests. Please slow down.' };

  const existing = await db.query.bookLikes.findFirst({
    where: and(eq(bookLikes.userId, userId), eq(bookLikes.bookId, bookId)),
  });

  if (existing) {
    await db.delete(bookLikes).where(
      and(eq(bookLikes.userId, userId), eq(bookLikes.bookId, bookId)),
    );
    const [updated] = await db
      .update(books)
      .set({ likeCount: sql`${books.likeCount} - 1` })
      .where(eq(books.id, bookId))
      .returning({ likeCount: books.likeCount });
    return { success: true, liked: false, likeCount: updated?.likeCount ?? 0 };
  } else {
    await db.insert(bookLikes).values({ userId, bookId });
    const [updated] = await db
      .update(books)
      .set({ likeCount: sql`${books.likeCount} + 1` })
      .where(eq(books.id, bookId))
      .returning({ likeCount: books.likeCount });

    const likedBook = await db.query.books.findFirst({
      where: eq(books.id, bookId),
      columns: { userId: true, title: true },
    });
    if (likedBook && likedBook.userId !== userId) {
      void insertNotification({
        recipientId: likedBook.userId,
        actorId: userId,
        type: 'BOOK_LIKE',
        link: `/books/${bookId}`,
        metadata: { bookId, bookTitle: likedBook.title },
      });
    }

    return { success: true, liked: true, likeCount: updated?.likeCount ?? 0 };
  }
}

export async function getBookLikeStatusAction(bookId: string): Promise<{
  liked: boolean;
  likeCount: number;
}> {
  const userId = await getOptionalUserId();

  const book = await db.query.books.findFirst({
    where: eq(books.id, bookId),
    columns: { likeCount: true },
  });

  if (!userId) return { liked: false, likeCount: book?.likeCount ?? 0 };

  const like = await db.query.bookLikes.findFirst({
    where: and(eq(bookLikes.userId, userId), eq(bookLikes.bookId, bookId)),
  });

  return { liked: !!like, likeCount: book?.likeCount ?? 0 };
}
