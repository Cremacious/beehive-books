'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { and, desc, eq, gte, sum } from 'drizzle-orm';
import { db } from '@/db';
import { hiveWordGoals, hiveWordLogs, hiveMembers } from '@/db/schema';
import type { ActionResult, WordGoalType, WordGoal, WordLog, HiveUser } from '@/lib/types/hive.types';

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

function windowStart(type: WordGoalType): Date | null {
  const now = new Date();
  if (type === 'DAILY') {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (type === 'WEEKLY') {
    const d = new Date(now);
    const day = d.getDay(); 
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  return null; 
}

export async function getWordGoalsAction(hiveId: string): Promise<WordGoal[]> {
  const { userId } = await auth();
  if (!userId) return [];

  const membership = await db.query.hiveMembers.findFirst({
    where: and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, userId)),
  });
  if (!membership) return [];

  const goals = await db.query.hiveWordGoals.findMany({
    where: eq(hiveWordGoals.hiveId, hiveId),
    orderBy: [desc(hiveWordGoals.createdAt)],
  });

 
  const result: WordGoal[] = await Promise.all(
    goals.map(async (g) => {
      const type = g.type as WordGoalType;
      const start = windowStart(type);

      const conditions = [eq(hiveWordLogs.hiveId, hiveId)];
      if (start) conditions.push(gte(hiveWordLogs.loggedAt, start));

      const [agg] = await db
        .select({ total: sum(hiveWordLogs.wordsAdded) })
        .from(hiveWordLogs)
        .where(and(...conditions));

      return {
        id: g.id,
        hiveId: g.hiveId,
        createdById: g.createdById,
        type,
        targetWords: g.targetWords,
        startDate: g.startDate,
        endDate: g.endDate,
        isActive: g.isActive,
        createdAt: g.createdAt,
        currentWords: Number(agg?.total ?? 0),
      };
    }),
  );

  return result;
}

export async function getWordLogsAction(hiveId: string, limit = 20): Promise<WordLog[]> {
  const { userId } = await auth();
  if (!userId) return [];

  const membership = await db.query.hiveMembers.findFirst({
    where: and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, userId)),
  });
  if (!membership) return [];

  const logs = await db.query.hiveWordLogs.findMany({
    where: eq(hiveWordLogs.hiveId, hiveId),
    with: { user: true },
    orderBy: [desc(hiveWordLogs.loggedAt)],
    limit,
  });

  return logs.map((l) => ({
    id: l.id,
    hiveId: l.hiveId,
    userId: l.userId,
    chapterId: l.chapterId,
    wordsAdded: l.wordsAdded,
    loggedAt: l.loggedAt,
    user: l.user as HiveUser,
  }));
}

export async function logWordsAction(
  hiveId: string,
  wordsAdded: number,
  chapterId?: string,
): Promise<ActionResult> {
  try {
    const { userId } = await requireHiveMember(hiveId);

    if (!Number.isInteger(wordsAdded) || wordsAdded < 1) {
      return { success: false, message: 'Enter a positive number of words.' };
    }
    if (wordsAdded > 100000) {
      return { success: false, message: 'Word count seems too high (max 100,000).' };
    }

    await db.insert(hiveWordLogs).values({
      hiveId,
      userId,
      chapterId: chapterId ?? null,
      wordsAdded,
    });

    revalidatePath(`/hive/${hiveId}/word-goals`);
    return { success: true, message: `Logged ${wordsAdded.toLocaleString()} words!` };
  } catch {
    return { success: false, message: 'Failed to log words.' };
  }
}

export async function createWordGoalAction(
  hiveId: string,
  type: WordGoalType,
  targetWords: number,
  endDate?: string,
): Promise<ActionResult> {
  try {
    const { userId, membership } = await requireHiveMember(hiveId);

    const canCreate = membership.role === 'OWNER' || membership.role === 'MODERATOR';
    if (!canCreate) return { success: false, message: 'Only owners and moderators can create goals.' };

    if (!Number.isInteger(targetWords) || targetWords < 1) {
      return { success: false, message: 'Target must be a positive number.' };
    }

    await db.insert(hiveWordGoals).values({
      hiveId,
      createdById: userId,
      type,
      targetWords,
      endDate: endDate ? new Date(endDate) : null,
    });

    revalidatePath(`/hive/${hiveId}/word-goals`);
    return { success: true, message: 'Goal created!' };
  } catch {
    return { success: false, message: 'Failed to create goal.' };
  }
}

export async function deactivateWordGoalAction(goalId: string): Promise<ActionResult> {
  try {
    const userId = await requireAuth();

    const goal = await db.query.hiveWordGoals.findFirst({
      where: eq(hiveWordGoals.id, goalId),
    });
    if (!goal) return { success: false, message: 'Goal not found.' };

    const membership = await db.query.hiveMembers.findFirst({
      where: and(eq(hiveMembers.hiveId, goal.hiveId), eq(hiveMembers.userId, userId)),
    });
    const canDeactivate = membership?.role === 'OWNER' || membership?.role === 'MODERATOR';
    if (!canDeactivate) return { success: false, message: 'No permission.' };

    await db.update(hiveWordGoals).set({ isActive: false }).where(eq(hiveWordGoals.id, goalId));
    revalidatePath(`/hive/${goal.hiveId}/word-goals`);
    return { success: true, message: 'Goal deactivated.' };
  } catch {
    return { success: false, message: 'Failed to deactivate goal.' };
  }
}
