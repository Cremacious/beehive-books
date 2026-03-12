'use server';

import { requireAuth, getOptionalUserId } from '@/lib/require-auth';

import { revalidatePath } from 'next/cache';
import { and, asc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { hiveBetaChapterStatus, hiveMembers, hives, chapters } from '@/db/schema';
import type {
  ActionResult,
  BetaChapterStatus,
  BetaChapterWithStatus,
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

export async function getBetaChaptersAction(hiveId: string): Promise<BetaChapterWithStatus[]> {
  const userId = await requireAuth();
  if (!userId) return [];

  const membership = await db.query.hiveMembers.findFirst({
    where: and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, userId)),
  });
  if (!membership) return [];

  const hive = await db.query.hives.findFirst({ where: eq(hives.id, hiveId) });
  if (!hive?.bookId) return [];

  const bookChapters = await db.query.chapters.findMany({
    where: eq(chapters.bookId, hive.bookId),
    orderBy: [asc(chapters.order)],
  });

  const statuses = await db.query.hiveBetaChapterStatus.findMany({
    where: eq(hiveBetaChapterStatus.hiveId, hiveId),
    with: { updatedBy: true },
  });

  const statusByChapterId = new Map(statuses.map((s) => [s.chapterId, s]));

  return bookChapters.map((ch) => {
    const s = statusByChapterId.get(ch.id);
    return {
      id: ch.id,
      bookId: ch.bookId,
      title: ch.title,
      order: ch.order,
      wordCount: ch.wordCount,
      betaStatus: s
        ? {
            id: s.id,
            status: s.status as BetaChapterStatus,
            updatedById: s.updatedById,
            updatedBy: s.updatedBy as HiveUser | null,
            updatedAt: s.updatedAt,
          }
        : null,
    };
  });
}

export async function updateBetaStatusAction(
  hiveId: string,
  chapterId: string,
  status: BetaChapterStatus,
): Promise<ActionResult> {
  try {
    const { userId } = await requireHiveMember(hiveId);

    const existing = await db.query.hiveBetaChapterStatus.findFirst({
      where: and(
        eq(hiveBetaChapterStatus.hiveId, hiveId),
        eq(hiveBetaChapterStatus.chapterId, chapterId),
      ),
    });

    if (existing) {
      await db
        .update(hiveBetaChapterStatus)
        .set({ status, updatedById: userId, updatedAt: new Date() })
        .where(
          and(
            eq(hiveBetaChapterStatus.hiveId, hiveId),
            eq(hiveBetaChapterStatus.chapterId, chapterId),
          ),
        );
    } else {
      await db.insert(hiveBetaChapterStatus).values({
        hiveId,
        chapterId,
        status,
        updatedById: userId,
      });
    }

    revalidatePath(`/hive/${hiveId}/beta`);
    return { success: true, message: 'Status updated.' };
  } catch {
    return { success: false, message: 'Failed to update status.' };
  }
}
