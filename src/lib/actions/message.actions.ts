'use server';
import prisma from '../prisma';
import { getAuthenticatedUser } from '../server-utils';

export async function getUserMessages() {
  const { user } = await getAuthenticatedUser();
  if (!user) throw new Error('User not found');
  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });
  return notifications.map((n) => ({
    id: n.id,
    type: n.type,
    sender:
      typeof n.data === 'object' && n.data !== null
        ? 'commenterName' in n.data
          ? (n.data as { commenterName?: string }).commenterName || 'Unknown'
          : 'requesterName' in n.data
          ? (n.data as { requesterName?: string }).requesterName || 'Unknown'
          : 'Unknown'
        : 'Unknown',
    message:
      typeof n.data === 'object' && n.data !== null && 'content' in n.data
        ? (n.data as { content?: string }).content || ''
        : '',
    date: n.createdAt instanceof Date ? n.createdAt.toISOString() : n.createdAt,
    read: n.isRead,
    data: n.data,
  }));
}

export async function markMessageAsRead(id: string) {
  await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });
}

export async function getMessageById(id: string) {
  try {
    const { user } = await getAuthenticatedUser();
    if (!user) throw new Error('User not found');
    const message = await prisma.notification.findFirst({
      where: { id: id, userId: user.id },
    });
    if (!message) throw new Error('Message not found');
    return {
      id: message.id,
      type: message.type,
      sender:
        typeof message.data === 'object' &&
        message.data !== null &&
        'commenterName' in message.data
          ? (message.data as { commenterName?: string }).commenterName ||
            'Unknown'
          : 'Unknown',
      message:
        typeof message.data === 'object' &&
        message.data !== null &&
        'content' in message.data
          ? (message.data as { content?: string }).content || ''
          : '',
      date:
        message.createdAt instanceof Date
          ? message.createdAt.toISOString()
          : message.createdAt,
      read: message.isRead,
      data: message.data,
    };
  } catch (error) {
    console.error('Error fetching message by ID:', error);
    throw new Error('Failed to fetch message');
  }
}
