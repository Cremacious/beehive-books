'use server';

import { requireAuth, getOptionalUserId } from '@/lib/require-auth';

import { revalidatePath } from 'next/cache';
import { checkCreateLimit } from '@/lib/premium';
import { and, eq, max, sql } from 'drizzle-orm';
import { db } from '@/db';
import { readingLists, readingListBooks } from '@/db/schema';
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

export async function getReadingListAction(listId: string) {
  const userId = await requireAuth();

  const list = await db.query.readingLists.findFirst({
    where: eq(readingLists.id, listId),
    with: {
      books: { orderBy: (b, { asc }) => [asc(b.order)] },
    },
  });

  if (!list) return null;

  if (list.privacy === 'PRIVATE' && list.userId !== userId) return null;
  if (list.privacy === 'FRIENDS' && list.userId !== userId) return null;

  return { ...list, currentUserId: userId, isOwner: list.userId === userId };
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
  await requireListOwner(listId);
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
