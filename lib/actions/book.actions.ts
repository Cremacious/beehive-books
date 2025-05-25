'use server';
import { z } from 'zod';
import {
  bookCreationFormSchema,
  chapterCreationFormSchema,
} from '../validators/bookCreation';
import { formatError } from '../utils';
import { auth } from '../config/auth';
import prisma from '../config/prisma';
import { revalidatePath } from 'next/cache';
import { bookSelect } from '../constants';

export async function createNewBook(
  data: z.infer<typeof bookCreationFormSchema>
) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error('Session not found');
    }
    const userId = session.user?.id;
    if (!userId) {
      throw new Error('User not found');
    }
    const existingUser = prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!existingUser) {
      throw new Error('User not found');
    }
    const bookData = bookCreationFormSchema.parse(data);
    await prisma.book.create({
      data: {
        ...bookData,
        userId: userId,
      },
    });
    return {
      success: true,
      message: `${bookData.title} created!`,
    };
  } catch (error) {
    return { success: false, message: `${formatError(error)}` };
  }
}

export async function getAllUserBooks() {
  try {
    const session = await auth();
    if (!session) {
      throw new Error('Session not found');
    }
    const userId = session.user?.id;
    if (!userId) {
      throw new Error('User not found');
    }
    const existingUser = prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!existingUser) {
      throw new Error('User not found');
    }
    const books = await prisma.book.findMany({
      where: {
        userId: userId,
      },
      select: bookSelect,
    });

    return books;
  } catch {
    return [];
  }
}

export async function getAllBooksByUserId(userId: string) {
  try {
    const books = await prisma.book.findMany({
      where: {
        userId: userId,
      },
    });
    return books;
  } catch {
    return [];
  }
}

export async function getBookById(bookId: string) {
  try {
    const book = await prisma.book.findUnique({
      where: {
        id: bookId,
      },
      include: {
        chapters: true,
      },
    });
    return book;
  } catch {
    return null;
  }
}

export async function addChapterToBook(
  bookId: string,
  chapterData: z.infer<typeof chapterCreationFormSchema>
) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error('Session not found');
    }
    const userId = session.user?.id;
    if (!userId) {
      throw new Error('User not found');
    }

    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });
    if (!book) {
      throw new Error('Book not found');
    }
    if (book.userId !== userId) {
      throw new Error(
        'You do not have permission to add chapters to this book.'
      );
    }

    const chapterDataParsed = chapterCreationFormSchema.parse(chapterData);
    await prisma.chapter.create({
      data: {
        ...chapterDataParsed,
        bookId: bookId,
      },
    });
    return {
      success: true,
      message: `Chapter ${chapterDataParsed.title} added to ${book.title}!`,
    };
  } catch (error) {
    return { success: false, message: `${formatError(error)}` };
  }
}

export async function editChapter(
  chapterId: string,
  formData: z.infer<typeof chapterCreationFormSchema>
) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error('Session not found');
    }
    const userId = session.user?.id;
    if (!userId) {
      throw new Error('User not found');
    }
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { book: true },
    });
    if (!chapter) {
      throw new Error('Chapter not found');
    }
    if (chapter.book.userId !== userId) {
      throw new Error('You do not have permission to edit this chapter.');
    }

    const chapterData = chapterCreationFormSchema.parse(formData);
    await prisma.chapter.update({
      where: { id: chapterId },
      data: { ...chapterData },
    });
    revalidatePath(`/books/${chapterId}`);
    return {
      success: true,
      message: `Chapter ${chapterData.title} updated!`,
    };
  } catch (error) {
    return { success: false, message: `${formatError(error)}` };
  }
}

export async function getChapterById(chapterId: string) {
  try {
    const chapter = await prisma.chapter.findUnique({
      where: {
        id: chapterId,
      },
    });
    return chapter;
  } catch {
    return null;
  }
}

export async function deleteChapter(chapterId: string) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error('Session not found');
    }
    const userId = session.user?.id;
    if (!userId) {
      throw new Error('User not found');
    }
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { book: true },
    });
    if (!chapter) {
      throw new Error('Chapter not found');
    }
    if (chapter.book.userId !== userId) {
      throw new Error('You do not have permission to delete this chapter.');
    }

    await prisma.chapter.delete({
      where: { id: chapterId },
    });
    return {
      success: true,
      message: `Chapter ${chapter.title} deleted!`,
    };
  } catch (error) {
    return { success: false, message: `${formatError(error)}` };
  }
}

export async function deleteBook(bookId: string) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error('Session not found');
    }
    const userId = session.user?.id;
    if (!userId) {
      throw new Error('User not found');
    }
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: { chapters: true },
    });
    if (!book) {
      throw new Error('Book not found');
    }
    if (book.userId !== userId) {
      throw new Error('You do not have permission to delete this book.');
    }

    await prisma.chapter.deleteMany({
      where: { bookId: bookId },
    });
    await prisma.book.delete({
      where: { id: bookId },
    });
    return {
      success: true,
      message: `Book ${book.title} deleted!`,
    };
  } catch (error) {
    return { success: false, message: `${formatError(error)}` };
  }
}
