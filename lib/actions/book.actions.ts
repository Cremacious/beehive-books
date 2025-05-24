'use server';
import { z } from 'zod';
import {
  bookCreationFormSchema,
  chapterCreationFormSchema,
} from '../validators/bookCreation';
import { formatError } from '../utils';
import { auth } from '../config/auth';
import prisma from '../config/prisma';

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
    const existingUser = prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!existingUser) {
      throw new Error('User not found');
    }
    const book = await prisma.book.findUnique({
      where: {
        id: bookId,
      },
    });
    if (!book) {
      throw new Error('Book not found');
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
