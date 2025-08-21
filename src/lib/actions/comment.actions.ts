// import prisma from '../prisma';
// import { getAuthenticatedUser } from '../providers/types/server-utils';


// export async function createCommentNotification(
//   bookId: string,
//   chapterId: string,
//   commentId: string,
//   content: string
// ) {
//   try {
//     const { user, error } = await getAuthenticatedUser();
//     if (error) throw new Error(error);
//     if (!user) throw new Error('User not found');

//     const notification = await prisma.notification.create({
//       data: {
//         userId: user.id,
//         type: 'COMMENT',
//         bookId,
//         chapterId,
//         commentId,
//         content,
//       },
//     });

//     return notification;
//   } catch (error) {
//     console.error('Error creating comment notification:', error);
//     throw new Error('Failed to create comment notification');
//   }
// }