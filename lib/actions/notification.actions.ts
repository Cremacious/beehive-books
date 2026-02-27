'use server';

import { auth } from '@clerk/nextjs/server';
import { desc, eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { notifications } from '@/db/schema';
import type { NotificationItem } from '@/lib/types/notification.types';

async function requireAuth(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  return userId;
}

export async function getNotificationsAction(): Promise<{
  notifications: NotificationItem[];
  unreadCount:   number;
}> {
  const userId = await requireAuth();

  const rows = await db.query.notifications.findMany({
    where: eq(notifications.recipientId, userId),
    with:  { actor: { columns: { username: true, imageUrl: true } } },
    orderBy: desc(notifications.createdAt),
    limit: 30,
  });

  const items: NotificationItem[] = rows.map((r) => ({
    id:        r.id,
    type:      r.type as NotificationItem['type'],
    isRead:    r.isRead,
    link:      r.link,
    metadata:  (r.metadata ?? {}) as Record<string, string>,
    createdAt: r.createdAt,
    actor:     r.actor ?? null,
  }));

  const unreadCount = items.filter((n) => !n.isRead).length;

  return { notifications: items, unreadCount };
}

export async function markAllReadAction(): Promise<void> {
  const userId = await requireAuth();
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.recipientId, userId), eq(notifications.isRead, false)));
}
