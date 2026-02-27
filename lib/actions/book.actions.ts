'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { and, eq, max, sql } from 'drizzle-orm';
import { db } from '@/db';
import {
  books,
  chapters,
  collections,
  chapterComments,
  commentLikes,
  users,
} from '@/db/schema';
import { bookSchema, type BookFormData } from '@/lib/validations/book.schema';
import {
  chapterSchema,
  type ChapterFormData,
} from '@/lib/validations/chapter.schema';
import { coverPublicId } from '@/lib/cloudinary';
import { deleteImageAction } from '@/lib/actions/cloudinary.actions';
import { insertNotification } from '@/lib/notifications';

export type ActionResult = { success: boolean; message: string };

async function requireAuth() {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  return userId;
}

async function requireBookOwner(bookId: string) {
  const userId = await requireAuth();
  const book = await db.query.books.findFirst({
    where: and(eq(books.id, bookId), eq(books.userId, userId)),
  });
  if (!book) throw new Error('Book not found or unauthorized');
  return { userId, book };
}

function countWords(html: string): number {
  return html
    .replace(/<[^>]+>/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export async function getUserBooksAction() {
  const userId = await requireAuth();
  return db.query.books.findMany({
    where: eq(books.userId, userId),
    orderBy: (b, { desc }) => [desc(b.createdAt)],
  });
}

export async function getBookWithChaptersAction(bookId: string) {
  const userId = await requireAuth();
  const book = await db.query.books.findFirst({
    where: and(eq(books.id, bookId), eq(books.userId, userId)),
    with: {
      chapters: { orderBy: (c, { asc }) => [asc(c.order)] },
      collections: { orderBy: (c, { asc }) => [asc(c.order)] },
    },
  });
  if (!book) throw new Error('Book not found or unauthorized');
  return book;
}

export async function createBookAction(
  data: BookFormData,
  coverUrl?: string,
  presetId?: string,
): Promise<ActionResult> {
  const userId = await requireAuth();
  const parsed = bookSchema.safeParse(data);
  if (!parsed.success)
    return { success: false, message: parsed.error.issues[0].message };

  try {
    await db.insert(books).values({
      ...(presetId ? { id: presetId } : {}),
      userId,
      ...parsed.data,
      coverUrl: coverUrl || null,
    });
    revalidatePath('/library');
    return { success: true, message: 'Book created.' };
  } catch {
    return { success: false, message: 'Failed to create book.' };
  }
}

export async function updateBookAction(
  bookId: string,
  data: BookFormData,
  coverUrl?: string | null,
): Promise<ActionResult> {
  const { book } = await requireBookOwner(bookId);
  const parsed = bookSchema.safeParse(data);
  if (!parsed.success)
    return { success: false, message: parsed.error.issues[0].message };

  if (book.coverUrl && coverUrl === null) {
    await deleteImageAction(coverPublicId(bookId));
  }

  try {
    await db
      .update(books)
      .set({
        ...parsed.data,
        coverUrl: coverUrl ?? book.coverUrl,
        updatedAt: new Date(),
      })
      .where(eq(books.id, bookId));
    revalidatePath(`/library/${bookId}`);
    revalidatePath('/library');
    return { success: true, message: 'Book updated.' };
  } catch {
    return { success: false, message: 'Failed to update book.' };
  }
}

export async function deleteBookAction(bookId: string): Promise<ActionResult> {
  const { book } = await requireBookOwner(bookId);

  if (book.coverUrl) {
    await deleteImageAction(coverPublicId(bookId));
  }

  try {
    await db.delete(books).where(eq(books.id, bookId));
    revalidatePath('/library');
    return { success: true, message: 'Book deleted.' };
  } catch {
    return { success: false, message: 'Failed to delete book.' };
  }
}

export async function getPublicBookAction(bookId: string) {
  const { userId } = await auth();

  const book = await db.query.books.findFirst({
    where: eq(books.id, bookId),
    with: {
      chapters: { orderBy: (c, { asc }) => [asc(c.order)] },
      collections: { orderBy: (c, { asc }) => [asc(c.order)] },
    },
  });
  if (!book) throw new Error('Book not found');

  if (book.privacy === 'PRIVATE' && book.userId !== userId) {
    throw new Error('This book is private');
  }
  if (book.privacy === 'FRIENDS' && book.userId !== userId) {
    throw new Error('This book is only available to friends');
  }

  return book;
}

export async function getChapterWithContextAction(chapterId: string) {
  const { userId } = await auth();

  const chapter = await db.query.chapters.findFirst({
    where: eq(chapters.id, chapterId),
    with: { book: true, collection: { columns: { name: true } } },
  });
  if (!chapter) throw new Error('Chapter not found');

  const { book } = chapter;
  if (book.privacy === 'PRIVATE' && book.userId !== userId)
    throw new Error('Unauthorized');
  if (book.privacy === 'FRIENDS' && book.userId !== userId)
    throw new Error('Unauthorized');

  const [allChapters, allCollections, comments] = await Promise.all([
    db.query.chapters.findMany({
      where: eq(chapters.bookId, book.id),
      orderBy: (c, { asc }) => [asc(c.order)],
      columns: { id: true, title: true, order: true, collectionId: true },
    }),
    db.query.collections.findMany({
      where: eq(collections.bookId, book.id),
      orderBy: (c, { asc }) => [asc(c.order)],
      columns: { id: true },
    }),
    db.query.chapterComments.findMany({
      where: and(
        eq(chapterComments.chapterId, chapterId),
        sql`${chapterComments.parentId} IS NULL`,
      ),
      orderBy: (c, { asc }) => [asc(c.createdAt)],
      with: {
        user: {
          columns: {
            username: true,
            imageUrl: true,
            firstName: true,
            lastName: true,
          },
        },
        replies: {
          with: {
            user: {
              columns: {
                username: true,
                imageUrl: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: (r, { asc }) => [asc(r.createdAt)],
        },
      },
    }),
  ]);
  const uncategorized = allChapters.filter((c) => !c.collectionId);
  const flatOrder = [
    ...uncategorized,
    ...allCollections.flatMap((col) =>
      allChapters.filter((c) => c.collectionId === col.id),
    ),
  ];

  const idx = flatOrder.findIndex((c) => c.id === chapterId);
  const prev = idx > 0 ? flatOrder[idx - 1] : null;
  const next = idx < flatOrder.length - 1 ? flatOrder[idx + 1] : null;

  const likedIds = userId
    ? (
        await db.query.commentLikes.findMany({
          where: eq(commentLikes.userId, userId),
        })
      ).map((l) => l.commentId)
    : [];

  const commentsWithLikes = comments.map((c) => ({
    ...c,
    likedByMe: likedIds.includes(c.id),
    replies: c.replies.map((r) => ({
      ...r,
      likedByMe: likedIds.includes(r.id),
    })),
  }));

  return {
    chapter,
    book,
    prev,
    next,
    comments: commentsWithLikes,
    currentUserId: userId,
  };
}

export async function createChapterAction(
  bookId: string,
  data: ChapterFormData,
): Promise<ActionResult & { chapterId?: string }> {
  await requireBookOwner(bookId);
  const parsed = chapterSchema.safeParse(data);
  if (!parsed.success)
    return { success: false, message: parsed.error.issues[0].message };

  const wordCount = parsed.data.content ? countWords(parsed.data.content) : 0;

  const maxOrderResult = await db
    .select({ maxOrder: max(chapters.order) })
    .from(chapters)
    .where(eq(chapters.bookId, bookId));
  const nextOrder = (maxOrderResult[0]?.maxOrder ?? 0) + 1;

  try {
    const [inserted] = await db
      .insert(chapters)
      .values({
        bookId,
        ...parsed.data,
        wordCount,
        order: nextOrder,
      })
      .returning({ id: chapters.id });
    await db
      .update(books)
      .set({
        chapterCount: sql`${books.chapterCount} + 1`,
        wordCount: sql`${books.wordCount} + ${wordCount}`,
        updatedAt: new Date(),
      })
      .where(eq(books.id, bookId));
    revalidatePath(`/library/${bookId}`);
    return { success: true, message: 'Chapter added.', chapterId: inserted.id };
  } catch {
    return { success: false, message: 'Failed to create chapter.' };
  }
}

export async function updateChapterAction(
  bookId: string,
  chapterId: string,
  data: ChapterFormData,
): Promise<ActionResult> {
  await requireBookOwner(bookId);
  const parsed = chapterSchema.safeParse(data);
  if (!parsed.success)
    return { success: false, message: parsed.error.issues[0].message };

  const existing = await db.query.chapters.findFirst({
    where: and(eq(chapters.id, chapterId), eq(chapters.bookId, bookId)),
  });
  if (!existing) return { success: false, message: 'Chapter not found.' };

  const newWordCount = parsed.data.content
    ? countWords(parsed.data.content)
    : 0;
  const wordCountDiff = newWordCount - existing.wordCount;

  try {
    await db
      .update(chapters)
      .set({ ...parsed.data, wordCount: newWordCount, updatedAt: new Date() })
      .where(eq(chapters.id, chapterId));
    if (wordCountDiff !== 0) {
      await db
        .update(books)
        .set({
          wordCount: sql`${books.wordCount} + ${wordCountDiff}`,
          updatedAt: new Date(),
        })
        .where(eq(books.id, bookId));
    }
    revalidatePath(`/library/${bookId}/${chapterId}`);
    revalidatePath(`/library/${bookId}`);
    return { success: true, message: 'Chapter updated.' };
  } catch {
    return { success: false, message: 'Failed to update chapter.' };
  }
}

export async function deleteChapterAction(
  bookId: string,
  chapterId: string,
): Promise<ActionResult> {
  await requireBookOwner(bookId);

  const chapter = await db.query.chapters.findFirst({
    where: and(eq(chapters.id, chapterId), eq(chapters.bookId, bookId)),
  });
  if (!chapter) return { success: false, message: 'Chapter not found.' };

  try {
    await db.delete(chapters).where(eq(chapters.id, chapterId));
    await db
      .update(books)
      .set({
        chapterCount: sql`${books.chapterCount} - 1`,
        wordCount: sql`${books.wordCount} - ${chapter.wordCount}`,
        updatedAt: new Date(),
      })
      .where(eq(books.id, bookId));
    revalidatePath(`/library/${bookId}`);
    return { success: true, message: 'Chapter deleted.' };
  } catch {
    return { success: false, message: 'Failed to delete chapter.' };
  }
}

export async function reorderChaptersAction(
  bookId: string,
  orderedIds: string[],
): Promise<ActionResult> {
  await requireBookOwner(bookId);
  try {
    await Promise.all(
      orderedIds.map((id, index) =>
        db
          .update(chapters)
          .set({ order: index + 1 })
          .where(eq(chapters.id, id)),
      ),
    );
    revalidatePath(`/library/${bookId}`);
    return { success: true, message: 'Chapters reordered.' };
  } catch {
    return { success: false, message: 'Failed to reorder chapters.' };
  }
}

/* ─── Collection Actions ───────────────────────────────────────────────────── */

export async function reorderCollectionsAction(
  bookId: string,
  orderedIds: string[],
): Promise<ActionResult> {
  await requireBookOwner(bookId);
  try {
    await Promise.all(
      orderedIds.map((id, index) =>
        db
          .update(collections)
          .set({ order: index + 1 })
          .where(eq(collections.id, id)),
      ),
    );
    revalidatePath(`/library/${bookId}`);
    return { success: true, message: 'Collections reordered.' };
  } catch {
    return { success: false, message: 'Failed to reorder collections.' };
  }
}

export async function createCollectionAction(
  bookId: string,
  name: string,
): Promise<ActionResult> {
  await requireBookOwner(bookId);
  const maxOrderResult = await db
    .select({ maxOrder: max(collections.order) })
    .from(collections)
    .where(eq(collections.bookId, bookId));
  const nextOrder = (maxOrderResult[0]?.maxOrder ?? 0) + 1;

  try {
    await db
      .insert(collections)
      .values({ bookId, name: name.trim(), order: nextOrder });
    revalidatePath(`/library/${bookId}`);
    return { success: true, message: 'Collection created.' };
  } catch {
    return { success: false, message: 'Failed to create collection.' };
  }
}

export async function updateCollectionAction(
  bookId: string,
  collectionId: string,
  name: string,
): Promise<ActionResult> {
  await requireBookOwner(bookId);
  try {
    await db
      .update(collections)
      .set({ name: name.trim() })
      .where(
        and(eq(collections.id, collectionId), eq(collections.bookId, bookId)),
      );
    revalidatePath(`/library/${bookId}`);
    return { success: true, message: 'Collection updated.' };
  } catch {
    return { success: false, message: 'Failed to update collection.' };
  }
}

export async function deleteCollectionAction(
  bookId: string,
  collectionId: string,
): Promise<ActionResult> {
  await requireBookOwner(bookId);
  try {
    const toDelete = await db.query.chapters.findMany({
      where: eq(chapters.collectionId, collectionId),
      columns: { wordCount: true },
    });
    const removedWords = toDelete.reduce((sum, c) => sum + c.wordCount, 0);
    const removedCount = toDelete.length;

    await db.delete(chapters).where(eq(chapters.collectionId, collectionId));

    if (removedCount > 0) {
      await db
        .update(books)
        .set({
          chapterCount: sql`GREATEST(${books.chapterCount} - ${removedCount}, 0)`,
          wordCount: sql`GREATEST(${books.wordCount} - ${removedWords}, 0)`,
          updatedAt: new Date(),
        })
        .where(eq(books.id, bookId));
    }

    await db.delete(collections).where(eq(collections.id, collectionId));
    revalidatePath(`/library/${bookId}`);
    return { success: true, message: 'Collection deleted.' };
  } catch {
    return { success: false, message: 'Failed to delete collection.' };
  }
}

export async function assignChapterToCollectionAction(
  bookId: string,
  chapterId: string,
  collectionId: string | null,
): Promise<ActionResult> {
  await requireBookOwner(bookId);
  try {
    await db
      .update(chapters)
      .set({ collectionId })
      .where(and(eq(chapters.id, chapterId), eq(chapters.bookId, bookId)));
    revalidatePath(`/library/${bookId}`);
    return { success: true, message: 'Chapter moved.' };
  } catch {
    return { success: false, message: 'Failed to move chapter.' };
  }
}

/* ─── Comment Actions ──────────────────────────────────────────────────────── */

export async function addCommentAction(
  chapterId: string,
  content: string,
  parentId?: string | null,
): Promise<ActionResult> {
  const userId = await requireAuth();

  const chapter = await db.query.chapters.findFirst({
    where: eq(chapters.id, chapterId),
    with: { book: true },
  });
  if (!chapter) return { success: false, message: 'Chapter not found.' };

  const { book } = chapter;
  if (book.privacy === 'PRIVATE' && book.userId !== userId) {
    return { success: false, message: 'Unauthorized.' };
  }

  try {
    await db.insert(chapterComments).values({
      chapterId,
      userId,
      content: content.trim(),
      parentId: parentId ?? null,
    });
    await db
      .update(chapters)
      .set({ commentCount: sql`${chapters.commentCount} + 1` })
      .where(eq(chapters.id, chapterId));
    await db
      .update(books)
      .set({ commentCount: sql`${books.commentCount} + 1` })
      .where(eq(books.id, book.id));

    const actor = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
      columns: { username: true },
    });
    const link = `/library/${book.id}/${chapterId}`;
    const meta = {
      actorUsername: actor?.username ?? '',
      bookId: book.id,
      chapterId,
    };

    if (parentId) {
      const parent = await db.query.chapterComments.findFirst({
        where: eq(chapterComments.id, parentId),
        columns: { userId: true },
      });
      if (parent) {
        void insertNotification({
          recipientId: parent.userId,
          actorId: userId,
          type: 'COMMENT_REPLY',
          link,
          metadata: meta,
        });
      }
    } else {
      void insertNotification({
        recipientId: book.userId,
        actorId: userId,
        type: 'CHAPTER_COMMENT',
        link,
        metadata: meta,
      });
    }

    revalidatePath(`/library/${book.id}/${chapterId}`);
    return { success: true, message: 'Comment added.' };
  } catch {
    return { success: false, message: 'Failed to add comment.' };
  }
}

export async function toggleCommentLikeAction(
  commentId: string,
): Promise<{ success: boolean; liked: boolean }> {
  const userId = await requireAuth();

  const existing = await db.query.commentLikes.findFirst({
    where: and(
      eq(commentLikes.userId, userId),
      eq(commentLikes.commentId, commentId),
    ),
  });

  const comment = await db.query.chapterComments.findFirst({
    where: eq(chapterComments.id, commentId),
    columns: { userId: true, chapterId: true },
    with: { chapter: { columns: { bookId: true } } },
  });

  try {
    if (existing) {
      await db
        .delete(commentLikes)
        .where(
          and(
            eq(commentLikes.userId, userId),
            eq(commentLikes.commentId, commentId),
          ),
        );
      await db
        .update(chapterComments)
        .set({
          likeCount: sql`GREATEST(${chapterComments.likeCount} - 1, 0)`,
        })
        .where(eq(chapterComments.id, commentId));
      return { success: true, liked: false };
    } else {
      await db.insert(commentLikes).values({ userId, commentId });
      await db
        .update(chapterComments)
        .set({ likeCount: sql`${chapterComments.likeCount} + 1` })
        .where(eq(chapterComments.id, commentId));
      if (comment) {
        const actor = await db.query.users.findFirst({
          where: eq(users.clerkId, userId),
          columns: { username: true },
        });
        void insertNotification({
          recipientId: comment.userId,
          actorId: userId,
          type: 'COMMENT_LIKE',
          link: `/library/${comment.chapter.bookId}/${comment.chapterId}`,
          metadata: {
            actorUsername: actor?.username ?? '',
            bookId: comment.chapter.bookId,
            chapterId: comment.chapterId,
          },
        });
      }
      return { success: true, liked: true };
    }
  } catch {
    return { success: false, liked: !!existing };
  }
}
