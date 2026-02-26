import { db } from '@/db';
import { notifications } from '@/db/schema';
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
