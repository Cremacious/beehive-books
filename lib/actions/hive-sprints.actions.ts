'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { hiveSprints, hiveSprintParticipants, hiveMembers } from '@/db/schema';
import type { ActionResult, SprintWithParticipants, HiveUser } from '@/lib/types/hive.types';

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

function mapSprint(s: {
  id: string;
  hiveId: string;
  startedById: string;
  durationMinutes: number;
  startTime: Date;
  endTime: Date | null;
  status: string;
  winnerId: string | null;
  createdAt: Date;
  startedBy: HiveUser;
  winner: HiveUser | null;
  participants: {
    id: string;
    sprintId: string;
    userId: string;
    wordsBefore: number;
    wordsAfter: number | null;
    joinedAt: Date;
    user: HiveUser;
  }[];
}): SprintWithParticipants {
  return {
    id: s.id,
    hiveId: s.hiveId,
    startedById: s.startedById,
    durationMinutes: s.durationMinutes,
    startTime: s.startTime,
    endTime: s.endTime,
    status: s.status as 'ACTIVE' | 'COMPLETED',
    winnerId: s.winnerId,
    createdAt: s.createdAt,
    startedBy: s.startedBy as HiveUser,
    winner: s.winner as HiveUser | null,
    participants: s.participants.map((p) => ({
      id: p.id,
      sprintId: p.sprintId,
      userId: p.userId,
      wordsBefore: p.wordsBefore,
      wordsAfter: p.wordsAfter,
      joinedAt: p.joinedAt,
      user: p.user as HiveUser,
      wordsWritten: p.wordsAfter !== null ? p.wordsAfter - p.wordsBefore : null,
    })),
  };
}

const WITH_FULL = {
  startedBy: true,
  winner: true,
  participants: { with: { user: true } },
} as const;

export async function getActiveSprintAction(
  hiveId: string,
): Promise<SprintWithParticipants | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const membership = await db.query.hiveMembers.findFirst({
    where: and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, userId)),
  });
  if (!membership) return null;

  const sprint = await db.query.hiveSprints.findFirst({
    where: and(eq(hiveSprints.hiveId, hiveId), eq(hiveSprints.status, 'ACTIVE')),
    with: WITH_FULL,
  });

  return sprint ? mapSprint(sprint as Parameters<typeof mapSprint>[0]) : null;
}

export async function getPastSprintsAction(
  hiveId: string,
  limit = 10,
): Promise<SprintWithParticipants[]> {
  const { userId } = await auth();
  if (!userId) return [];

  const membership = await db.query.hiveMembers.findFirst({
    where: and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, userId)),
  });
  if (!membership) return [];

  const sprints = await db.query.hiveSprints.findMany({
    where: and(eq(hiveSprints.hiveId, hiveId), eq(hiveSprints.status, 'COMPLETED')),
    with: WITH_FULL,
    orderBy: [desc(hiveSprints.createdAt)],
    limit,
  });

  return sprints.map((s) => mapSprint(s as Parameters<typeof mapSprint>[0]));
}

export async function startSprintAction(
  hiveId: string,
  durationMinutes: number,
  wordsBefore: number,
): Promise<ActionResult & { sprintId?: string }> {
  try {
    const { userId } = await requireHiveMember(hiveId);

    if (![10, 15, 20, 25, 30, 45, 60].includes(durationMinutes)) {
      return { success: false, message: 'Invalid duration.' };
    }


    const existing = await db.query.hiveSprints.findFirst({
      where: and(eq(hiveSprints.hiveId, hiveId), eq(hiveSprints.status, 'ACTIVE')),
    });
    if (existing) return { success: false, message: 'A sprint is already active.' };

    const [sprint] = await db
      .insert(hiveSprints)
      .values({ hiveId, startedById: userId, durationMinutes })
      .returning({ id: hiveSprints.id });

 
    await db.insert(hiveSprintParticipants).values({
      sprintId: sprint.id,
      userId,
      wordsBefore: Math.max(0, wordsBefore),
    });

    revalidatePath(`/hive/${hiveId}/sprint`);
    return { success: true, message: 'Sprint started!', sprintId: sprint.id };
  } catch {
    return { success: false, message: 'Failed to start sprint.' };
  }
}

export async function joinSprintAction(
  hiveId: string,
  sprintId: string,
  wordsBefore: number,
): Promise<ActionResult> {
  try {
    const { userId } = await requireHiveMember(hiveId);

    const sprint = await db.query.hiveSprints.findFirst({
      where: and(eq(hiveSprints.id, sprintId), eq(hiveSprints.hiveId, hiveId)),
    });
    if (!sprint || sprint.status !== 'ACTIVE') {
      return { success: false, message: 'No active sprint found.' };
    }

    const already = await db.query.hiveSprintParticipants.findFirst({
      where: and(
        eq(hiveSprintParticipants.sprintId, sprintId),
        eq(hiveSprintParticipants.userId, userId),
      ),
    });
    if (already) return { success: false, message: 'Already joined.' };

    await db.insert(hiveSprintParticipants).values({
      sprintId,
      userId,
      wordsBefore: Math.max(0, wordsBefore),
    });

    revalidatePath(`/hive/${hiveId}/sprint`);
    return { success: true, message: 'Joined sprint!' };
  } catch {
    return { success: false, message: 'Failed to join sprint.' };
  }
}

export async function submitWordsAction(
  hiveId: string,
  sprintId: string,
  wordsAfter: number,
): Promise<ActionResult> {
  try {
    const { userId } = await requireHiveMember(hiveId);

    const participant = await db.query.hiveSprintParticipants.findFirst({
      where: and(
        eq(hiveSprintParticipants.sprintId, sprintId),
        eq(hiveSprintParticipants.userId, userId),
      ),
    });
    if (!participant) return { success: false, message: 'You have not joined this sprint.' };

    if (!Number.isInteger(wordsAfter) || wordsAfter < 0) {
      return { success: false, message: 'Enter a valid word count.' };
    }

    await db
      .update(hiveSprintParticipants)
      .set({ wordsAfter: Math.max(wordsAfter, participant.wordsBefore) })
      .where(
        and(
          eq(hiveSprintParticipants.sprintId, sprintId),
          eq(hiveSprintParticipants.userId, userId),
        ),
      );

    revalidatePath(`/hive/${hiveId}/sprint`);
    return { success: true, message: 'Words submitted!' };
  } catch {
    return { success: false, message: 'Failed to submit words.' };
  }
}

export async function endSprintAction(hiveId: string, sprintId: string): Promise<ActionResult> {
  try {
    const { userId, membership } = await requireHiveMember(hiveId);

    const sprint = await db.query.hiveSprints.findFirst({
      where: and(eq(hiveSprints.id, sprintId), eq(hiveSprints.hiveId, hiveId)),
      with: { participants: true },
    });
    if (!sprint || sprint.status !== 'ACTIVE') {
      return { success: false, message: 'No active sprint to end.' };
    }

    const canEnd =
      sprint.startedById === userId ||
      membership.role === 'OWNER' ||
      membership.role === 'MODERATOR';
    if (!canEnd) return { success: false, message: 'No permission to end this sprint.' };


    let winnerId: string | null = null;
    let best = -1;
    for (const p of sprint.participants) {
      if (p.wordsAfter !== null) {
        const written = p.wordsAfter - p.wordsBefore;
        if (written > best) {
          best = written;
          winnerId = p.userId;
        }
      }
    }

    await db
      .update(hiveSprints)
      .set({ status: 'COMPLETED', endTime: new Date(), winnerId })
      .where(eq(hiveSprints.id, sprintId));

    revalidatePath(`/hive/${hiveId}/sprint`);
    return { success: true, message: 'Sprint ended!' };
  } catch {
    return { success: false, message: 'Failed to end sprint.' };
  }
}
