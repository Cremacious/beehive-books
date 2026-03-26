'use server';

import { requireAuth, getOptionalUserId } from '@/lib/require-auth';

import { revalidatePath } from 'next/cache';
import { checkCreateLimit } from '@/lib/premium';
import { and, eq, max, sql } from 'drizzle-orm';
import { insertNotification } from '@/lib/notifications';
import { db } from '@/db';
import { readingLists, readingListBooks, readingListFollows, readingListLikes } from '@/db/schema';
import {
  readingListSchema,
  bookEntrySchema,
} from '@/lib/validations/reading-list.schema';
import type {
  ReadingListFormData,
  BookEntryData,
  ActionResult,
} from '@/lib/types/reading-list.types';

async function requireListOwner(listId: string) {
  const userId = await requireAuth();
  const list = await db.query.readingLists.findFirst({
    where: and(eq(readingLists.id, listId), eq(readingLists.userId, userId)),
  });
  if (!list) throw new Error('Reading list not found or unauthorized');
  return { userId, list };
}

export async function getUserReadingListsAction() {
  const userId = await requireAuth();
  return db.query.readingLists.findMany({
    where: eq(readingLists.userId, userId),
    orderBy: (rl, { desc }) => [desc(rl.updatedAt)],
  });
}

export async function getLikedReadingListsAction() {
  const userId = await requireAuth();
  const likeRows = await db.query.readingListLikes.findMany({
    where: eq(readingListLikes.userId, userId),
    with: { list: true },
  });
  return likeRows
    .map((r) => r.list)
    .filter((l) => l.privacy === 'PUBLIC')
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

export async function getReadingListAction(listId: string) {
  const userId = await getOptionalUserId();

  const list = await db.query.readingLists.findFirst({
    where: eq(readingLists.id, listId),
    with: {
      books: { orderBy: (b, { asc }) => [asc(b.order)] },
      user: { columns: { username: true, image: true } },
    },
  });

  if (!list) return null;

  if (list.privacy === 'PRIVATE' && list.userId !== userId) return null;
  if (list.privacy === 'FRIENDS' && list.userId !== userId) return null;

  const [followRow, likeRow] = userId
    ? await Promise.all([
        db.query.readingListFollows.findFirst({
          where: and(
            eq(readingListFollows.userId, userId),
            eq(readingListFollows.listId, listId),
          ),
        }),
        db.query.readingListLikes.findFirst({
          where: and(
            eq(readingListLikes.userId, userId),
            eq(readingListLikes.listId, listId),
          ),
        }),
      ])
    : [null, null];

  const { user, ...listData } = list;
  return {
    ...listData,
    curator: { username: user?.username ?? null, image: user?.image ?? null },
    currentUserId: userId,
    isOwner: list.userId === userId,
    isFollowing: !!followRow,
    isLiked: !!likeRow,
  };
}

export async function followListAction(listId: string): Promise<ActionResult> {
  const userId = await requireAuth();
  try {
    const existing = await db.query.readingListFollows.findFirst({
      where: and(
        eq(readingListFollows.userId, userId),
        eq(readingListFollows.listId, listId),
      ),
    });
    if (existing) {
      await db.delete(readingListFollows).where(
        and(
          eq(readingListFollows.userId, userId),
          eq(readingListFollows.listId, listId),
        ),
      );
      await db
        .update(readingLists)
        .set({ followerCount: sql`GREATEST(${readingLists.followerCount} - 1, 0)` })
        .where(eq(readingLists.id, listId));
      return { success: true, message: 'Unfollowed.' };
    } else {
      await db.insert(readingListFollows).values({ userId, listId });
      await db
        .update(readingLists)
        .set({ followerCount: sql`${readingLists.followerCount} + 1` })
        .where(eq(readingLists.id, listId));
      return { success: true, message: 'Following.' };
    }
  } catch {
    return { success: false, message: 'Failed to update follow.' };
  }
}

export async function likeListAction(listId: string): Promise<ActionResult> {
  const userId = await requireAuth();
  try {
    const existing = await db.query.readingListLikes.findFirst({
      where: and(
        eq(readingListLikes.userId, userId),
        eq(readingListLikes.listId, listId),
      ),
    });
    if (existing) {
      await db.delete(readingListLikes).where(
        and(
          eq(readingListLikes.userId, userId),
          eq(readingListLikes.listId, listId),
        ),
      );
      await db
        .update(readingLists)
        .set({ likeCount: sql`GREATEST(${readingLists.likeCount} - 1, 0)` })
        .where(eq(readingLists.id, listId));
      return { success: true, message: 'Unliked.' };
    } else {
      await db.insert(readingListLikes).values({ userId, listId });
      await db
        .update(readingLists)
        .set({ likeCount: sql`${readingLists.likeCount} + 1` })
        .where(eq(readingLists.id, listId));
      return { success: true, message: 'Liked.' };
    }
  } catch {
    return { success: false, message: 'Failed to update like.' };
  }
}

export async function getListFollowStatusAction(
  listId: string,
): Promise<{ isFollowing: boolean; isLiked: boolean }> {
  const userId = await getOptionalUserId();
  if (!userId) return { isFollowing: false, isLiked: false };
  const [followRow, likeRow] = await Promise.all([
    db.query.readingListFollows.findFirst({
      where: and(
        eq(readingListFollows.userId, userId),
        eq(readingListFollows.listId, listId),
      ),
    }),
    db.query.readingListLikes.findFirst({
      where: and(
        eq(readingListLikes.userId, userId),
        eq(readingListLikes.listId, listId),
      ),
    }),
  ]);
  return { isFollowing: !!followRow, isLiked: !!likeRow };
}

export async function updateBookCommentaryAction(
  listId: string,
  bookId: string,
  commentary: string,
  rank?: number,
): Promise<ActionResult> {
  await requireListOwner(listId);
  try {
    await db
      .update(readingListBooks)
      .set({ commentary, ...(rank !== undefined ? { rank } : {}) })
      .where(
        and(
          eq(readingListBooks.id, bookId),
          eq(readingListBooks.readingListId, listId),
        ),
      );
    revalidatePath(`/reading-lists/${listId}`);
    return { success: true, message: 'Updated.' };
  } catch {
    return { success: false, message: 'Failed to update.' };
  }
}


export async function createReadingListAction(
  data: ReadingListFormData,
  initialBooks: BookEntryData[],
  currentlyReadingIdx: number | null = null,
): Promise<ActionResult & { listId?: string }> {
  const userId = await requireAuth();
  const limitError = await checkCreateLimit(userId, 'readingLists');
  if (limitError) return { success: false, message: limitError };
  const parsed = readingListSchema.safeParse(data);
  if (!parsed.success)
    return { success: false, message: parsed.error.issues[0].message };

  try {
    const [inserted] = await db
      .insert(readingLists)
      .values({ userId, ...parsed.data })
      .returning({ id: readingLists.id });

    if (initialBooks.length > 0) {
      const validBooks = initialBooks
        .map((b) => bookEntrySchema.safeParse(b))
        .filter((r) => r.success)
        .map((r) => r.data!);

      if (validBooks.length > 0) {
        const insertedBooks = await db
          .insert(readingListBooks)
          .values(
            validBooks.map((b, i) => ({
              readingListId: inserted.id,
              title: b.title,
              author: b.author,
              order: i + 1,
            })),
          )
          .returning({ id: readingListBooks.id });

        const crBook =
          currentlyReadingIdx !== null
            ? (validBooks[currentlyReadingIdx] ?? null)
            : null;
        const crId =
          currentlyReadingIdx !== null
            ? (insertedBooks[currentlyReadingIdx]?.id ?? null)
            : null;

        await db
          .update(readingLists)
          .set({
            bookCount: validBooks.length,
            currentlyReadingId: crId,
            currentlyReadingTitle: crBook?.title ?? null,
            currentlyReadingAuthor: crBook?.author ?? null,
          })
          .where(eq(readingLists.id, inserted.id));
      }
    }

    revalidatePath('/reading-lists');
    return {
      success: true,
      message: 'Reading list created.',
      listId: inserted.id,
    };
  } catch {
    return { success: false, message: 'Failed to create reading list.' };
  }
}

export async function updateReadingListAction(
  listId: string,
  data: ReadingListFormData,
): Promise<ActionResult> {
  await requireListOwner(listId);
  const parsed = readingListSchema.safeParse(data);
  if (!parsed.success)
    return { success: false, message: parsed.error.issues[0].message };

  try {
    await db
      .update(readingLists)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(readingLists.id, listId));
    revalidatePath(`/reading-lists/${listId}`);
    revalidatePath('/reading-lists');
    return { success: true, message: 'Reading list updated.' };
  } catch {
    return { success: false, message: 'Failed to update reading list.' };
  }
}

export async function deleteReadingListAction(
  listId: string,
): Promise<ActionResult> {
  await requireListOwner(listId);
  try {
    await db.delete(readingLists).where(eq(readingLists.id, listId));
    revalidatePath('/reading-lists');
    return { success: true, message: 'Reading list deleted.' };
  } catch {
    return { success: false, message: 'Failed to delete reading list.' };
  }
}

export async function addBookToListAction(
  listId: string,
  bookData: BookEntryData,
): Promise<ActionResult> {
  const { userId: ownerId, list } = await requireListOwner(listId);
  const parsed = bookEntrySchema.safeParse(bookData);
  if (!parsed.success)
    return { success: false, message: parsed.error.issues[0].message };

  try {
    const maxOrderResult = await db
      .select({ maxOrder: max(readingListBooks.order) })
      .from(readingListBooks)
      .where(eq(readingListBooks.readingListId, listId));
    const nextOrder = (maxOrderResult[0]?.maxOrder ?? 0) + 1;

    await db.insert(readingListBooks).values({
      readingListId: listId,
      ...parsed.data,
      order: nextOrder,
    });
    await db
      .update(readingLists)
      .set({
        bookCount: sql`${readingLists.bookCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(readingLists.id, listId));

    // Notify followers
    const followers = await db.query.readingListFollows.findMany({
      where: eq(readingListFollows.listId, listId),
      columns: { userId: true },
    });
    for (const follower of followers) {
      if (follower.userId === ownerId) continue;
      void insertNotification({
        recipientId: follower.userId,
        actorId: ownerId,
        type: 'READING_LIST_NEW_BOOK',
        link: `/reading-lists/${listId}`,
        metadata: { listTitle: list.title, bookTitle: parsed.data.title },
      });
    }

    revalidatePath(`/reading-lists/${listId}`);
    return { success: true, message: 'Book added.' };
  } catch {
    return { success: false, message: 'Failed to add book.' };
  }
}

export async function removeBookFromListAction(
  listId: string,
  bookId: string,
): Promise<ActionResult> {
  const { list } = await requireListOwner(listId);

  const book = await db.query.readingListBooks.findFirst({
    where: and(
      eq(readingListBooks.id, bookId),
      eq(readingListBooks.readingListId, listId),
    ),
  });
  if (!book) return { success: false, message: 'Book not found.' };

  const wasCR = list.currentlyReadingId === bookId;

  try {
    await db.delete(readingListBooks).where(eq(readingListBooks.id, bookId));
    await db
      .update(readingLists)
      .set({
        bookCount: sql`GREATEST(${readingLists.bookCount} - 1, 0)`,
        readCount: book.isRead
          ? sql`GREATEST(${readingLists.readCount} - 1, 0)`
          : readingLists.readCount,
        ...(wasCR
          ? {
              currentlyReadingId: null,
              currentlyReadingTitle: null,
              currentlyReadingAuthor: null,
            }
          : {}),
        updatedAt: new Date(),
      })
      .where(eq(readingLists.id, listId));

    revalidatePath(`/reading-lists/${listId}`);
    return { success: true, message: 'Book removed.' };
  } catch {
    return { success: false, message: 'Failed to remove book.' };
  }
}

export async function toggleBookReadStatusAction(
  listId: string,
  bookId: string,
  isRead: boolean,
): Promise<ActionResult> {
  await requireListOwner(listId);

  try {
    await db
      .update(readingListBooks)
      .set({ isRead })
      .where(
        and(
          eq(readingListBooks.id, bookId),
          eq(readingListBooks.readingListId, listId),
        ),
      );
    await db
      .update(readingLists)
      .set({
        readCount: isRead
          ? sql`${readingLists.readCount} + 1`
          : sql`GREATEST(${readingLists.readCount} - 1, 0)`,
        updatedAt: new Date(),
      })
      .where(eq(readingLists.id, listId));

    revalidatePath(`/reading-lists/${listId}`);
    return {
      success: true,
      message: isRead ? 'Marked as read.' : 'Marked as unread.',
    };
  } catch {
    return { success: false, message: 'Failed to update read status.' };
  }
}

export async function setCurrentlyReadingAction(
  listId: string,
  bookId: string | null,
): Promise<ActionResult> {
  await requireListOwner(listId);

  try {
    if (bookId === null) {
      await db
        .update(readingLists)
        .set({
          currentlyReadingId: null,
          currentlyReadingTitle: null,
          currentlyReadingAuthor: null,
          updatedAt: new Date(),
        })
        .where(eq(readingLists.id, listId));
    } else {
      const book = await db.query.readingListBooks.findFirst({
        where: and(
          eq(readingListBooks.id, bookId),
          eq(readingListBooks.readingListId, listId),
        ),
      });
      if (!book) return { success: false, message: 'Book not found.' };

      await db
        .update(readingLists)
        .set({
          currentlyReadingId: bookId,
          currentlyReadingTitle: book.title,
          currentlyReadingAuthor: book.author,
          updatedAt: new Date(),
        })
        .where(eq(readingLists.id, listId));
    }

    revalidatePath(`/reading-lists/${listId}`);
    revalidatePath('/reading-lists');
    return { success: true, message: 'Currently reading updated.' };
  } catch {
    return { success: false, message: 'Failed to update currently reading.' };
  }
}
