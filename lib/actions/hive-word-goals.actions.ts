'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { and, desc, eq, gte, lte, sum } from 'drizzle-orm';
import { db } from '@/db';
import { hiveWordGoals, hiveWordLogs, hiveMembers } from '@/db/schema';
import type {
  ActionResult,
  WordGoalType,
  WordGoal,
  WordLog,
  HiveUser,
} from '@/lib/types/hive.types';

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

/** Auto-deactivate any MONTHLY goals whose endDate is in the past. */
async function expireMonthlyGoals(hiveId: string) {
  const now = new Date();
  await db
    .update(hiveWordGoals)
    .set({ isActive: false })
    .where(
      and(
        eq(hiveWordGoals.hiveId, hiveId),
        eq(hiveWordGoals.isActive, true),
        eq(hiveWordGoals.type, 'MONTHLY'),
        lte(hiveWordGoals.endDate, now),
      ),
    );
}

export async function getWordGoalsAction(hiveId: string): Promise<WordGoal[]> {
  const { userId } = await auth();
  if (!userId) return [];

  const membership = await db.query.hiveMembers.findFirst({
    where: and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, userId)),
  });
  if (!membership) return [];

  await expireMonthlyGoals(hiveId);

  const goals = await db.query.hiveWordGoals.findMany({
    where: eq(hiveWordGoals.hiveId, hiveId),
    orderBy: [desc(hiveWordGoals.createdAt)],
  });

  const result: WordGoal[] = await Promise.all(
    goals.map(async (g) => {
      const type = g.type as WordGoalType;

      let windowFrom: Date | null = null;
      let windowTo: Date | null = null;

      if (type === 'DAILY') {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        windowFrom = d;
      } else if (type === 'WEEKLY') {
        const d = new Date();
        const day = d.getDay();
        d.setDate(d.getDate() - day);
        d.setHours(0, 0, 0, 0);
        windowFrom = d;
      } else if (type === 'MONTHLY') {
        windowFrom = g.startDate;
        windowTo = g.endDate;
      }

      const conditions = [eq(hiveWordLogs.hiveId, hiveId)];
      if (windowFrom) conditions.push(gte(hiveWordLogs.loggedAt, windowFrom));
      if (windowTo) conditions.push(lte(hiveWordLogs.loggedAt, windowTo));

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

export async function getWordLogsAction(
  hiveId: string,
  limit = 20,
): Promise<WordLog[]> {
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
      return {
        success: false,
        message: 'Word count seems too high (max 100,000).',
      };
    }

    await db.insert(hiveWordLogs).values({
      hiveId,
      userId,
      chapterId: chapterId ?? null,
      wordsAdded,
    });

    await expireMonthlyGoals(hiveId);

    revalidatePath(`/hive/${hiveId}/word-goals`);
    return {
      success: true,
      message: `Logged ${wordsAdded.toLocaleString()} words!`,
    };
  } catch {
    return { success: false, message: 'Failed to log words.' };
  }
}

export async function createWordGoalAction(
  hiveId: string,
  type: WordGoalType,
  targetWords: number,

  endDateOrMonth?: string,
): Promise<ActionResult> {
  try {
    const { userId, membership } = await requireHiveMember(hiveId);

    const canCreate =
      membership.role === 'OWNER' || membership.role === 'MODERATOR';
    if (!canCreate)
      return {
        success: false,
        message: 'Only owners and moderators can create goals.',
      };

    if (!Number.isInteger(targetWords) || targetWords < 1) {
      return { success: false, message: 'Target must be a positive number.' };
    }

    let startDate: Date | undefined;
    let endDate: Date | null = null;

    if (type === 'MONTHLY') {
      if (!endDateOrMonth) {
        return {
          success: false,
          message: 'A month must be selected for monthly goals.',
        };
      }
      const [yearStr, monthStr] = endDateOrMonth.split('-');
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10); 
      if (!year || !month || month < 1 || month > 12) {
        return { success: false, message: 'Invalid month selected.' };
      }

      startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);

      endDate = new Date(year, month, 0, 23, 59, 59, 999);
    } else {
      endDate = endDateOrMonth ? new Date(endDateOrMonth) : null;
    }

    await db.insert(hiveWordGoals).values({
      hiveId,
      createdById: userId,
      type,
      targetWords,
      ...(startDate ? { startDate } : {}),
      endDate,
    });

    revalidatePath(`/hive/${hiveId}/word-goals`);
    return { success: true, message: 'Goal created!' };
  } catch {
    return { success: false, message: 'Failed to create goal.' };
  }
}

export async function deactivateWordGoalAction(
  goalId: string,
): Promise<ActionResult> {
  try {
    const userId = await requireAuth();

    const goal = await db.query.hiveWordGoals.findFirst({
      where: eq(hiveWordGoals.id, goalId),
    });
    if (!goal) return { success: false, message: 'Goal not found.' };

    const membership = await db.query.hiveMembers.findFirst({
      where: and(
        eq(hiveMembers.hiveId, goal.hiveId),
        eq(hiveMembers.userId, userId),
      ),
    });
    const canDeactivate =
      membership?.role === 'OWNER' || membership?.role === 'MODERATOR';
    if (!canDeactivate) return { success: false, message: 'No permission.' };

    await db
      .update(hiveWordGoals)
      .set({ isActive: false })
      .where(eq(hiveWordGoals.id, goalId));
    revalidatePath(`/hive/${goal.hiveId}/word-goals`);
    return { success: true, message: 'Goal deactivated.' };
  } catch {
    return { success: false, message: 'Failed to deactivate goal.' };
  }
}
