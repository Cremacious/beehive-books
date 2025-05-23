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
    console.log(data);
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
      message: 'Book created successfully',
    };
  } catch (error) {
    return { success: false, message: `${formatError(error)}` };
  }
}
