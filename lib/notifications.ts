import { db } from '@/db';
import { notifications } from '@/db/schema';
import { and, eq, gte, sql } from 'drizzle-orm';
import type { NotificationType } from '@/lib/types/notification.types';

interface InsertNotificationParams {
  recipientId: string;
  actorId: string | null;
  type: NotificationType;
  link: string;
  metadata: Record<string, string>;
}

export async function insertNotification(
  params: InsertNotificationParams,
): Promise<void> {
  if (params.actorId && params.recipientId === params.actorId) return;
  await db.insert(notifications).values({
    recipientId: params.recipientId,
    actorId: params.actorId,
    type: params.type,
    link: params.link,
    metadata: params.metadata,
  });
}

interface BundleHiveActivityParams {
  recipientId: string;
  actorId: string;
  hiveId: string;
  hiveName: string;
  actorUsername: string;
  bundleWindowHours?: number;
}

export async function insertOrBundleHiveActivityNotification(
  params: BundleHiveActivityParams,
): Promise<void> {
  if (params.recipientId === params.actorId) return;

  const windowHours = params.bundleWindowHours ?? 2;
  const cutoff = new Date(Date.now() - windowHours * 3_600_000);

  const existing = await db.query.notifications.findFirst({
    where: and(
      eq(notifications.recipientId, params.recipientId),
      eq(notifications.type, 'HIVE_ACTIVITY'),
      eq(notifications.isRead, false),
      gte(notifications.updatedAt, cutoff),
      sql`${notifications.metadata}->>'hiveId' = ${params.hiveId}`,
    ),
    columns: { id: true },
  });

  if (existing) {
    await db
      .update(notifications)
      .set({
        actorId: params.actorId,
        updatedAt: new Date(),
        metadata: {
          actorUsername: params.actorUsername,
          hiveName: params.hiveName,
          hiveId: params.hiveId,
        },
      })
      .where(eq(notifications.id, existing.id));
  } else {
    await db.insert(notifications).values({
      recipientId: params.recipientId,
      actorId: params.actorId,
      type: 'HIVE_ACTIVITY',
      link: `/hive/${params.hiveId}`,
      metadata: {
        actorUsername: params.actorUsername,
        hiveName: params.hiveName,
        hiveId: params.hiveId,
      },
    });
  }
}
