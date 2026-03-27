import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { hiveChapterSuggestions, hiveMembers } from '@/db/schema';
import SuggestionReviewPage from '@/components/hive/suggestion-review-page';

export const metadata = { title: 'Review Suggestion' };

export default async function SuggestionReviewRoute({
  params,
}: {
  params: Promise<{ hiveId: string; suggestionId: string }>;
}) {
  const { hiveId, suggestionId } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id ?? null;
  if (!userId) notFound();

  const membership = await db.query.hiveMembers.findFirst({
    where: and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, userId)),
  });
  if (!membership) notFound();
  if (membership.role !== 'OWNER' && membership.role !== 'MODERATOR') notFound();

  const suggestion = await db.query.hiveChapterSuggestions.findFirst({
    where: and(
      eq(hiveChapterSuggestions.id, suggestionId),
      eq(hiveChapterSuggestions.hiveId, hiveId),
    ),
    with: { author: true, chapter: true },
  });
  if (!suggestion) notFound();

  return (
    <SuggestionReviewPage
      hiveId={hiveId}
      suggestion={{
        id: suggestion.id,
        hiveId: suggestion.hiveId,
        chapterId: suggestion.chapterId,
        authorId: suggestion.authorId,
        originalContent: suggestion.originalContent,
        suggestedContent: suggestion.suggestedContent,
        summary: suggestion.summary,
        status: suggestion.status as 'PENDING' | 'ACCEPTED' | 'REJECTED',
        reviewedById: suggestion.reviewedById,
        reviewNote: suggestion.reviewNote,
        reviewedAt: suggestion.reviewedAt,
        createdAt: suggestion.createdAt,
        updatedAt: suggestion.updatedAt,
        author: {
          id: suggestion.author.id,
          username: suggestion.author.username,
          image: suggestion.author.image,
        },
        chapter: { id: suggestion.chapter.id, title: suggestion.chapter.title },
      }}
    />
  );
}
