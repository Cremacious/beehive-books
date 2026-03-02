import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { and, asc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { books, chapters } from '@/db/schema';
import { getHiveAction } from '@/lib/actions/hive.actions';
import {
  getInlineCommentsAction,
  getChapterContentAction,
} from '@/lib/actions/hive-inline-comments.actions';
import HiveInlineComments from '@/components/hive/hive-inline-comments';

export const metadata = { title: 'Annotations' };

export default async function HiveCommentsPage({
  params,
}: {
  params: Promise<{ hiveId: string }>;
}) {
  const { hiveId } = await params;
  const { userId } = await auth();
  if (!userId) notFound();

  const hive = await getHiveAction(hiveId);
  if (!hive || !hive.isMember) notFound();

  const bookChapters = hive.bookId
    ? await db.query.chapters.findMany({
        where: eq(chapters.bookId, hive.bookId),
        orderBy: [asc(chapters.order)],
        columns: { id: true, title: true, order: true },
      })
    : [];

  const firstChapterId = bookChapters[0]?.id ?? null;

  const [initialComments, initialContent] = await Promise.all([
    firstChapterId ? getInlineCommentsAction(hiveId, firstChapterId) : Promise.resolve([]),
    firstChapterId ? getChapterContentAction(hiveId, firstChapterId) : Promise.resolve(null),
  ]);

  return (
    <HiveInlineComments
      hiveId={hiveId}
      chapters={bookChapters}
      initialChapterId={firstChapterId}
      initialComments={initialComments}
      initialContent={initialContent}
      currentUserId={userId}
      myRole={hive.myRole ?? 'CONTRIBUTOR'}
    />
  );
}
