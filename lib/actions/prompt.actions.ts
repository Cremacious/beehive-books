'use server';

import { requireAuth, getOptionalUserId } from '@/lib/require-auth';
import { checkActionRateLimit } from '@/lib/check-action-rate-limit';

import { and, desc, eq, inArray, or, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { checkCreateLimit } from '@/lib/premium';
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

const USER_COLUMNS = {
  id: true,
  username: true,
  image: true,
} as const;

async function maybeEndPrompt(promptId: string, endDate: Date) {
  if (endDate < new Date()) {
    const votingEndsAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
    await db
      .update(prompts)
      .set({ status: 'VOTING', votingEndsAt, updatedAt: new Date() })
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
    status: (p.endDate < new Date() && p.status === 'ACTIVE' ? 'VOTING' : p.status) as 'ACTIVE' | 'VOTING' | 'ENDED',
    entryCount: p.entryCount,
    createdAt: p.createdAt,
    creator: p.creator as PromptUser,
    myInviteStatus:
      p.role === 'creator'
        ? null
        : (p as { inviteStatus: 'PENDING' | 'ACCEPTED' }).inviteStatus,
    myEntryId: myEntryMap.get(p.id) ?? null,
    tags: (p.tags ?? []) as string[],
  }));
}

export async function getPromptAction(promptId: string): Promise<PromptDetail> {
  const userId = await requireAuth();

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
  const isEnded = prompt.endDate < new Date() || prompt.status === 'ENDED' || prompt.status === 'VOTING';

  if (prompt.privacy === 'PRIVATE' && !isCreator && !isInvited) {
    throw new Error('You do not have access to this prompt');
  }

  if (prompt.status === 'ACTIVE') {
    await maybeEndPrompt(promptId, prompt.endDate);
  } else if (prompt.status === 'VOTING' && prompt.votingEndsAt && prompt.votingEndsAt < new Date()) {
    await transitionToEndedAction(promptId);
  }

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

  // Re-fetch after possible status transition
  const freshPrompt = await db.query.prompts.findFirst({
    where: eq(prompts.id, promptId),
    columns: { status: true, votingEndsAt: true, communityWinnerId: true, authorChoiceId: true },
  });

  return {
    id: prompt.id,
    title: prompt.title,
    description: prompt.description,
    endDate: prompt.endDate,
    privacy: prompt.privacy,
    explorable: prompt.explorable,
    status: (freshPrompt?.status ?? prompt.status) as 'ACTIVE' | 'VOTING' | 'ENDED',
    votingEndsAt: freshPrompt?.votingEndsAt ?? null,
    communityWinnerId: freshPrompt?.communityWinnerId ?? null,
    authorChoiceId: freshPrompt?.authorChoiceId ?? null,
    entryCount: prompt.entryCount,
    createdAt: prompt.createdAt,
    creator: prompt.creator as PromptUser,
    myInviteStatus: isCreator
      ? null
      : ((myInvite?.status ?? null) as 'ACCEPTED' | 'PENDING' | null),
    myEntryId,
    tags: (prompt.tags ?? []) as string[],
    invites: prompt.invites.map((i) => ({
      id: i.id,
      status: i.status,
      user: i.user as PromptUser,
    })),
  };
}

export async function getPromptEntriesAction(
  promptId: string,
): Promise<{ entries: PromptEntry[]; votedEntryId: string | null }> {
  const userId = await requireAuth();

  const prompt = await db.query.prompts.findFirst({
    where: eq(prompts.id, promptId),
    columns: { creatorId: true, status: true, endDate: true, privacy: true, communityWinnerId: true, authorChoiceId: true, votingEndsAt: true },
  });
  if (!prompt) throw new Error('Prompt not found');

  const isCreator = userId === prompt.creatorId;
  const isEnded = prompt.endDate < new Date() || prompt.status === 'ENDED' || prompt.status === 'VOTING';

  if (!isEnded && !isCreator) return { entries: [], votedEntryId: null };

  const entries = await db.query.promptEntries.findMany({
    where: eq(promptEntries.promptId, promptId),
    with: { user: { columns: USER_COLUMNS } },
    orderBy: [desc(promptEntries.likeCount), desc(promptEntries.createdAt)],
  });

  let likedIds: string[] = [];
  if (userId) {
    const likes = await db.query.promptEntryLikes.findMany({
      where: eq(promptEntryLikes.userId, userId),
      columns: { entryId: true },
    });
    likedIds = likes.map((l) => l.entryId);
  }

  const mappedEntries = entries.map((e) => ({
    id: e.id,
    title: e.title ?? '',
    content: e.content,
    wordCount: e.wordCount,
    likeCount: e.likeCount,
    likedByMe: likedIds.includes(e.id),
    isCommunityWin: e.id === prompt.communityWinnerId,
    isAuthorChoice: e.id === prompt.authorChoiceId,
    createdAt: e.createdAt,
    user: e.user as PromptUser,
  }));

  const votedEntryId = entries.find((e) => likedIds.includes(e.id))?.id ?? null;

  return { entries: mappedEntries, votedEntryId };
}

export async function getEntryAction(
  promptId: string,
  entryId: string,
): Promise<EntryDetail> {
  const userId = await requireAuth();

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
    tags?: string[];
  },
  inviteUserIds: string[],
): Promise<ActionResult & { promptId?: string }> {
  const userId = await requireAuth();
  const limitError = await checkCreateLimit(userId, 'prompts');
  if (limitError) return { success: false, message: limitError };

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
      tags: parsed.data.tags ?? [],
    });

    if (inviteUserIds.length > 0) {
      await db
        .insert(promptInvites)
        .values(inviteUserIds.map((uid) => ({ promptId, userId: uid })));
      const actor = await db.query.users.findFirst({
        where: eq(users.id, userId),
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
    tags?: string[];
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
        tags: parsed.data.tags ?? [],
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
        where: eq(users.id, userId),
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
  if (prompt.status === 'VOTING' || prompt.status === 'ENDED')
    return { success: false, message: 'Prompt has already ended.' };

  try {
    const votingEndsAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
    await db
      .update(prompts)
      .set({ status: 'VOTING', votingEndsAt, endDate: new Date(), updatedAt: new Date() })
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
    return { success: true, message: 'Voting period started.' };
  } catch {
    return { success: false, message: 'Failed to end prompt.' };
  }
}

export async function transitionToEndedAction(promptId: string): Promise<void> {
  const prompt = await db.query.prompts.findFirst({
    where: and(eq(prompts.id, promptId), eq(prompts.status, 'VOTING')),
    columns: { id: true, title: true, creatorId: true },
  });
  if (!prompt) return;

  // Find entry with highest likeCount
  const topEntry = await db.query.promptEntries.findFirst({
    where: eq(promptEntries.promptId, promptId),
    orderBy: [desc(promptEntries.likeCount), desc(promptEntries.createdAt)],
    columns: { id: true, userId: true, likeCount: true },
  });

  await db
    .update(prompts)
    .set({
      status: 'ENDED',
      communityWinnerId: topEntry?.id ?? null,
      updatedAt: new Date(),
    })
    .where(eq(prompts.id, promptId));

  if (topEntry && topEntry.userId !== prompt.creatorId) {
    void insertNotification({
      recipientId: topEntry.userId,
      actorId: prompt.creatorId,
      type: 'PROMPT_COMMUNITY_WIN',
      link: `/prompts/${promptId}`,
      metadata: { promptTitle: prompt.title },
    });
  }

  revalidatePath(`/prompts/${promptId}`);
}

export async function voteForEntryAction(
  entryId: string,
  promptId: string,
): Promise<ActionResult> {
  const userId = await requireAuth();

  const prompt = await db.query.prompts.findFirst({ where: eq(prompts.id, promptId) });
  if (!prompt || prompt.status !== 'VOTING') return { success: false, message: 'Voting is not open.' };

  const existingVote = await db.query.promptEntryLikes.findFirst({
    where: and(
      eq(promptEntryLikes.userId, userId),
      inArray(
        promptEntryLikes.entryId,
        db.select({ id: promptEntries.id }).from(promptEntries).where(eq(promptEntries.promptId, promptId)),
      ),
    ),
  });
  if (existingVote) return { success: false, message: 'You have already voted.' };

  const entry = await db.query.promptEntries.findFirst({ where: eq(promptEntries.id, entryId) });
  if (entry?.userId === userId) return { success: false, message: 'You cannot vote for your own entry.' };

  await db.insert(promptEntryLikes).values({ userId, entryId });
  await db
    .update(promptEntries)
    .set({ likeCount: sql`${promptEntries.likeCount} + 1` })
    .where(eq(promptEntries.id, entryId));

  revalidatePath(`/prompts/${promptId}`);
  return { success: true, message: 'Vote recorded.' };
}

export async function setAuthorChoiceAction(
  promptId: string,
  entryId: string,
): Promise<ActionResult> {
  const userId = await requireAuth();

  const prompt = await db.query.prompts.findFirst({
    where: and(eq(prompts.id, promptId), eq(prompts.creatorId, userId)),
    columns: { id: true, title: true, status: true },
  });
  if (!prompt) return { success: false, message: 'Prompt not found or unauthorized.' };
  if (prompt.status === 'ACTIVE') return { success: false, message: 'Cannot set author choice while prompt is active.' };

  const entry = await db.query.promptEntries.findFirst({
    where: and(eq(promptEntries.id, entryId), eq(promptEntries.promptId, promptId)),
    columns: { id: true, userId: true },
  });
  if (!entry) return { success: false, message: 'Entry not found.' };

  try {
    await db
      .update(prompts)
      .set({ authorChoiceId: entryId, updatedAt: new Date() })
      .where(eq(prompts.id, promptId));

    if (entry.userId !== userId) {
      void insertNotification({
        recipientId: entry.userId,
        actorId: userId,
        type: 'PROMPT_AUTHOR_CHOICE',
        link: `/prompts/${promptId}`,
        metadata: { promptTitle: prompt.title },
      });
    }

    revalidatePath(`/prompts/${promptId}`);
    return { success: true, message: 'Author choice set.' };
  } catch {
    return { success: false, message: 'Failed to set author choice.' };
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
  const limited = await checkActionRateLimit(userId);
  if (limited) return { success: false, message: limited };

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
      where: eq(users.id, userId),
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
  const limited = await checkActionRateLimit(userId);
  if (limited) return { success: false, message: limited };

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
      where: eq(users.id, userId),
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
          where: eq(users.id, userId),
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

export type InvitableFriend = {
  id: string;
  username: string | null;
  image: string | null;
};

export async function getPromptFriendsForInviteAction(
  promptId: string,
): Promise<InvitableFriend[]> {
  const userId = await requireAuth();

  const prompt = await db.query.prompts.findFirst({
    where: and(eq(prompts.id, promptId), eq(prompts.creatorId, userId)),
    columns: { id: true },
  });
  if (!prompt) return [];

  const [allFriendships, alreadyInvited] = await Promise.all([
    db.query.friendships.findMany({
      where: and(
        or(
          eq(friendships.requesterId, userId),
          eq(friendships.addresseeId, userId),
        ),
        eq(friendships.status, 'ACCEPTED'),
      ),
      with: {
        requester: { columns: { id: true, username: true, image: true } },
        addressee: { columns: { id: true, username: true, image: true } },
      },
    }),
    db.query.promptInvites.findMany({
      where: eq(promptInvites.promptId, promptId),
      columns: { userId: true },
    }),
  ]);

  const invitedIds = new Set(alreadyInvited.map((i) => i.userId));

  return allFriendships
    .map((f) => (f.requesterId === userId ? f.addressee : f.requester))
    .filter((u) => !invitedIds.has(u.id));
}

export async function getPromptPendingInvitedFriendsAction(
  promptId: string,
): Promise<InvitableFriend[]> {
  const userId = await requireAuth();

  const prompt = await db.query.prompts.findFirst({
    where: and(eq(prompts.id, promptId), eq(prompts.creatorId, userId)),
    columns: { id: true },
  });
  if (!prompt) return [];

  const [allFriendships, pendingInvites] = await Promise.all([
    db.query.friendships.findMany({
      where: and(
        or(eq(friendships.requesterId, userId), eq(friendships.addresseeId, userId)),
        eq(friendships.status, 'ACCEPTED'),
      ),
      with: {
        requester: { columns: { id: true, username: true, image: true } },
        addressee: { columns: { id: true, username: true, image: true } },
      },
    }),
    db.query.promptInvites.findMany({
      where: and(eq(promptInvites.promptId, promptId), eq(promptInvites.status, 'PENDING')),
      columns: { userId: true },
    }),
  ]);

  const pendingIds = new Set(pendingInvites.map((i) => i.userId));
  const friendUsers = allFriendships.map((f) =>
    f.requesterId === userId ? f.addressee : f.requester,
  );

  return friendUsers.filter((u) => pendingIds.has(u.id));
}

export async function inviteFriendsToPromptAction(
  promptId: string,
  invitedIds: string[],
): Promise<ActionResult> {
  if (invitedIds.length === 0) return { success: true, message: 'No invites sent.' };
  const userId = await requireAuth();

  const prompt = await db.query.prompts.findFirst({
    where: and(eq(prompts.id, promptId), eq(prompts.creatorId, userId)),
    columns: { id: true, title: true },
  });
  if (!prompt) return { success: false, message: 'Prompt not found or unauthorized.' };

  const existing = await db.query.promptInvites.findMany({
    where: eq(promptInvites.promptId, promptId),
    columns: { userId: true },
  });
  const existingIds = new Set(existing.map((i) => i.userId));
  const toAdd = invitedIds.filter((id) => !existingIds.has(id));
  if (toAdd.length === 0) return { success: true, message: 'All selected friends are already invited.' };

  try {
    await db.insert(promptInvites).values(toAdd.map((uid) => ({ promptId, userId: uid })));
    const actor = await db.query.users.findFirst({
      where: eq(users.id, userId),
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
          promptTitle: prompt.title,
        },
      });
    }
    revalidatePath(`/prompts/${promptId}`);
    return { success: true, message: `${toAdd.length} invite${toAdd.length !== 1 ? 's' : ''} sent!` };
  } catch {
    return { success: false, message: 'Failed to send invites.' };
  }
}
