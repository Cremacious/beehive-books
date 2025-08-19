'use server';

import prisma from '../prisma';
import { bookSchema, chapterSchema } from '../validators/book.validators';
import { z } from 'zod';
import { getAuthenticatedUser } from '../types/server-utils';
import { revalidatePath } from 'next/cache';

export async function createBook(data: z.infer<typeof bookSchema>) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) throw new Error(error);
    if (!user) throw new Error('User not found');

    const existingUser = await prisma.user.findUnique({
      where: { id: user.id },
    });
    if (!existingUser) throw new Error('User not found');

    const parsedData = bookSchema.parse(data);

    let coverBuffer: Buffer | undefined = undefined;
    if (parsedData.coverImageBase64) {
      const base64Part = parsedData.coverImageBase64.includes(',')
        ? parsedData.coverImageBase64.split(',')[1]
        : parsedData.coverImageBase64;
      coverBuffer = Buffer.from(base64Part, 'base64');
    }

    await prisma.book.create({
      data: {
        title: parsedData.title,
        author: parsedData.author,
        genre: parsedData.genre ?? undefined,
        category: parsedData.category ?? undefined,
        description: parsedData.description ?? undefined,
        privacy: parsedData.privacy,
        userId: existingUser.id,
        coverImage: coverBuffer,
      },
    });

    revalidatePath('/books');
    return { success: true, message: 'Book created successfully' };
  } catch (error) {
    console.error('Error creating book:', error);
    return { success: false, message: 'Failed to create book' };
  }
}

export async function getUserBooksById(userId: string) {
  try {
    const books = await prisma.book.findMany({
      where: { userId },
      include: {
        chapters: {
          orderBy: { id: 'asc' },
        },
        comments: {
          include: {
            author: true,
            replies: {
              include: { author: true },
            },
          },
        },
        collaborators: true,
      },
      orderBy: { id: 'asc' },
    });

    const mapped = books.map((b: any) => {
      const cover = b.coverImage
        ? `data:image/jpeg;base64,${Buffer.from(b.coverImage).toString(
            'base64'
          )}`
        : undefined;

      return {
        id: b.id,
        title: b.title,
        author: b.author,
        genre: b.genre ?? undefined,
        category: b.category ?? undefined,
        description: b.description ?? undefined,
        privacy: b.privacy,
        cover,
        lastEditedBy: b.lastEditedBy ?? undefined,
        createdAt:
          b.createdAt instanceof Date ? b.createdAt.toISOString() : b.createdAt,
        publishedAt: b.publishedAt
          ? b.publishedAt instanceof Date
            ? b.publishedAt.toISOString()
            : String(b.publishedAt)
          : undefined,
        updatedAt:
          b.updatedAt instanceof Date ? b.updatedAt.toISOString() : b.updatedAt,
        status: b.status,
        wordCount: b.wordCount,
        userId: b.userId,
        chapters: (b.chapters ?? []).map((ch: any) => ({
          id: ch.id,
          author: ch.author ? String(ch.author) : undefined,
          title: ch.title,
          notes: ch.notes ?? undefined,
          content: ch.content,
          privacy: ch.privacy,
          createdAt:
            ch.createdAt instanceof Date
              ? ch.createdAt.toISOString()
              : ch.createdAt,
          updatedAt:
            ch.updatedAt instanceof Date
              ? ch.updatedAt.toISOString()
              : ch.updatedAt,
          status: ch.status,
          wordCount: ch.wordCount,
          comments: (ch.comments ?? []).map((c: any) => ({
            id: c.id,
            authorId: c.authorId ? String(c.authorId) : '',
            content: c.content,
            createdAt:
              c.createdAt instanceof Date
                ? c.createdAt.toISOString()
                : c.createdAt,
            chapterId: c.chapterId,
            bookId: c.bookId ?? undefined,
            parentId: c.parentId ?? undefined,
            author: c.author
              ? { id: String(c.author.id), name: c.author.name }
              : { id: '', name: '' },
            replies: (c.replies ?? []).map((r: any) => ({
              id: r.id,
              authorId: r.authorId ? String(r.authorId) : '',
              content: r.content,
              createdAt:
                r.createdAt instanceof Date
                  ? r.createdAt.toISOString()
                  : r.createdAt,
              chapterId: r.chapterId,
              bookId: r.bookId ?? undefined,
              parentId: r.parentId ?? undefined,
              author: r.author
                ? { id: String(r.author.id), name: r.author.name }
                : { id: '', name: '' },
              replies: [],
            })),
          })),
        })),
        comments: (b.comments ?? []).map((c: any) => ({
          id: c.id,
          authorId: c.authorId ? String(c.authorId) : '',
          content: c.content,
          createdAt:
            c.createdAt instanceof Date
              ? c.createdAt.toISOString()
              : c.createdAt,
          chapterId: c.chapterId,
          bookId: c.bookId ?? undefined,
          parentId: c.parentId ?? undefined,
          author: c.author
            ? { id: String(c.author.id), name: c.author.name }
            : { id: '', name: '' },
          replies: (c.replies ?? []).map((r: any) => ({
            id: r.id,
            authorId: r.authorId ? String(r.authorId) : '',
            content: r.content,
            createdAt:
              r.createdAt instanceof Date
                ? r.createdAt.toISOString()
                : r.createdAt,
            chapterId: r.chapterId,
            bookId: r.bookId ?? undefined,
            parentId: r.parentId ?? undefined,
            author: r.author
              ? { id: String(r.author.id), name: r.author.name }
              : { id: '', name: '' },
            replies: [],
          })),
        })),
        collaborators: (b.collaborators ?? []).map((u: any) => ({
          id: String(u.id),
          name: u.name,
        })),
      };
    });

    return mapped;
  } catch (error) {
    console.error('Error fetching user books:', error);
    return [];
  }
}

export async function getBookById(bookId: string) {
  try {
    // Defensive validation: ensure we have a usable id for Prisma.
    if (
      bookId === undefined ||
      bookId === null ||
      String(bookId).trim() === ''
    ) {
      console.error('getBookById called without bookId');
      return null;
    }

    // Try to parse numeric id. If your schema uses Int for book.id this must be numeric.
    const idNum = Number(bookId);
    if (Number.isNaN(idNum)) {
      console.error(
        'getBookById received a non-numeric bookId while the DB expects an Int:',
        bookId
      );
      return null;
    }

    const book = await prisma.book.findUnique({
      where: { id: idNum },
      include: {
        chapters: {
          orderBy: { id: 'asc' },
        },
        comments: {
          include: {
            author: true,
            replies: { include: { author: true } },
          },
        },
        collaborators: true,
      },
    });

    if (!book) throw new Error('Book not found');

    const cover = book.coverImage
      ? `data:image/jpeg;base64,${Buffer.from(book.coverImage).toString(
          'base64'
        )}`
      : undefined;

    const mapped = {
      id: book.id,
      title: book.title,
      author: book.author,
      genre: book.genre ?? undefined,
      category: book.category ?? undefined,
      description: book.description ?? undefined,
      privacy: book.privacy,
      cover,
      lastEditedBy: book.lastEditedBy ?? undefined,
      createdAt:
        book.createdAt instanceof Date
          ? book.createdAt.toISOString()
          : book.createdAt,
      publishedAt: book.publishedAt
        ? book.publishedAt instanceof Date
          ? book.publishedAt.toISOString()
          : String(book.publishedAt)
        : undefined,
      updatedAt:
        book.updatedAt instanceof Date
          ? book.updatedAt.toISOString()
          : book.updatedAt,
      status: book.status,
      wordCount: book.wordCount,
      userId: book.userId,
      chapters:
        (book.chapters ?? []).map((ch: any) => ({
          id: ch.id,
          author: ch.author,
          title: ch.title,
          notes: ch.notes ?? undefined,
          content: ch.content,
          privacy: ch.privacy,
          createdAt:
            ch.createdAt instanceof Date
              ? ch.createdAt.toISOString()
              : ch.createdAt,
          updatedAt:
            ch.updatedAt instanceof Date
              ? ch.updatedAt.toISOString()
              : ch.updatedAt,
          status: ch.status,
          wordCount: ch.wordCount,
          comments:
            (ch.comments ?? []).map((c: any) => ({
              id: c.id,
              authorId: String(c.authorId),
              content: c.content,
              createdAt:
                c.createdAt instanceof Date
                  ? c.createdAt.toISOString()
                  : c.createdAt,
              chapterId: c.chapterId,
              bookId: c.bookId ?? undefined,
              parentId: c.parentId ?? undefined,
              author: c.author
                ? { id: String(c.author.id), name: c.author.name }
                : { id: '', name: '' },
              replies:
                (c.replies ?? []).map((r: any) => ({
                  id: r.id,
                  authorId: String(r.authorId),
                  content: r.content,
                  createdAt:
                    r.createdAt instanceof Date
                      ? r.createdAt.toISOString()
                      : r.createdAt,
                  chapterId: r.chapterId,
                  bookId: r.bookId ?? undefined,
                  parentId: r.parentId ?? undefined,
                  author: r.author
                    ? { id: String(r.author.id), name: r.author.name }
                    : { id: '', name: '' },
                  replies: [],
                })) ?? [],
            })) ?? [],
        })) ?? [],
      comments:
        (book.comments ?? []).map((c: any) => ({
          id: c.id,
          authorId: String(c.authorId),
          content: c.content,
          createdAt:
            c.createdAt instanceof Date
              ? c.createdAt.toISOString()
              : c.createdAt,
          chapterId: c.chapterId,
          bookId: c.bookId ?? undefined,
          parentId: c.parentId ?? undefined,
          author: c.author
            ? { id: String(c.author.id), name: c.author.name }
            : { id: '', name: '' },
          replies:
            (c.replies ?? []).map((r: any) => ({
              id: r.id,
              authorId: String(r.authorId),
              content: r.content,
              createdAt:
                r.createdAt instanceof Date
                  ? r.createdAt.toISOString()
                  : r.createdAt,
              chapterId: r.chapterId,
              bookId: r.bookId ?? undefined,
              parentId: r.parentId ?? undefined,
              author: r.author
                ? { id: String(r.author.id), name: r.author.name }
                : { id: '', name: '' },
              replies: [],
            })) ?? [],
        })) ?? [],
      collaborators: (book.collaborators ?? []).map((u: any) => ({
        id: String(u.id),
        name: u.name,
      })),
    };

    return mapped;
  } catch (error) {
    console.error('Error fetching book by id:', error);
    return null;
  }
}

export async function getFriendsBooks() {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) throw new Error(error);
    if (!user) throw new Error('User not found');

    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [{ userId: user.id }, { friendId: user.id }],
      },
    });

    const friendIds = friendships.map((f) =>
      f.userId === user.id ? f.friendId : f.userId
    );

    if (friendIds.length === 0) return [];

    const books = await prisma.book.findMany({
      where: {
        userId: { in: friendIds },
        privacy: 'public',
      },
      include: {
        user: true,
        chapters: { orderBy: { id: 'asc' } },
        comments: {
          include: { author: true, replies: { include: { author: true } } },
        },
        collaborators: true,
      },
      orderBy: { id: 'asc' },
    });

    const mapped = books.map((b: any) => {
      const cover = b.coverImage
        ? `data:image/jpeg;base64,${Buffer.from(b.coverImage).toString(
            'base64'
          )}`
        : undefined;

      return {
        id: b.id,
        title: b.title,
        author: b.author,
        genre: b.genre ?? undefined,
        category: b.category ?? undefined,
        description: b.description ?? undefined,
        privacy: b.privacy,
        cover,
        lastEditedBy: b.lastEditedBy ?? undefined,
        createdAt:
          b.createdAt instanceof Date ? b.createdAt.toISOString() : b.createdAt,
        publishedAt: b.publishedAt
          ? b.publishedAt instanceof Date
            ? b.publishedAt.toISOString()
            : String(b.publishedAt)
          : undefined,
        updatedAt:
          b.updatedAt instanceof Date ? b.updatedAt.toISOString() : b.updatedAt,
        status: b.status,
        wordCount: b.wordCount,
        userId: b.userId,
        user: b.user ? { id: String(b.user.id), name: b.user.name } : undefined,
        chapters: (b.chapters ?? []).map((ch: any) => ({
          id: ch.id,
          author: ch.author ? String(ch.author) : undefined,
          title: ch.title,
          notes: ch.notes ?? undefined,
          content: ch.content,
          privacy: ch.privacy,
          createdAt:
            ch.createdAt instanceof Date
              ? ch.createdAt.toISOString()
              : ch.createdAt,
          updatedAt:
            ch.updatedAt instanceof Date
              ? ch.updatedAt.toISOString()
              : ch.updatedAt,
          status: ch.status,
          wordCount: ch.wordCount,
          comments: (ch.comments ?? []).map((c: any) => ({
            id: c.id,
            authorId: c.authorId ? String(c.authorId) : '',
            content: c.content,
            createdAt:
              c.createdAt instanceof Date
                ? c.createdAt.toISOString()
                : c.createdAt,
            chapterId: c.chapterId,
            bookId: c.bookId ?? undefined,
            parentId: c.parentId ?? undefined,
            author: c.author
              ? { id: String(c.author.id), name: c.author.name }
              : { id: '', name: '' },
            replies: (c.replies ?? []).map((r: any) => ({
              id: r.id,
              authorId: r.authorId ? String(r.authorId) : '',
              content: r.content,
              createdAt:
                r.createdAt instanceof Date
                  ? r.createdAt.toISOString()
                  : r.createdAt,
              chapterId: r.chapterId,
              bookId: r.bookId ?? undefined,
              parentId: r.parentId ?? undefined,
              author: r.author
                ? { id: String(r.author.id), name: r.author.name }
                : { id: '', name: '' },
              replies: [],
            })),
          })),
        })),
        comments: (b.comments ?? []).map((c: any) => ({
          id: c.id,
          authorId: c.authorId ? String(c.authorId) : '',
          content: c.content,
          createdAt:
            c.createdAt instanceof Date
              ? c.createdAt.toISOString()
              : c.createdAt,
          chapterId: c.chapterId,
          bookId: c.bookId ?? undefined,
          parentId: c.parentId ?? undefined,
          author: c.author
            ? { id: String(c.author.id), name: c.author.name }
            : { id: '', name: '' },
          replies: (c.replies ?? []).map((r: any) => ({
            id: r.id,
            authorId: r.authorId ? String(r.authorId) : '',
            content: r.content,
            createdAt:
              r.createdAt instanceof Date
                ? r.createdAt.toISOString()
                : r.createdAt,
            chapterId: r.chapterId,
            bookId: r.bookId ?? undefined,
            parentId: r.parentId ?? undefined,
            author: r.author
              ? { id: String(r.author.id), name: r.author.name }
              : { id: '', name: '' },
            replies: [],
          })),
        })),
        collaborators: (b.collaborators ?? []).map((u: any) => ({
          id: String(u.id),
          name: u.name,
        })),
      };
    });

    return mapped;
  } catch (error) {
    console.error('Error fetching friends books:', error);
    return [];
  }
}

export async function createChapter(
  bookId: string,
  data: z.infer<typeof chapterSchema>
) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) throw new Error(error);
    if (!user) throw new Error('User not found');

    const book = await prisma.book.findUnique({
      where: { id: Number(bookId) },
      include: { user: true },
    });

    if (!book) throw new Error('Book not found');
    if (book.userId !== user.id) throw new Error('Unauthorized');

    const parsedData = chapterSchema.parse(data);

    const chapter = await prisma.chapter.create({
      data: {
        title: parsedData.title,
        content: parsedData.content,
        bookId: book.id,
        author: user.id,
        privacy: parsedData.privacy ?? 'public',
      },
    });

    revalidatePath(`/books/${bookId}`);
    return { success: true, message: 'Chapter created successfully', chapter };
  } catch (error) {
    console.error('Error creating chapter:', error);
    return { success: false, message: 'Failed to create chapter' };
  }
}

export async function getChapterById({ chapterId }: { chapterId: string }) {
  try {
    const chapter = await prisma.chapter.findUnique({
      where: { id: Number(chapterId) },
      include: {
        book: {
          include: {
            user: true,
            comments: { include: { author: true } },
            collaborators: true,
          
          },
        },
        comments: {
          include: { author: true, replies: { include: { author: true } } },
        },
      },
    });

    if (!chapter) throw new Error('Chapter not found');

    return {
      id: chapter.id,
      bookId: chapter.bookId,
      author: chapter.author,
      title: chapter.title,
      notes: chapter.notes ?? undefined,
      content: chapter.content,
      privacy: chapter.privacy,
      createdAt:
        chapter.createdAt instanceof Date
          ? chapter.createdAt.toISOString()
          : chapter.createdAt,
      updatedAt:
        chapter.updatedAt instanceof Date
          ? chapter.updatedAt.toISOString()
          : chapter.updatedAt,
      status: chapter.status,
      wordCount: chapter.wordCount,
      comments:
        chapter.comments?.map((c: any) => ({
          id: c.id,
          authorId: c.authorId,
          content: c.content,
          createdAt:
            c.createdAt instanceof Date
              ? c.createdAt.toISOString()
              : c.createdAt,
          chapterId: c.chapterId,
          bookId: c.bookId ?? undefined,
          parentId: c.parentId ?? undefined,
          author: c.author
            ? { id: c.author.id, name: c.author.name }
            : { id: '', name: '' },
          replies:
            (c.replies ?? []).map((r: any) => ({
              id: r.id,
              authorId: r.authorId,
              content: r.content,
              createdAt:
                r.createdAt instanceof Date
                  ? r.createdAt.toISOString()
                  : r.createdAt,
              chapterId: r.chapterId,
              bookId: r.bookId ?? undefined,
              parentId: r.parentId ?? undefined,
              author: r.author
                ? { id: r.author.id, name: r.author.name }
                : { id: '', name: '' },
              replies: [],
            })) ?? [],
        })) ?? [],
    };
  } catch (error) {
    console.error('Error fetching chapter by id:', error);
    return null;
  }
}
