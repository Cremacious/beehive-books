'use server';
import prisma from '../prisma';
import { getAuthenticatedUser } from '../server-utils';

export async function createComment({
  chapterId,
  content,
}: {
  chapterId: number | string;
  content: string;
}) {
  try {
    const { user } = await getAuthenticatedUser();
    if (!user) throw new Error('User not found');

    await prisma.comment.create({
      data: {
        chapterId: Number(chapterId),
        content,
        authorId: user.id,
      },
    });

    return { success: true, message: 'Comment created' };
  } catch (error) {
    return {
      success: false,
      message: (error as Error).message || 'Error creating comment',
    };
  }
}
