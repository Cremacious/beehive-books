'use server';

import { requireAuth } from '@/lib/require-auth';
import { checkActionRateLimit } from '@/lib/check-action-rate-limit';
import { revalidatePath } from 'next/cache';
import { and, asc, eq, isNull } from 'drizzle-orm';
import { db } from '@/db';
import { hiveChatMessages, hiveMembers } from '@/db/schema';
import type { ActionResult, ForumThreadWithAuthor, ForumReplyWithAuthor, HiveUser } from '@/lib/types/hive.types';

async function requireHiveMember(hiveId: string) {
  const userId = await requireAuth();
  const membership = await db.query.hiveMembers.findFirst({
    where: and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, userId)),
  });
  if (!membership) throw new Error('Not a member of this hive');
  return { userId, membership };
}

export async function getHiveForumAction(hiveId: string): Promise<ForumThreadWithAuthor[]> {
  const userId = await requireAuth();
  const membership = await db.query.hiveMembers.findFirst({
    where: and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, userId)),
  });
  if (!membership) return [];

  const allMessages = await db.query.hiveChatMessages.findMany({
    where: eq(hiveChatMessages.hiveId, hiveId),
    with: { author: true },
    orderBy: [asc(hiveChatMessages.createdAt)],
  });

  const repliesByParent = new Map<string, typeof allMessages>();
  for (const msg of allMessages) {
    if (msg.parentId) {
      const arr = repliesByParent.get(msg.parentId) ?? [];
      arr.push(msg);
      repliesByParent.set(msg.parentId, arr);
    }
  }

  const threads: ForumThreadWithAuthor[] = allMessages
    .filter((m) => !m.parentId)
    .map((thread) => {
      const replies = repliesByParent.get(thread.id) ?? [];
      const lastReply = replies.at(-1);
      return {
        id: thread.id,
        hiveId: thread.hiveId,
        authorId: thread.authorId,
        content: thread.content,
        parentId: null,
        createdAt: thread.createdAt,
        author: { id: thread.author.id, username: thread.author.username, image: thread.author.image } as HiveUser,
        replyCount: replies.length,
        lastActivity: lastReply ? lastReply.createdAt : thread.createdAt,
      };
    });

  threads.sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
  return threads;
}

export async function getThreadRepliesAction(
  hiveId: string,
  threadId: string,
): Promise<ForumReplyWithAuthor[]> {
  const userId = await requireAuth();
  const membership = await db.query.hiveMembers.findFirst({
    where: and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, userId)),
  });
  if (!membership) return [];

  const replies = await db.query.hiveChatMessages.findMany({
    where: and(
      eq(hiveChatMessages.hiveId, hiveId),
      eq(hiveChatMessages.parentId, threadId),
    ),
    with: { author: true },
    orderBy: [asc(hiveChatMessages.createdAt)],
  });

  return replies.map((r) => ({
    id: r.id,
    hiveId: r.hiveId,
    authorId: r.authorId,
    content: r.content,
    parentId: r.parentId!,
    createdAt: r.createdAt,
    author: { id: r.author.id, username: r.author.username, image: r.author.image } as HiveUser,
  }));
}

export async function createThreadAction(
  hiveId: string,
  content: string,
): Promise<ActionResult & { threadId?: string }> {
  try {
    const { userId } = await requireHiveMember(hiveId);
    const limited = await checkActionRateLimit(userId);
    if (limited) return { success: false, message: limited };

    const trimmed = content.trim();
    if (!trimmed) return { success: false, message: 'Content cannot be empty.' };
    if (trimmed.length > 4000) return { success: false, message: 'Content too long (max 4000 chars).' };

    const [inserted] = await db
      .insert(hiveChatMessages)
      .values({ hiveId, authorId: userId, content: trimmed })
      .returning({ id: hiveChatMessages.id });

    revalidatePath(`/hive/${hiveId}/forum`);
    return { success: true, message: 'Thread created.', threadId: inserted.id };
  } catch {
    return { success: false, message: 'Failed to create thread.' };
  }
}

export async function replyToThreadAction(
  hiveId: string,
  parentId: string,
  content: string,
): Promise<ActionResult & { replyId?: string }> {
  try {
    const { userId } = await requireHiveMember(hiveId);
    const limited = await checkActionRateLimit(userId);
    if (limited) return { success: false, message: limited };

    const trimmed = content.trim();
    if (!trimmed) return { success: false, message: 'Reply cannot be empty.' };
    if (trimmed.length > 4000) return { success: false, message: 'Reply too long (max 4000 chars).' };

    // Ensure parent exists and belongs to this hive
    const parent = await db.query.hiveChatMessages.findFirst({
      where: and(
        eq(hiveChatMessages.id, parentId),
        eq(hiveChatMessages.hiveId, hiveId),
        isNull(hiveChatMessages.parentId),
      ),
    });
    if (!parent) return { success: false, message: 'Thread not found.' };

    const [inserted] = await db
      .insert(hiveChatMessages)
      .values({ hiveId, authorId: userId, content: trimmed, parentId })
      .returning({ id: hiveChatMessages.id });

    revalidatePath(`/hive/${hiveId}/forum`);
    return { success: true, message: 'Reply posted.', replyId: inserted.id };
  } catch {
    return { success: false, message: 'Failed to post reply.' };
  }
}

export async function deleteForumMessageAction(
  hiveId: string,
  messageId: string,
): Promise<ActionResult> {
  try {
    const { userId, membership } = await requireHiveMember(hiveId);

    const message = await db.query.hiveChatMessages.findFirst({
      where: and(eq(hiveChatMessages.id, messageId), eq(hiveChatMessages.hiveId, hiveId)),
    });
    if (!message) return { success: false, message: 'Message not found.' };

    const canDelete =
      message.authorId === userId ||
      membership.role === 'OWNER' ||
      membership.role === 'MODERATOR';
    if (!canDelete) return { success: false, message: 'No permission to delete this message.' };

    // If deleting a thread, also delete its replies
    if (!message.parentId) {
      await db
        .delete(hiveChatMessages)
        .where(eq(hiveChatMessages.parentId, messageId));
    }

    await db.delete(hiveChatMessages).where(eq(hiveChatMessages.id, messageId));
    revalidatePath(`/hive/${hiveId}/forum`);
    return { success: true, message: 'Deleted.' };
  } catch {
    return { success: false, message: 'Failed to delete message.' };
  }
}
