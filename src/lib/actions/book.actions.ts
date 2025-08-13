'use server';

import prisma from '../prisma';
import { bookSchema } from '../validators/book.validators';
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

    await prisma.book.create({
      data: {
        ...parsedData,
        userId: existingUser.id,
      },
    });

    revalidatePath('/books');
    return { success: true, message: 'Book created successfully' };
  } catch (error) {
    console.error('Error creating book:', error);
    return { success: false, message: 'Failed to create book' };
  }
}
