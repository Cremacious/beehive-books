'use server';

import { auth } from '@clerk/nextjs/server';
import { and, eq, or, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import {
  prompts,
  promptInvites,
  promptEntries,
  promptEntryLikes,
  promptEntryComments,
  promptEntryCommentLikes,
  friendships,
  users,
} from '@/db/schema';
import { insertNotification } from '@/lib/notifications';
import {
  promptServerSchema,
  entryCommentSchema,
} from '@/lib/validations/prompt.schema';
import type {
  PromptCard,
  PromptDetail,
  PromptEntry,
  EntryDetail,
  EntryComment,
  EntryReply,
  PromptUser,
} from '@/lib/types/prompt.types';

type ActionResult = { success: boolean; message: string };

async function requireAuth() {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  return userId;
}

const USER_COLUMNS = {
  clerkId: true,
  username: true,
  firstName: true,
  lastName: true,
  imageUrl: true,
} as const;

async function maybeEndPrompt(promptId: string, endDate: Date) {
  if (endDate < new Date()) {
    await db
      .update(prompts)
      .set({ status: 'ENDED', updatedAt: new Date() })
      .where(and(eq(prompts.id, promptId), eq(prompts.status, 'ACTIVE')));
  }
}

async function getFriendIds(userId: string): Promise<string[]> {
  const rows = await db.query.friendships.findMany({
    where: and(
      or(
        eq(friendships.requesterId, userId),
        eq(friendships.addresseeId, userId),
      ),
      eq(friendships.status, 'ACCEPTED'),
    ),
  });
  return rows.map((r) =>
    r.requesterId === userId ? r.addresseeId : r.requesterId,
  );
}

export async function getMyPromptsAction(): Promise<PromptCard[]> {
  const userId = await requireAuth();

  const myPrompts = await db.query.prompts.findMany({
    where: eq(prompts.creatorId, userId),
    with: { creator: { columns: USER_COLUMNS } },
    orderBy: (p, { desc }) => [desc(p.createdAt)],
  });

  const myInvites = await db.query.promptInvites.findMany({
    where: eq(promptInvites.userId, userId),
    with: {
      prompt: {
        with: { creator: { columns: USER_COLUMNS } },
      },
    },
  });

  const myEntryRows = await db.query.promptEntries.findMany({
    where: eq(promptEntries.userId, userId),
    columns: { id: true, promptId: true },
  });
  const myEntryMap = new Map(myEntryRows.map((e) => [e.promptId, e.id]));

  const allPrompts = [
    ...myPrompts.map((p) => ({ ...p, role: 'creator' as const })),
    ...myInvites
      .filter((inv) => !myPrompts.some((p) => p.id === inv.prompt.id))
      .map((inv) => ({
        ...inv.prompt,
        role: 'invited' as const,
        inviteStatus: inv.status,
      })),
  ];

  await Promise.all(
    allPrompts
      .filter((p) => p.status === 'ACTIVE' && p.endDate < new Date())
      .map((p) => maybeEndPrompt(p.id, p.endDate)),
  );

  return allPrompts.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    endDate: p.endDate,
    privacy: p.privacy,
    explorable: p.explorable,
    status: (p.endDate < new Date() ? 'ENDED' : p.status) as 'ACTIVE' | 'ENDED',
    entryCount: p.entryCount,
    createdAt: p.createdAt,
    creator: p.creator as PromptUser,
    myInviteStatus:
      p.role === 'creator'
        ? null
        : (p as { inviteStatus: 'PENDING' | 'ACCEPTED' }).inviteStatus,
    myEntryId: myEntryMap.get(p.id) ?? null,
  }));
}

export async function getPromptAction(promptId: string): Promise<PromptDetail> {
  const { userId } = await auth();

  const prompt = await db.query.prompts.findFirst({
    where: eq(prompts.id, promptId),
    with: {
      creator: { columns: USER_COLUMNS },
      invites: {
        with: { user: { columns: USER_COLUMNS } },
        orderBy: (i, { asc }) => [asc(i.createdAt)],
      },
    },
  });

  if (!prompt) throw new Error('Prompt not found');

  const isCreator = userId === prompt.creatorId;
  const isInvited = prompt.invites.some((i) => i.userId === userId);
  const isEnded = prompt.endDate < new Date() || prompt.status === 'ENDED';

  if (prompt.privacy === 'PRIVATE' && !isCreator && !isInvited) {
    throw new Error('You do not have access to this prompt');
  }

  await maybeEndPrompt(promptId, prompt.endDate);

  const myInvite = prompt.invites.find((i) => i.userId === userId);
  let myEntryId: string | null = null;
  if (userId) {
    const entry = await db.query.promptEntries.findFirst({
      where: and(
        eq(promptEntries.promptId, promptId),
        eq(promptEntries.userId, userId),
      ),
      columns: { id: true },
    });
    myEntryId = entry?.id ?? null;
  }

  return {
    id: prompt.id,
    title: prompt.title,
    description: prompt.description,
    endDate: prompt.endDate,
    privacy: prompt.privacy,
    explorable: prompt.explorable,
    status: (isEnded ? 'ENDED' : prompt.status) as 'ACTIVE' | 'ENDED',
    entryCount: prompt.entryCount,
    createdAt: prompt.createdAt,
    creator: prompt.creator as PromptUser,
    myInviteStatus: isCreator
      ? null
      : ((myInvite?.status ?? null) as 'ACCEPTED' | 'PENDING' | null),
    myEntryId,
    invites: prompt.invites.map((i) => ({
      id: i.id,
      status: i.status,
      user: i.user as PromptUser,
    })),
  };
}

export async function getPromptEntriesAction(
  promptId: string,
): Promise<PromptEntry[]> {
  const { userId } = await auth();

  const prompt = await db.query.prompts.findFirst({
    where: eq(prompts.id, promptId),
    columns: { creatorId: true, status: true, endDate: true, privacy: true },
  });
  if (!prompt) throw new Error('Prompt not found');

  const isCreator = userId === prompt.creatorId;
  const isEnded = prompt.endDate < new Date() || prompt.status === 'ENDED';

  if (!isEnded && !isCreator) return [];

  const entries = await db.query.promptEntries.findMany({
    where: eq(promptEntries.promptId, promptId),
    with: { user: { columns: USER_COLUMNS } },
    orderBy: (e, { desc }) => [desc(e.likeCount), desc(e.createdAt)],
  });

  let likedIds: string[] = [];
  if (userId) {
    const likes = await db.query.promptEntryLikes.findMany({
      where: eq(promptEntryLikes.userId, userId),
      columns: { entryId: true },
    });
    likedIds = likes.map((l) => l.entryId);
  }

  return entries.map((e) => ({
    id: e.id,
    content: e.content,
    wordCount: e.wordCount,
    likeCount: e.likeCount,
    likedByMe: likedIds.includes(e.id),
    createdAt: e.createdAt,
    user: e.user as PromptUser,
  }));
}

export async function getEntryAction(
  promptId: string,
  entryId: string,
): Promise<EntryDetail> {
  const { userId } = await auth();

  const entry = await db.query.promptEntries.findFirst({
    where: and(
      eq(promptEntries.id, entryId),
      eq(promptEntries.promptId, promptId),
    ),
    with: {
      user: { columns: USER_COLUMNS },
      prompt: { columns: { creatorId: true, status: true, endDate: true } },
      comments: {
        where: (c, { isNull }) => isNull(c.parentId),
        with: {
          user: { columns: USER_COLUMNS },
          replies: {
            with: { user: { columns: USER_COLUMNS } },
            orderBy: (r, { asc }) => [asc(r.createdAt)],
          },
        },
        orderBy: (c, { asc }) => [asc(c.createdAt)],
      },
    },
  });

  if (!entry) throw new Error('Entry not found');

  const isCreator = userId === entry.prompt.creatorId;
  const isAuthor = userId === entry.userId;
  const isEnded =
    entry.prompt.endDate < new Date() || entry.prompt.status === 'ENDED';

  if (!isEnded && !isCreator && !isAuthor) {
    throw new Error('Entries are locked until the prompt ends');
  }

  const allCommentIds = entry.comments.flatMap((c) => [
    c.id,
    ...c.replies.map((r) => r.id),
  ]);
  let likedCommentIds: string[] = [];
  let likedEntry = false;

  if (userId && allCommentIds.length > 0) {
    const commentLikes = await db.query.promptEntryCommentLikes.findMany({
      where: eq(promptEntryCommentLikes.userId, userId),
      columns: { commentId: true },
    });
    likedCommentIds = commentLikes.map((l) => l.commentId);
  }

  if (userId) {
    const entryLike = await db.query.promptEntryLikes.findFirst({
      where: and(
        eq(promptEntryLikes.userId, userId),
        eq(promptEntryLikes.entryId, entryId),
      ),
    });
    likedEntry = !!entryLike;
  }

  const comments: EntryComment[] = entry.comments.map((c) => ({
    id: c.id,
    content: c.content,
    likeCount: c.likeCount,
    likedByMe: likedCommentIds.includes(c.id),
    createdAt: c.createdAt,
    user: c.user as PromptUser,
    replies: c.replies.map(
      (r): EntryReply => ({
        id: r.id,
        content: r.content,
        likeCount: r.likeCount,
        likedByMe: likedCommentIds.includes(r.id),
        createdAt: r.createdAt,
        user: r.user as PromptUser,
      }),
    ),
  }));

  return {
    id: entry.id,
    content: entry.content,
    wordCount: entry.wordCount,
    likeCount: entry.likeCount,
    likedByMe: likedEntry,
    createdAt: entry.createdAt,
    user: entry.user as PromptUser,
    comments,
  };
}

export async function createPromptAction(
  data: {
    title: string;
    description: string;
    endDate: string;
    privacy: 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
    explorable: boolean;
  },
  inviteUserIds: string[],
): Promise<ActionResult & { promptId?: string }> {
  const userId = await requireAuth();

  const parsed = promptServerSchema.safeParse({
    ...data,
    endDate: new Date(data.endDate),
  });
  if (!parsed.success)
    return { success: false, message: parsed.error.issues[0].message };

  try {
    const { createId } = await import('@paralleldrive/cuid2');
    const promptId = createId();

    await db.insert(prompts).values({
      id: promptId,
      creatorId: userId,
      title: parsed.data.title,
      description: parsed.data.description,
      endDate: parsed.data.endDate,
      privacy: parsed.data.privacy,
      explorable: parsed.data.explorable,
    });

    if (inviteUserIds.length > 0) {
      await db
        .insert(promptInvites)
        .values(inviteUserIds.map((uid) => ({ promptId, userId: uid })));
      const actor = await db.query.users.findFirst({
        where: eq(users.clerkId, userId),
        columns: { username: true },
      });
      for (const uid of inviteUserIds) {
        void insertNotification({
          recipientId: uid,
          actorId: userId,
          type: 'PROMPT_INVITE',
          link: `/prompts/${promptId}`,
          metadata: {
            actorUsername: actor?.username ?? '',
            promptId,
            promptTitle: parsed.data.title,
          },
        });
      }
    }

    revalidatePath('/prompts');
    return { success: true, message: 'Prompt created.', promptId };
  } catch {
    return { success: false, message: 'Failed to create prompt.' };
  }
}

export async function updatePromptAction(
  promptId: string,
  data: {
    title: string;
    description: string;
    endDate: string;
    privacy: 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
    explorable: boolean;
  },
  inviteUserIds: string[],
): Promise<ActionResult> {
  const userId = await requireAuth();

  const prompt = await db.query.prompts.findFirst({
    where: and(eq(prompts.id, promptId), eq(prompts.creatorId, userId)),
  });
  if (!prompt)
    return { success: false, message: 'Prompt not found or unauthorized.' };

  const parsed = promptServerSchema.safeParse({
    ...data,
    endDate: new Date(data.endDate),
  });
  if (!parsed.success)
    return { success: false, message: parsed.error.issues[0].message };

  try {
    await db
      .update(prompts)
      .set({
        title: parsed.data.title,
        description: parsed.data.description,
        endDate: parsed.data.endDate,
        privacy: parsed.data.privacy,
        explorable: parsed.data.explorable,
        updatedAt: new Date(),
      })
      .where(eq(prompts.id, promptId));

    const existing = await db.query.promptInvites.findMany({
      where: eq(promptInvites.promptId, promptId),
      columns: { userId: true },
    });
    const existingIds = existing.map((i) => i.userId);
    const toAdd = inviteUserIds.filter((id) => !existingIds.includes(id));
    const toRemove = existingIds.filter((id) => !inviteUserIds.includes(id));

    if (toRemove.length > 0) {
      for (const uid of toRemove) {
        await db
          .delete(promptInvites)
          .where(
            and(
              eq(promptInvites.promptId, promptId),
              eq(promptInvites.userId, uid),
            ),
          );
      }
    }
    if (toAdd.length > 0) {
      await db
        .insert(promptInvites)
        .values(toAdd.map((uid) => ({ promptId, userId: uid })));
      const actor = await db.query.users.findFirst({
        where: eq(users.clerkId, userId),
        columns: { username: true },
      });
      for (const uid of toAdd) {
        void insertNotification({
          recipientId: uid,
          actorId: userId,
          type: 'PROMPT_INVITE',
          link: `/prompts/${promptId}`,
          metadata: {
            actorUsername: actor?.username ?? '',
            promptId,
            promptTitle: parsed.data.title,
          },
        });
      }
    }

    revalidatePath('/prompts');
    revalidatePath(`/prompts/${promptId}`);
    revalidatePath(`/prompts/${promptId}/edit`);
    return { success: true, message: 'Prompt updated.' };
  } catch {
    return { success: false, message: 'Failed to update prompt.' };
  }
}

export async function endPromptEarlyAction(
  promptId: string,
): Promise<ActionResult> {
  const userId = await requireAuth();

  const prompt = await db.query.prompts.findFirst({
    where: and(eq(prompts.id, promptId), eq(prompts.creatorId, userId)),
  });
  if (!prompt)
    return { success: false, message: 'Prompt not found or unauthorized.' };
  if (prompt.status === 'ENDED')
    return { success: false, message: 'Prompt has already ended.' };

  try {
    await db
      .update(prompts)
      .set({ status: 'ENDED', endDate: new Date(), updatedAt: new Date() })
      .where(eq(prompts.id, promptId));

    const acceptedInvites = await db.query.promptInvites.findMany({
      where: and(
        eq(promptInvites.promptId, promptId),
        eq(promptInvites.status, 'ACCEPTED'),
      ),
      columns: { userId: true },
    });
    for (const inv of acceptedInvites) {
      void insertNotification({
        recipientId: inv.userId,
        actorId: userId,
        type: 'PROMPT_ENDED',
        link: `/prompts/${promptId}`,
        metadata: { promptId, promptTitle: prompt.title },
      });
    }

    revalidatePath('/prompts');
    revalidatePath(`/prompts/${promptId}`);
    return { success: true, message: 'Prompt ended.' };
  } catch {
    return { success: false, message: 'Failed to end prompt.' };
  }
}

export async function deletePromptAction(
  promptId: string,
): Promise<ActionResult> {
  const userId = await requireAuth();

  const prompt = await db.query.prompts.findFirst({
    where: and(eq(prompts.id, promptId), eq(prompts.creatorId, userId)),
  });
  if (!prompt)
    return { success: false, message: 'Prompt not found or unauthorized.' };

  try {
    await db.delete(prompts).where(eq(prompts.id, promptId));
    revalidatePath('/prompts');
    return { success: true, message: 'Prompt deleted.' };
  } catch {
    return { success: false, message: 'Failed to delete prompt.' };
  }
}

export async function acceptInviteAction(
  promptId: string,
): Promise<ActionResult> {
  const userId = await requireAuth();

  const invite = await db.query.promptInvites.findFirst({
    where: and(
      eq(promptInvites.promptId, promptId),
      eq(promptInvites.userId, userId),
      eq(promptInvites.status, 'PENDING'),
    ),
  });
  if (!invite) return { success: false, message: 'Invite not found.' };

  try {
    await db
      .update(promptInvites)
      .set({ status: 'ACCEPTED' })
      .where(
        and(
          eq(promptInvites.promptId, promptId),
          eq(promptInvites.userId, userId),
        ),
      );

    revalidatePath('/prompts');
    revalidatePath(`/prompts/${promptId}`);
    return { success: true, message: 'Invite accepted.' };
  } catch {
    return { success: false, message: 'Failed to accept invite.' };
  }
}

export async function declineInviteAction(
  promptId: string,
): Promise<ActionResult> {
  const userId = await requireAuth();

  try {
    await db
      .delete(promptInvites)
      .where(
        and(
          eq(promptInvites.promptId, promptId),
          eq(promptInvites.userId, userId),
        ),
      );
    revalidatePath('/prompts');
    return { success: true, message: 'Invite declined.' };
  } catch {
    return { success: false, message: 'Failed to decline invite.' };
  }
}

export async function createEntryAction(
  promptId: string,
  content: string,
): Promise<ActionResult & { entryId?: string }> {
  const userId = await requireAuth();

  const prompt = await db.query.prompts.findFirst({
    where: eq(prompts.id, promptId),
    columns: {
      creatorId: true,
      status: true,
      endDate: true,
      privacy: true,
      title: true,
    },
  });
  if (!prompt) return { success: false, message: 'Prompt not found.' };

  if (prompt.endDate < new Date() || prompt.status === 'ENDED') {
    return { success: false, message: 'This prompt has already ended.' };
  }

  if (prompt.privacy === 'PRIVATE' && prompt.creatorId !== userId) {
    const invite = await db.query.promptInvites.findFirst({
      where: and(
        eq(promptInvites.promptId, promptId),
        eq(promptInvites.userId, userId),
        eq(promptInvites.status, 'ACCEPTED'),
      ),
    });
    if (!invite)
      return {
        success: false,
        message: 'You have not been invited to this prompt.',
      };
  }

  const existing = await db.query.promptEntries.findFirst({
    where: and(
      eq(promptEntries.promptId, promptId),
      eq(promptEntries.userId, userId),
    ),
    columns: { id: true },
  });
  if (existing)
    return { success: false, message: 'You have already submitted an entry.' };

  const trimmed = content.trim();
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;

  try {
    const { createId } = await import('@paralleldrive/cuid2');
    const entryId = createId();

    await db.insert(promptEntries).values({
      id: entryId,
      promptId,
      userId,
      content: trimmed,
      wordCount,
    });

    await db
      .update(prompts)
      .set({
        entryCount: sql`${prompts.entryCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(prompts.id, promptId));

    const actor = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
      columns: { username: true },
    });
    void insertNotification({
      recipientId: prompt.creatorId,
      actorId: userId,
      type: 'PROMPT_ENTRY',
      link: `/prompts/${promptId}/${entryId}`,
      metadata: {
        actorUsername: actor?.username ?? '',
        promptId,
        promptTitle: prompt.title,
        entryId,
      },
    });

    revalidatePath(`/prompts/${promptId}`);
    return { success: true, message: 'Entry submitted.', entryId };
  } catch {
    return { success: false, message: 'Failed to submit entry.' };
  }
}

export async function toggleEntryLikeAction(
  entryId: string,
): Promise<ActionResult> {
  const userId = await requireAuth();

  const existing = await db.query.promptEntryLikes.findFirst({
    where: and(
      eq(promptEntryLikes.userId, userId),
      eq(promptEntryLikes.entryId, entryId),
    ),
  });

  try {
    if (existing) {
      await db
        .delete(promptEntryLikes)
        .where(
          and(
            eq(promptEntryLikes.userId, userId),
            eq(promptEntryLikes.entryId, entryId),
          ),
        );
      await db
        .update(promptEntries)
        .set({ likeCount: sql`GREATEST(${promptEntries.likeCount} - 1, 0)` })
        .where(eq(promptEntries.id, entryId));
    } else {
      await db.insert(promptEntryLikes).values({ userId, entryId });
      await db
        .update(promptEntries)
        .set({ likeCount: sql`${promptEntries.likeCount} + 1` })
        .where(eq(promptEntries.id, entryId));
    }
    return {
      success: true,
      message: existing ? 'Like removed.' : 'Entry liked.',
    };
  } catch {
    return { success: false, message: 'Failed to toggle like.' };
  }
}

export async function addEntryCommentAction(
  entryId: string,
  content: string,
  parentId?: string | null,
): Promise<ActionResult> {
  const userId = await requireAuth();

  const parsed = entryCommentSchema.safeParse({ content });
  if (!parsed.success)
    return { success: false, message: parsed.error.issues[0].message };

  const entry = await db.query.promptEntries.findFirst({
    where: eq(promptEntries.id, entryId),
    with: {
      prompt: { columns: { status: true, endDate: true, creatorId: true } },
    },
  });
  if (!entry) return { success: false, message: 'Entry not found.' };

  const isEnded =
    entry.prompt.endDate < new Date() || entry.prompt.status === 'ENDED';
  const isCreator = userId === entry.prompt.creatorId;
  const isAuthor = userId === entry.userId;
  if (!isEnded && !isCreator && !isAuthor) {
    return {
      success: false,
      message: 'Entries are locked until the prompt ends.',
    };
  }

  try {
    await db.insert(promptEntryComments).values({
      entryId,
      userId,
      content: parsed.data.content.trim(),
      parentId: parentId ?? null,
    });

    const promptId = entry.promptId;
    const actor = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
      columns: { username: true },
    });
    const meta = { actorUsername: actor?.username ?? '', promptId, entryId };
    const link = `/prompts/${promptId}/${entryId}`;

    if (parentId) {
      const parent = await db.query.promptEntryComments.findFirst({
        where: eq(promptEntryComments.id, parentId),
        columns: { userId: true },
      });
      if (parent) {
        void insertNotification({
          recipientId: parent.userId,
          actorId: userId,
          type: 'COMMENT_REPLY',
          link,
          metadata: meta,
        });
      }
    } else {
      void insertNotification({
        recipientId: entry.userId,
        actorId: userId,
        type: 'ENTRY_COMMENT',
        link,
        metadata: meta,
      });
    }

    revalidatePath(`/prompts/${promptId}/${entryId}`);
    return { success: true, message: 'Comment added.' };
  } catch {
    return { success: false, message: 'Failed to add comment.' };
  }
}

export async function toggleEntryCommentLikeAction(
  commentId: string,
): Promise<ActionResult> {
  const userId = await requireAuth();

  const existing = await db.query.promptEntryCommentLikes.findFirst({
    where: and(
      eq(promptEntryCommentLikes.userId, userId),
      eq(promptEntryCommentLikes.commentId, commentId),
    ),
  });

  const comment = await db.query.promptEntryComments.findFirst({
    where: eq(promptEntryComments.id, commentId),
    columns: { userId: true, entryId: true },
    with: { entry: { columns: { promptId: true } } },
  });

  try {
    if (existing) {
      await db
        .delete(promptEntryCommentLikes)
        .where(
          and(
            eq(promptEntryCommentLikes.userId, userId),
            eq(promptEntryCommentLikes.commentId, commentId),
          ),
        );
      await db
        .update(promptEntryComments)
        .set({
          likeCount: sql`GREATEST(${promptEntryComments.likeCount} - 1, 0)`,
        })
        .where(eq(promptEntryComments.id, commentId));
    } else {
      await db.insert(promptEntryCommentLikes).values({ userId, commentId });
      await db
        .update(promptEntryComments)
        .set({ likeCount: sql`${promptEntryComments.likeCount} + 1` })
        .where(eq(promptEntryComments.id, commentId));
      if (comment) {
        const actor = await db.query.users.findFirst({
          where: eq(users.clerkId, userId),
          columns: { username: true },
        });
        void insertNotification({
          recipientId: comment.userId,
          actorId: userId,
          type: 'ENTRY_COMMENT_LIKE',
          link: `/prompts/${comment.entry.promptId}/${comment.entryId}`,
          metadata: {
            actorUsername: actor?.username ?? '',
            promptId: comment.entry.promptId,
            entryId: comment.entryId,
          },
        });
      }
    }
    return {
      success: true,
      message: existing ? 'Like removed.' : 'Comment liked.',
    };
  } catch {
    return { success: false, message: 'Failed to toggle like.' };
  }
}
