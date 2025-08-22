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
    message: typeof n.data === 'object' && n.data !== null && 'content' in n.data ? (n.data as { content?: string }).content || '' : '',
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

