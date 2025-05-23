'use server';
import { z } from 'zod';
import { bookCreationFormSchema } from '../validators/bookCreation';
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
