'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { and, asc, desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { hiveChatMessages, hiveMembers } from '@/db/schema';
import type { ActionResult, ChatMessageWithAuthor } from '@/lib/types/hive.types';

async function requireAuth() {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  return userId;
}

async function requireHiveMember(hiveId: string) {
  const userId = await requireAuth();
  const membership = await db.query.hiveMembers.findFirst({
    where: and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, userId)),
  });
  if (!membership) throw new Error('Not a member of this hive');
  return { userId, membership };
}

export async function getChatMessagesAction(
  hiveId: string,
  limit = 60,
): Promise<ChatMessageWithAuthor[]> {
  const { userId } = await auth();
  if (!userId) return [];

  const membership = await db.query.hiveMembers.findFirst({
    where: and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, userId)),
  });
  if (!membership) return [];


  const rows = await db.query.hiveChatMessages.findMany({
    where: eq(hiveChatMessages.hiveId, hiveId),
    with: { author: true },
    orderBy: [desc(hiveChatMessages.createdAt)],
    limit,
  });

  return rows.reverse() as ChatMessageWithAuthor[];
}

export async function getOlderChatMessagesAction(
  hiveId: string,
  beforeId: string,
  limit = 30,
): Promise<ChatMessageWithAuthor[]> {
  const { userId } = await auth();
  if (!userId) return [];

  const membership = await db.query.hiveMembers.findFirst({
    where: and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, userId)),
  });
  if (!membership) return [];

  const anchor = await db.query.hiveChatMessages.findFirst({
    where: eq(hiveChatMessages.id, beforeId),
  });
  if (!anchor) return [];

  const rows = await db.query.hiveChatMessages.findMany({
    where: and(
      eq(hiveChatMessages.hiveId, hiveId),
    ),
    with: { author: true },
    orderBy: [asc(hiveChatMessages.createdAt)],
    limit: 9999,
  });


  const before = rows.filter(
    (r) => new Date(r.createdAt) < new Date(anchor.createdAt),
  );
  return before.slice(-limit) as ChatMessageWithAuthor[];
}

export async function sendChatMessageAction(
  hiveId: string,
  content: string,
): Promise<ActionResult> {
  try {
    const { userId } = await requireHiveMember(hiveId);
    const trimmed = content.trim();
    if (!trimmed) return { success: false, message: 'Message cannot be empty.' };
    if (trimmed.length > 2000) return { success: false, message: 'Message too long (max 2000 chars).' };

    await db.insert(hiveChatMessages).values({
      hiveId,
      authorId: userId,
      content: trimmed,
    });

    return { success: true, message: 'Sent.' };
  } catch {
    return { success: false, message: 'Failed to send message.' };
  }
}

export async function deleteChatMessageAction(
  hiveId: string,
  messageId: string,
): Promise<ActionResult> {
  try {
    const { userId, membership } = await requireHiveMember(hiveId);

    const message = await db.query.hiveChatMessages.findFirst({
      where: and(
        eq(hiveChatMessages.id, messageId),
        eq(hiveChatMessages.hiveId, hiveId),
      ),
    });
    if (!message) return { success: false, message: 'Message not found.' };

    const canDelete =
      message.authorId === userId ||
      membership.role === 'OWNER' ||
      membership.role === 'MODERATOR';
    if (!canDelete) return { success: false, message: 'No permission to delete this message.' };

    await db.delete(hiveChatMessages).where(eq(hiveChatMessages.id, messageId));
    revalidatePath(`/hive/${hiveId}/chat`);
    return { success: true, message: 'Deleted.' };
  } catch {
    return { success: false, message: 'Failed to delete message.' };
  }
}
