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

    const created = await prisma.comment.create({
      data: {
        chapterId: Number(chapterId),
        content,
        authorId: user.id,
      },
      include: { author: { select: { id: true, name: true, image: true } } },
    });

    const chapter = await prisma.chapter.findUnique({
      where: { id: Number(chapterId) },
      include: { book: true },
    });
    if (chapter && user.id !== chapter.author) {
      await prisma.notification.create({
        data: {
          userId: chapter.author,
          type: 'comment',
          data: {
            commentId: created.id,
            chapterId: created.chapterId,
            content: created.content,
            commenterId: user.id,
            commenterName: user.name,
          },
          isRead: false,
        },
      });
    }

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

export async function createCommentReply({
  commentId,
  content,
  chapterId,
}: {
  commentId: number | string;
  content: string;
  chapterId: number | string;
}) {
  try {
    const { user } = await getAuthenticatedUser();
    if (!user) throw new Error('User not found');

    const created = await prisma.comment.create({
      data: {
        parentId: Number(commentId),
        chapterId: Number(chapterId),
        content,
        authorId: user.id,
      },
      include: { author: { select: { id: true, name: true, image: true } } },
    });

    return {
      success: true,
      message: 'Reply created',
      reply: {
        id: created.id,
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
      },
    };
  } catch (error) {
    return {
      success: false,
      message: (error as Error).message || 'Error creating reply',
    };
  }
}
