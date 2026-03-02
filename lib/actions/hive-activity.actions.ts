'use server';

import { auth } from '@clerk/nextjs/server';
import { and, desc, eq, gte } from 'drizzle-orm';
import { db } from '@/db';
import {
  hiveMembers,
  hiveWordLogs,
  hiveMilestones,
  hiveSprints,
  hiveChapterClaims,
  hiveWikiEntries,
  hiveInlineComments,
} from '@/db/schema';
import {
  MILESTONE_INFO,
  type ActivityEvent,
  type HiveUser,
  type MilestoneType,
} from '@/lib/types/hive.types';

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

export async function getHiveActivityAction(
  hiveId: string,
  limit = 40,
): Promise<ActivityEvent[]> {
  const { userId } = await auth();
  if (!userId) return [];

  const membership = await db.query.hiveMembers.findFirst({
    where: and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, userId)),
  });
  if (!membership) return [];

  const cutoff = new Date(Date.now() - THIRTY_DAYS);

  const [wordLogs, milestones, sprints, claims, wikiEntries, comments] = await Promise.all([
    db.query.hiveWordLogs.findMany({
      where: and(eq(hiveWordLogs.hiveId, hiveId), gte(hiveWordLogs.loggedAt, cutoff)),
      with: { user: true },
      orderBy: [desc(hiveWordLogs.loggedAt)],
      limit: 20,
    }),
    db.query.hiveMilestones.findMany({
      where: and(eq(hiveMilestones.hiveId, hiveId), gte(hiveMilestones.unlockedAt, cutoff)),
      with: { user: true },
      orderBy: [desc(hiveMilestones.unlockedAt)],
      limit: 15,
    }),
    db.query.hiveSprints.findMany({
      where: and(eq(hiveSprints.hiveId, hiveId), gte(hiveSprints.createdAt, cutoff)),
      with: { startedBy: true },
      orderBy: [desc(hiveSprints.createdAt)],
      limit: 10,
    }),
    db.query.hiveChapterClaims.findMany({
      where: and(
        eq(hiveChapterClaims.hiveId, hiveId),
        gte(hiveChapterClaims.claimedAt, cutoff),
      ),
      with: { user: true, chapter: true },
      orderBy: [desc(hiveChapterClaims.claimedAt)],
      limit: 10,
    }),
    db.query.hiveWikiEntries.findMany({
      where: and(eq(hiveWikiEntries.hiveId, hiveId), gte(hiveWikiEntries.createdAt, cutoff)),
      with: { author: true },
      orderBy: [desc(hiveWikiEntries.createdAt)],
      limit: 10,
    }),
    db.query.hiveInlineComments.findMany({
      where: and(
        eq(hiveInlineComments.hiveId, hiveId),
        gte(hiveInlineComments.createdAt, cutoff),
      ),
      with: { author: true },
      orderBy: [desc(hiveInlineComments.createdAt)],
      limit: 10,
    }),
  ]);

  const events: ActivityEvent[] = [];

  for (const l of wordLogs) {
    events.push({
      id: `wl-${l.id}`,
      type: 'WORD_LOG',
      userId: l.userId,
      timestamp: l.loggedAt,
      user: l.user as HiveUser,
      meta: { words: l.wordsAdded },
    });
  }

  for (const m of milestones) {
    const info = MILESTONE_INFO[m.type as MilestoneType];
    events.push({
      id: `ms-${m.id}`,
      type: 'MILESTONE',
      userId: m.userId,
      timestamp: m.unlockedAt,
      user: m.user as HiveUser,
      meta: { milestoneType: m.type, label: info.label, icon: info.icon },
    });
  }

  for (const s of sprints) {
    const isCompleted = s.status === 'COMPLETED';
    events.push({
      id: `sp-${s.id}`,
      type: isCompleted ? 'SPRINT_ENDED' : 'SPRINT_STARTED',
      userId: s.startedById,
      timestamp: isCompleted && s.endTime ? s.endTime : s.createdAt,
      user: s.startedBy as HiveUser,
      meta: { durationMinutes: s.durationMinutes },
    });
  }

  for (const c of claims) {
    const chapterTitle =
      (c.chapter as { title?: string } | null)?.title ?? 'a chapter';
    const isCompleted = c.status === 'COMPLETED';
    events.push({
      id: `cc-${c.id}`,
      type: isCompleted ? 'CHAPTER_COMPLETED' : 'CHAPTER_CLAIMED',
      userId: c.userId,
      timestamp: isCompleted && c.completedAt ? c.completedAt : c.claimedAt,
      user: c.user as HiveUser,
      meta: { chapterTitle },
    });
  }

  for (const w of wikiEntries) {
    events.push({
      id: `we-${w.id}`,
      type: 'WIKI_ENTRY',
      userId: w.authorId,
      timestamp: w.createdAt,
      user: w.author as HiveUser,
      meta: { title: w.title, category: w.category },
    });
  }

  for (const ic of comments) {
    events.push({
      id: `ic-${ic.id}`,
      type: 'INLINE_COMMENT',
      userId: ic.authorId,
      timestamp: ic.createdAt,
      user: ic.author as HiveUser,
      meta: { layer: ic.layer },
    });
  }

  return events
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}
