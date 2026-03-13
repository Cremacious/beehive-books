'use server';

import { requireAuth, getOptionalUserId } from '@/lib/require-auth';

import { desc, eq, and, lt, count } from 'drizzle-orm';
import { db } from '@/db';
import { notifications } from '@/db/schema';
import type { NotificationItem } from '@/lib/types/notification.types';

export async function getNotificationsAction(): Promise<{
  notifications: NotificationItem[];
  unreadCount:   number;
}> {
  const userId = await requireAuth();

  const rows = await db.query.notifications.findMany({
    where: eq(notifications.recipientId, userId),
    with:  { actor: { columns: { username: true, image: true } } },
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

export async function getNotificationsPageAction(
  page: number,
  perPage = 25,
): Promise<{ notifications: NotificationItem[]; total: number }> {
  const userId = await requireAuth();

  const [rows, countResult] = await Promise.all([
    db.query.notifications.findMany({
      where: eq(notifications.recipientId, userId),
      with: { actor: { columns: { username: true, image: true } } },
      orderBy: desc(notifications.createdAt),
      limit: perPage,
      offset: (page - 1) * perPage,
    }),
    db.select({ count: count() }).from(notifications).where(eq(notifications.recipientId, userId)),
  ]);

  const items: NotificationItem[] = rows.map((r) => ({
    id:       r.id,
    type:     r.type as NotificationItem['type'],
    isRead:   r.isRead,
    link:     r.link,
    metadata: (r.metadata ?? {}) as Record<string, string>,
    createdAt: r.createdAt,
    actor:    r.actor ?? null,
  }));

  return { notifications: items, total: countResult[0]?.count ?? 0 };
}

export async function pruneOldNotificationsAction(): Promise<void> {
  const userId = await requireAuth();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  await db
    .delete(notifications)
    .where(and(eq(notifications.recipientId, userId), lt(notifications.createdAt, thirtyDaysAgo)));
}

export async function markAllReadAction(): Promise<void> {
  const userId = await requireAuth();
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.recipientId, userId), eq(notifications.isRead, false)));
}
