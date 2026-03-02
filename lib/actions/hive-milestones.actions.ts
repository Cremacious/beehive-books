'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { hiveMilestones, hiveMembers } from '@/db/schema';
import type {
  ActionResult,
  MilestoneType,
  MilestoneWithUser,
  HiveUser,
} from '@/lib/types/hive.types';

async function requireAuth() {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  return userId;
}

export async function getMilestonesAction(
  hiveId: string,
): Promise<MilestoneWithUser[]> {
  const { userId } = await auth();
  if (!userId) return [];

  const membership = await db.query.hiveMembers.findFirst({
    where: and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, userId)),
  });
  if (!membership) return [];

  const milestones = await db.query.hiveMilestones.findMany({
    where: eq(hiveMilestones.hiveId, hiveId),
    with: { user: true },
    orderBy: [desc(hiveMilestones.unlockedAt)],
  });

  return milestones.map((m) => ({
    id: m.id,
    hiveId: m.hiveId,
    userId: m.userId,
    type: m.type as MilestoneType,
    unlockedAt: m.unlockedAt,
    metadata: m.metadata as Record<string, string>,
    user: m.user as HiveUser,
  }));
}

export async function awardMilestoneAction(
  hiveId: string,
  targetUserId: string,
  type: MilestoneType,
  metadata: Record<string, string> = {},
): Promise<ActionResult> {
  try {
    await requireAuth();

    const membership = await db.query.hiveMembers.findFirst({
      where: and(
        eq(hiveMembers.hiveId, hiveId),
        eq(hiveMembers.userId, targetUserId),
      ),
    });
    if (!membership)
      return { success: false, message: 'User is not a hive member.' };

    await db
      .insert(hiveMilestones)
      .values({ hiveId, userId: targetUserId, type, metadata })
      .onConflictDoNothing();

    revalidatePath(`/hive/${hiveId}/milestones`);
    return { success: true, message: 'Milestone awarded!' };
  } catch {
    return { success: false, message: 'Failed to award milestone.' };
  }
}

export async function awardMyMilestoneAction(
  hiveId: string,
  type: MilestoneType,
  metadata: Record<string, string> = {},
): Promise<void> {
  try {
    const { userId } = await auth();
    if (!userId) return;

    const membership = await db.query.hiveMembers.findFirst({
      where: and(
        eq(hiveMembers.hiveId, hiveId),
        eq(hiveMembers.userId, userId),
      ),
    });
    if (!membership) return;

    await db
      .insert(hiveMilestones)
      .values({ hiveId, userId, type, metadata })
      .onConflictDoNothing();

    revalidatePath(`/hive/${hiveId}/milestones`);
  } catch {}
}
