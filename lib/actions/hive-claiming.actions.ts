'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { and, asc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { hiveChapterClaims, hiveMembers, hives, chapters } from '@/db/schema';
import type {
  ActionResult,
  ClaimStatus,
  ChapterWithClaim,
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


export async function getChaptersWithClaimsAction(
  hiveId: string,
): Promise<ChapterWithClaim[]> {
  const { userId } = await auth();
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

  const claims = await db.query.hiveChapterClaims.findMany({
    where: eq(hiveChapterClaims.hiveId, hiveId),
    with: { user: true },
  });

  const claimByChapterId = new Map(claims.map((c) => [c.chapterId, c]));

  return bookChapters.map((ch) => {
    const claim = claimByChapterId.get(ch.id);
    return {
      id: ch.id,
      bookId: ch.bookId,
      title: ch.title,
      order: ch.order,
      wordCount: ch.wordCount,
      claim: claim
        ? {
            id: claim.id,
            hiveId: claim.hiveId,
            chapterId: claim.chapterId,
            userId: claim.userId,
            status: claim.status as ClaimStatus,
            claimedAt: claim.claimedAt,
            completedAt: claim.completedAt,
            claimer: claim.user as HiveUser,
          }
        : null,
    };
  });
}

export async function claimChapterAction(
  hiveId: string,
  chapterId: string,
): Promise<ActionResult> {
  try {
    const { userId } = await requireHiveMember(hiveId);


    const hive = await db.query.hives.findFirst({ where: eq(hives.id, hiveId) });
    if (!hive?.bookId) return { success: false, message: 'No book linked to this hive.' };

    const chapter = await db.query.chapters.findFirst({
      where: and(eq(chapters.id, chapterId), eq(chapters.bookId, hive.bookId)),
    });
    if (!chapter) return { success: false, message: 'Chapter not found.' };


    const existing = await db.query.hiveChapterClaims.findFirst({
      where: and(
        eq(hiveChapterClaims.hiveId, hiveId),
        eq(hiveChapterClaims.chapterId, chapterId),
      ),
    });
    if (existing) return { success: false, message: 'Chapter already claimed.' };

    await db.insert(hiveChapterClaims).values({
      hiveId,
      chapterId,
      userId,
      status: 'CLAIMED',
    });

    revalidatePath(`/hive/${hiveId}/chapters`);
    return { success: true, message: 'Chapter claimed!' };
  } catch {
    return { success: false, message: 'Failed to claim chapter.' };
  }
}

export async function updateClaimStatusAction(
  hiveId: string,
  chapterId: string,
  status: ClaimStatus,
): Promise<ActionResult> {
  try {
    const userId = await requireAuth();

    const claim = await db.query.hiveChapterClaims.findFirst({
      where: and(
        eq(hiveChapterClaims.hiveId, hiveId),
        eq(hiveChapterClaims.chapterId, chapterId),
      ),
    });
    if (!claim) return { success: false, message: 'No claim found.' };

    const membership = await db.query.hiveMembers.findFirst({
      where: and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, userId)),
    });
    const canUpdate =
      claim.userId === userId ||
      membership?.role === 'OWNER' ||
      membership?.role === 'MODERATOR';
    if (!canUpdate) return { success: false, message: 'No permission.' };

    const completedAt = status === 'COMPLETED' ? new Date() : null;
    await db
      .update(hiveChapterClaims)
      .set({ status, completedAt })
      .where(
        and(
          eq(hiveChapterClaims.hiveId, hiveId),
          eq(hiveChapterClaims.chapterId, chapterId),
        ),
      );

    revalidatePath(`/hive/${hiveId}/chapters`);
    return { success: true, message: 'Status updated.' };
  } catch {
    return { success: false, message: 'Failed to update status.' };
  }
}

export async function unclaimChapterAction(
  hiveId: string,
  chapterId: string,
): Promise<ActionResult> {
  try {
    const userId = await requireAuth();

    const claim = await db.query.hiveChapterClaims.findFirst({
      where: and(
        eq(hiveChapterClaims.hiveId, hiveId),
        eq(hiveChapterClaims.chapterId, chapterId),
      ),
    });
    if (!claim) return { success: false, message: 'No claim found.' };

    const membership = await db.query.hiveMembers.findFirst({
      where: and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, userId)),
    });
    const canUnclaim =
      claim.userId === userId ||
      membership?.role === 'OWNER' ||
      membership?.role === 'MODERATOR';
    if (!canUnclaim) return { success: false, message: 'No permission.' };

    await db
      .delete(hiveChapterClaims)
      .where(
        and(
          eq(hiveChapterClaims.hiveId, hiveId),
          eq(hiveChapterClaims.chapterId, chapterId),
        ),
      );

    revalidatePath(`/hive/${hiveId}/chapters`);
    return { success: true, message: 'Chapter unclaimed.' };
  } catch {
    return { success: false, message: 'Failed to unclaim chapter.' };
  }
}
