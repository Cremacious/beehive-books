'use server';

import { requireAuth, getOptionalUserId } from '@/lib/require-auth';

import { revalidatePath } from 'next/cache';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { hivePolls, hivePollVotes, hiveMembers, hives, users } from '@/db/schema';
import { insertNotification } from '@/lib/notifications';
import type {
  ActionResult,
  PollStatus,
  PollWithResults,
  HiveUser,
} from '@/lib/types/hive.types';

async function requireHiveMember(hiveId: string) {
  const userId = await requireAuth();
  const membership = await db.query.hiveMembers.findFirst({
    where: and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, userId)),
  });
  if (!membership) throw new Error('Not a member of this hive');
  return { userId, membership };
}

function buildPollResults(
  poll: {
    id: string;
    hiveId: string;
    authorId: string;
    question: string;
    options: string[];
    isMultiChoice: boolean;
    endsAt: Date | null;
    status: string;
    createdAt: Date;
    author: HiveUser;
    votes: { userId: string; selectedOptions: number[] }[];
  },
  currentUserId: string | null,
): PollWithResults {
  const totalVotes = poll.votes.length;
  const optionCounts = (poll.options as string[]).map((_, idx) =>
    poll.votes.filter((v) => (v.selectedOptions as number[]).includes(idx)).length,
  );
  const myVote = currentUserId
    ? (poll.votes.find((v) => v.userId === currentUserId)?.selectedOptions as number[]) ?? null
    : null;

  return {
    id: poll.id,
    hiveId: poll.hiveId,
    authorId: poll.authorId,
    question: poll.question,
    options: poll.options as string[],
    isMultiChoice: poll.isMultiChoice,
    endsAt: poll.endsAt,
    status: poll.status as PollStatus,
    createdAt: poll.createdAt,
    author: poll.author as HiveUser,
    totalVotes,
    optionCounts,
    mySelectedOptions: myVote,
  };
}

export async function getPollsAction(hiveId: string): Promise<PollWithResults[]> {
  const userId = await requireAuth();
  if (!userId) return [];

  const membership = await db.query.hiveMembers.findFirst({
    where: and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, userId)),
  });
  if (!membership) return [];

  const polls = await db.query.hivePolls.findMany({
    where: eq(hivePolls.hiveId, hiveId),
    with: { author: true, votes: true },
    orderBy: [desc(hivePolls.createdAt)],
  });

 
  const now = new Date();
  for (const poll of polls) {
    if (poll.status === 'ACTIVE' && poll.endsAt && poll.endsAt < now) {
      await db
        .update(hivePolls)
        .set({ status: 'CLOSED' })
        .where(eq(hivePolls.id, poll.id));
      poll.status = 'CLOSED';
    }
  }

  return polls.map((p) => buildPollResults(p as Parameters<typeof buildPollResults>[0], userId));
}

export async function createPollAction(
  hiveId: string,
  question: string,
  options: string[],
  isMultiChoice: boolean,
  endsAt?: string,
): Promise<ActionResult & { pollId?: string }> {
  try {
    const { userId } = await requireHiveMember(hiveId);

    if (!question.trim()) return { success: false, message: 'Question is required.' };
    const cleanOptions = options.map((o) => o.trim()).filter(Boolean);
    if (cleanOptions.length < 2) return { success: false, message: 'At least 2 options required.' };
    if (cleanOptions.length > 10) return { success: false, message: 'Maximum 10 options.' };

    const endsAtDate = endsAt ? new Date(endsAt) : null;
    if (endsAtDate && endsAtDate <= new Date()) {
      return { success: false, message: 'End date must be in the future.' };
    }

    const [poll] = await db
      .insert(hivePolls)
      .values({
        hiveId,
        authorId: userId,
        question: question.trim(),
        options: cleanOptions,
        isMultiChoice,
        endsAt: endsAtDate,
      })
      .returning({ id: hivePolls.id });


    const hive = await db.query.hives.findFirst({ where: eq(hives.id, hiveId) });
    const actor = await db.query.users.findFirst({ where: eq(users.id, userId) });
    const members = await db.query.hiveMembers.findMany({
      where: eq(hiveMembers.hiveId, hiveId),
    });
    for (const member of members) {
      void insertNotification({
        recipientId: member.userId,
        actorId: userId,
        type: 'HIVE_POLL',
        link: `/hive/${hiveId}/polls`,
        metadata: {
          actorUsername: actor?.username ?? '',
          hiveName: hive?.name ?? '',
          hiveId,
          question: question.trim().slice(0, 80),
        },
      });
    }

    revalidatePath(`/hive/${hiveId}/polls`);
    return { success: true, message: 'Poll created.', pollId: poll.id };
  } catch {
    return { success: false, message: 'Failed to create poll.' };
  }
}

export async function voteOnPollAction(
  pollId: string,
  selectedOptions: number[],
): Promise<ActionResult> {
  try {
    const userId = await requireAuth();

    const poll = await db.query.hivePolls.findFirst({
      where: eq(hivePolls.id, pollId),
    });
    if (!poll) return { success: false, message: 'Poll not found.' };
    if (poll.status === 'CLOSED') return { success: false, message: 'This poll is closed.' };
    if (poll.endsAt && poll.endsAt < new Date()) {
      return { success: false, message: 'This poll has ended.' };
    }

    const membership = await db.query.hiveMembers.findFirst({
      where: and(eq(hiveMembers.hiveId, poll.hiveId), eq(hiveMembers.userId, userId)),
    });
    if (!membership) return { success: false, message: 'Not a hive member.' };

    if (selectedOptions.some((i) => i < 0 || i >= (poll.options as string[]).length)) {
      return { success: false, message: 'Invalid option selected.' };
    }
    if (!poll.isMultiChoice && selectedOptions.length > 1) {
      return { success: false, message: 'This poll is single choice only.' };
    }
    if (selectedOptions.length === 0) {
      return { success: false, message: 'Select at least one option.' };
    }

    const existing = await db.query.hivePollVotes.findFirst({
      where: and(eq(hivePollVotes.pollId, pollId), eq(hivePollVotes.userId, userId)),
    });

    if (existing) {
      await db
        .update(hivePollVotes)
        .set({ selectedOptions })
        .where(and(eq(hivePollVotes.pollId, pollId), eq(hivePollVotes.userId, userId)));
    } else {
      await db.insert(hivePollVotes).values({ pollId, userId, selectedOptions });
    }

    revalidatePath(`/hive/${poll.hiveId}/polls`);
    return { success: true, message: 'Vote recorded.' };
  } catch {
    return { success: false, message: 'Failed to record vote.' };
  }
}

export async function closePollAction(pollId: string): Promise<ActionResult> {
  try {
    const userId = await requireAuth();

    const poll = await db.query.hivePolls.findFirst({ where: eq(hivePolls.id, pollId) });
    if (!poll) return { success: false, message: 'Poll not found.' };

    const membership = await db.query.hiveMembers.findFirst({
      where: and(eq(hiveMembers.hiveId, poll.hiveId), eq(hiveMembers.userId, userId)),
    });
    const canClose =
      poll.authorId === userId ||
      membership?.role === 'OWNER' ||
      membership?.role === 'MODERATOR';
    if (!canClose) return { success: false, message: 'No permission.' };

    await db.update(hivePolls).set({ status: 'CLOSED' }).where(eq(hivePolls.id, pollId));
    revalidatePath(`/hive/${poll.hiveId}/polls`);
    return { success: true, message: 'Poll closed.' };
  } catch {
    return { success: false, message: 'Failed to close poll.' };
  }
}

export async function deletePollAction(pollId: string): Promise<ActionResult> {
  try {
    const userId = await requireAuth();

    const poll = await db.query.hivePolls.findFirst({ where: eq(hivePolls.id, pollId) });
    if (!poll) return { success: false, message: 'Poll not found.' };

    const membership = await db.query.hiveMembers.findFirst({
      where: and(eq(hiveMembers.hiveId, poll.hiveId), eq(hiveMembers.userId, userId)),
    });
    const canDelete =
      poll.authorId === userId ||
      membership?.role === 'OWNER' ||
      membership?.role === 'MODERATOR';
    if (!canDelete) return { success: false, message: 'No permission.' };

    await db.delete(hivePolls).where(eq(hivePolls.id, pollId));
    revalidatePath(`/hive/${poll.hiveId}/polls`);
    return { success: true, message: 'Poll deleted.' };
  } catch {
    return { success: false, message: 'Failed to delete poll.' };
  }
}
