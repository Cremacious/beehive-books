'use server';

import { requireAuth } from '@/lib/require-auth';
import { checkActionRateLimit } from '@/lib/check-action-rate-limit';
import { insertNotification } from '@/lib/notifications';
import { revalidatePath } from 'next/cache';
import { and, count, desc, eq, sql } from 'drizzle-orm';
import { db } from '@/db';
import {
  hiveChapterSuggestions,
  hiveMembers,
  hives,
  chapters,
  users,
} from '@/db/schema';
import type {
  ActionResult,
  HiveChapterSuggestion,
  HiveRole,
} from '@/lib/types/hive.types';

async function requireHiveMember(hiveId: string) {
  const userId = await requireAuth();
  const membership = await db.query.hiveMembers.findFirst({
    where: and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, userId)),
  });
  if (!membership) throw new Error('Not a member of this hive');
  return { userId, membership };
}

async function requireHiveMod(hiveId: string) {
  const { userId, membership } = await requireHiveMember(hiveId);
  if (membership.role === 'CONTRIBUTOR' || membership.role === 'BETA_READER') {
    throw new Error('Only owners and moderators can do this');
  }
  return { userId, membership };
}

export async function getHiveChapterSuggestionsAction(
  hiveId: string,
  chapterId?: string,
): Promise<HiveChapterSuggestion[]> {
  try {
    const { membership } = await requireHiveMember(hiveId);
    const isMod = membership.role === 'OWNER' || membership.role === 'MODERATOR';

    const where = chapterId
      ? and(
          eq(hiveChapterSuggestions.hiveId, hiveId),
          eq(hiveChapterSuggestions.chapterId, chapterId),
          eq(hiveChapterSuggestions.status, 'PENDING'),
        )
      : and(
          eq(hiveChapterSuggestions.hiveId, hiveId),
          eq(hiveChapterSuggestions.status, 'PENDING'),
        );

    const rows = isMod
      ? await db.query.hiveChapterSuggestions.findMany({
          where,
          with: { author: true, chapter: true },
          orderBy: [desc(hiveChapterSuggestions.createdAt)],
        })
      : [];

    return rows.map((r) => ({
      id: r.id,
      hiveId: r.hiveId,
      chapterId: r.chapterId,
      authorId: r.authorId,
      originalContent: r.originalContent,
      suggestedContent: r.suggestedContent,
      summary: r.summary,
      status: r.status as 'PENDING' | 'ACCEPTED' | 'REJECTED',
      reviewedById: r.reviewedById,
      reviewNote: r.reviewNote,
      reviewedAt: r.reviewedAt,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      author: { id: r.author.id, username: r.author.username, image: r.author.image },
      chapter: { id: r.chapter.id, title: r.chapter.title },
    }));
  } catch {
    return [];
  }
}

export async function createSuggestionAction(
  hiveId: string,
  chapterId: string,
  suggestedContent: string,
  summary?: string,
): Promise<ActionResult & { suggestionId?: string }> {
  try {
    const { userId } = await requireHiveMember(hiveId);
    const limited = await checkActionRateLimit(userId);
    if (limited) return { success: false, message: limited };

    if (!suggestedContent.trim()) {
      return { success: false, message: 'Suggested content is required.' };
    }

    const hive = await db.query.hives.findFirst({ where: eq(hives.id, hiveId) });
    if (!hive?.bookId) return { success: false, message: 'Hive has no linked book.' };

    const chapter = await db.query.chapters.findFirst({
      where: and(eq(chapters.id, chapterId), eq(chapters.bookId, hive.bookId)),
    });
    if (!chapter) return { success: false, message: 'Chapter not found.' };

    const [suggestion] = await db
      .insert(hiveChapterSuggestions)
      .values({
        hiveId,
        chapterId,
        authorId: userId,
        originalContent: chapter.content ?? '',
        suggestedContent: suggestedContent.trim(),
        summary: summary?.trim() || null,
        status: 'PENDING',
      })
      .returning({ id: hiveChapterSuggestions.id });

    revalidatePath(`/hive/${hiveId}/suggest`);

    void (async () => {
      try {
        const [actor] = await Promise.all([
          db.query.users.findFirst({ where: eq(users.id, userId), columns: { username: true } }),
        ]);
        await insertNotification({
          recipientId: hive.ownerId,
          actorId: userId,
          type: 'HIVE_SUGGESTION',
          link: `/hive/${hiveId}/suggest`,
          metadata: {
            hiveName: hive.name,
            chapterTitle: chapter.title,
            actorUsername: actor?.username ?? 'A member',
          },
        });
      } catch {}
    })();

    return { success: true, message: 'Suggestion submitted.', suggestionId: suggestion.id };
  } catch {
    return { success: false, message: 'Failed to submit suggestion.' };
  }
}

export async function acceptSuggestionAction(suggestionId: string): Promise<ActionResult> {
  try {
    const userId = await requireAuth();

    const suggestion = await db.query.hiveChapterSuggestions.findFirst({
      where: eq(hiveChapterSuggestions.id, suggestionId),
      with: { chapter: true },
    });
    if (!suggestion) return { success: false, message: 'Suggestion not found.' };

    await requireHiveMod(suggestion.hiveId);

    await db
      .update(chapters)
      .set({ content: suggestion.suggestedContent, updatedAt: new Date() })
      .where(eq(chapters.id, suggestion.chapterId));

    await db
      .update(hiveChapterSuggestions)
      .set({ status: 'ACCEPTED', reviewedById: userId, reviewedAt: new Date(), updatedAt: new Date() })
      .where(eq(hiveChapterSuggestions.id, suggestionId));

    revalidatePath(`/hive/${suggestion.hiveId}/suggest`);

    void (async () => {
      try {
        const hive = await db.query.hives.findFirst({
          where: eq(hives.id, suggestion.hiveId),
          columns: { name: true },
        });
        await insertNotification({
          recipientId: suggestion.authorId,
          actorId: userId,
          type: 'SUGGESTION_ACCEPTED',
          link: `/hive/${suggestion.hiveId}/suggest`,
          metadata: {
            hiveName: hive?.name ?? '',
            chapterTitle: suggestion.chapter.title,
          },
        });
      } catch {}
    })();

    return { success: true, message: 'Suggestion accepted — chapter updated.' };
  } catch {
    return { success: false, message: 'Failed to accept suggestion.' };
  }
}

export async function rejectSuggestionAction(
  suggestionId: string,
  note?: string,
): Promise<ActionResult> {
  try {
    const userId = await requireAuth();

    const suggestion = await db.query.hiveChapterSuggestions.findFirst({
      where: eq(hiveChapterSuggestions.id, suggestionId),
      with: { chapter: true },
    });
    if (!suggestion) return { success: false, message: 'Suggestion not found.' };

    await requireHiveMod(suggestion.hiveId);

    await db
      .update(hiveChapterSuggestions)
      .set({
        status: 'REJECTED',
        reviewedById: userId,
        reviewNote: note?.trim() || null,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(hiveChapterSuggestions.id, suggestionId));

    revalidatePath(`/hive/${suggestion.hiveId}/suggest`);

    void (async () => {
      try {
        const hive = await db.query.hives.findFirst({
          where: eq(hives.id, suggestion.hiveId),
          columns: { name: true },
        });
        await insertNotification({
          recipientId: suggestion.authorId,
          actorId: userId,
          type: 'SUGGESTION_REJECTED',
          link: `/hive/${suggestion.hiveId}/suggest`,
          metadata: {
            hiveName: hive?.name ?? '',
            chapterTitle: suggestion.chapter.title,
          },
        });
      } catch {}
    })();

    return { success: true, message: 'Suggestion rejected.' };
  } catch {
    return { success: false, message: 'Failed to reject suggestion.' };
  }
}

export async function getSuggestionCountAction(hiveId: string): Promise<number> {
  try {
    const userId = await requireAuth();
    const membership = await db.query.hiveMembers.findFirst({
      where: and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, userId)),
    });
    if (!membership) return 0;
    if (membership.role !== 'OWNER' && membership.role !== 'MODERATOR') return 0;

    const [result] = await db
      .select({ total: count() })
      .from(hiveChapterSuggestions)
      .where(
        and(
          eq(hiveChapterSuggestions.hiveId, hiveId),
          eq(hiveChapterSuggestions.status, 'PENDING'),
        ),
      );
    return result?.total ?? 0;
  } catch {
    return 0;
  }
}

export async function writeChapterContentAction(
  hiveId: string,
  chapterId: string,
  content: string,
): Promise<ActionResult> {
  try {
    await requireHiveMod(hiveId);

    const hive = await db.query.hives.findFirst({ where: eq(hives.id, hiveId) });
    if (!hive?.bookId) return { success: false, message: 'Hive has no linked book.' };

    const chapter = await db.query.chapters.findFirst({
      where: and(eq(chapters.id, chapterId), eq(chapters.bookId, hive.bookId)),
    });
    if (!chapter) return { success: false, message: 'Chapter not found.' };

    const wordCount = content
      .replace(/<[^>]+>/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;

    await db
      .update(chapters)
      .set({ content, wordCount, updatedAt: new Date() })
      .where(eq(chapters.id, chapterId));

    revalidatePath(`/hive/${hiveId}/suggest`);
    return { success: true, message: 'Chapter saved.' };
  } catch {
    return { success: false, message: 'Failed to save chapter.' };
  }
}
