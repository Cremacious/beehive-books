'use server';

import { requireAuth, getOptionalUserId } from '@/lib/require-auth';
import { checkActionRateLimit } from '@/lib/check-action-rate-limit';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '@/db';
import { books, bookComments, bookCommentLikes } from '@/db/schema';
import { insertNotification } from '@/lib/notifications';

export type BookComment = {
  id: string;
  content: string;
  createdAt: Date;
  likeCount: number;
  parentId: string | null;
  author: { id: string; username: string | null; image: string | null };
  isLiked: boolean;
  canDelete: boolean;
  replies: BookComment[];
};

export async function getBookCommentsAction(bookId: string): Promise<BookComment[]> {
  const userId = await getOptionalUserId();

  const book = await db.query.books.findFirst({
    where: eq(books.id, bookId),
    columns: { userId: true },
  });

  const topLevel = await db.query.bookComments.findMany({
    where: and(
      eq(bookComments.bookId, bookId),
      sql`${bookComments.parentId} IS NULL`,
    ),
    orderBy: (c, { asc }) => [asc(c.createdAt)],
    with: {
      user: { columns: { id: true, username: true, image: true } },
      replies: {
        orderBy: (r, { asc }) => [asc(r.createdAt)],
        with: {
          user: { columns: { id: true, username: true, image: true } },
        },
      },
    },
  });

  const likedIds = userId
    ? (
        await db.query.bookCommentLikes.findMany({
          where: eq(bookCommentLikes.userId, userId),
        })
      ).map((l) => l.commentId)
    : [];

  const bookOwnerId = book?.userId;

  function mapComment(
    c: (typeof topLevel)[0],
    isReply?: false,
  ): BookComment;
  function mapComment(
    c: (typeof topLevel)[0]['replies'][0],
    isReply: true,
  ): BookComment;
  function mapComment(
    c: (typeof topLevel)[0] | (typeof topLevel)[0]['replies'][0],
    isReply = false,
  ): BookComment {
    const top = c as (typeof topLevel)[0];
    return {
      id: c.id,
      content: c.content,
      createdAt: c.createdAt,
      likeCount: c.likeCount,
      parentId: c.parentId,
      author: { id: c.user.id, username: c.user.username, image: c.user.image },
      isLiked: likedIds.includes(c.id),
      canDelete: userId !== null && (c.userId === userId || bookOwnerId === userId),
      replies: isReply ? [] : top.replies.map((r) => mapComment(r, true)),
    };
  }

  return topLevel.map((c) => mapComment(c));
}

export async function addBookCommentAction(
  bookId: string,
  content: string,
  parentId?: string,
): Promise<{ success: boolean; message: string; commentId?: string }> {
  const userId = await requireAuth();
  const limited = await checkActionRateLimit(userId);
  if (limited) return { success: false, message: limited };

  const book = await db.query.books.findFirst({
    where: eq(books.id, bookId),
    columns: { id: true, userId: true, title: true, commentsEnabled: true },
  });
  if (!book) return { success: false, message: 'Book not found.' };
  if (!book.commentsEnabled) return { success: false, message: 'Comments are disabled for this book.' };

  const trimmed = content.trim();
  if (!trimmed) return { success: false, message: 'Comment cannot be empty.' };
  if (trimmed.length > 2000) return { success: false, message: 'Comment is too long.' };

  try {
    const [inserted] = await db
      .insert(bookComments)
      .values({ bookId, userId, content: trimmed, parentId: parentId ?? null })
      .returning({ id: bookComments.id });

    if (!parentId) {
      await db
        .update(books)
        .set({ commentCount: sql`${books.commentCount} + 1` })
        .where(eq(books.id, bookId));

      void insertNotification({
        recipientId: book.userId,
        actorId: userId,
        type: 'BOOK_COMMENT',
        link: `/books/${bookId}`,
        metadata: { bookTitle: book.title },
      });
    } else {
      const parent = await db.query.bookComments.findFirst({
        where: eq(bookComments.id, parentId),
        columns: { userId: true },
      });
      if (parent) {
        void insertNotification({
          recipientId: parent.userId,
          actorId: userId,
          type: 'BOOK_COMMENT_REPLY',
          link: `/books/${bookId}`,
          metadata: { bookTitle: book.title },
        });
      }
    }

    return { success: true, message: 'Comment added.', commentId: inserted.id };
  } catch {
    return { success: false, message: 'Failed to add comment.' };
  }
}

export async function deleteBookCommentAction(
  commentId: string,
): Promise<{ success: boolean; message: string }> {
  const userId = await requireAuth();

  const comment = await db.query.bookComments.findFirst({
    where: eq(bookComments.id, commentId),
    with: { book: { columns: { userId: true } } },
  });
  if (!comment) return { success: false, message: 'Comment not found.' };
  if (comment.userId !== userId && comment.book.userId !== userId) {
    return { success: false, message: 'Unauthorized.' };
  }

  try {
    await db.delete(bookComments).where(eq(bookComments.id, commentId));
    if (!comment.parentId) {
      await db
        .update(books)
        .set({ commentCount: sql`${books.commentCount} - 1` })
        .where(eq(books.id, comment.bookId));
    }
    return { success: true, message: 'Comment deleted.' };
  } catch {
    return { success: false, message: 'Failed to delete comment.' };
  }
}

export async function likeBookCommentAction(
  commentId: string,
): Promise<{ success: boolean; liked: boolean }> {
  const userId = await requireAuth();

  const existing = await db.query.bookCommentLikes.findFirst({
    where: and(
      eq(bookCommentLikes.userId, userId),
      eq(bookCommentLikes.commentId, commentId),
    ),
  });

  const comment = await db.query.bookComments.findFirst({
    where: eq(bookComments.id, commentId),
    columns: { userId: true, bookId: true },
    with: { book: { columns: { title: true } } },
  });

  try {
    if (existing) {
      await db
        .delete(bookCommentLikes)
        .where(
          and(
            eq(bookCommentLikes.userId, userId),
            eq(bookCommentLikes.commentId, commentId),
          ),
        );
      await db
        .update(bookComments)
        .set({ likeCount: sql`${bookComments.likeCount} - 1` })
        .where(eq(bookComments.id, commentId));
      return { success: true, liked: false };
    } else {
      await db.insert(bookCommentLikes).values({ userId, commentId });
      await db
        .update(bookComments)
        .set({ likeCount: sql`${bookComments.likeCount} + 1` })
        .where(eq(bookComments.id, commentId));
      if (comment) {
        void insertNotification({
          recipientId: comment.userId,
          actorId: userId,
          type: 'BOOK_COMMENT_LIKE',
          link: `/books/${comment.bookId}`,
          metadata: { bookTitle: comment.book.title },
        });
      }
      return { success: true, liked: true };
    }
  } catch {
    return { success: false, liked: !!existing };
  }
}
