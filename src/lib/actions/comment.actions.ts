// ...existing code...
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

    // create and include author so we can return a complete comment object
    const created = await prisma.comment.create({
      data: {
        chapterId: Number(chapterId),
        content,
        authorId: user.id,
      },
      include: { author: { select: { id: true, name: true, image: true } } },
    });

    return {
      success: true,
      message: 'Comment created',
      comment: {
        id: created.id,
        chapterId: created.chapterId,
        content: created.content,
        authorId: created.authorId,
        author: created.author
          ? {
              id: created.author.id,
              name: created.author.name,
              image: created.author.image ?? undefined,
            }
          : undefined,
        createdAt:
          created.createdAt instanceof Date
            ? created.createdAt.toISOString()
            : created.createdAt,
        replies: [],
      },
    };
  } catch (error) {
    return {
      success: false,
      message: (error as Error).message || 'Error creating comment',
    };
  }
}
// ...existing code...
