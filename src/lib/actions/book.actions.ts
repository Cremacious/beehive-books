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
    });
    return books;
  } catch (error) {
    console.error('Error fetching user books:', error);
    return [];
  }
}
