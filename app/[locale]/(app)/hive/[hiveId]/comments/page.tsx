import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
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
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id ?? null;
  if (!userId) notFound();

  const hive = await getHiveAction(hiveId);
  if (!hive || !hive.isMember) notFound();

  const bookChapters = hive.bookId
    ? await db.query.chapters.findMany({
        where: eq(chapters.bookId, hive.bookId),
        orderBy: [asc(chapters.order)],
        columns: { id: true, title: true, order: true, collectionId: true },
        with: {
          collection: { columns: { name: true } },
        },
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
      chapters={bookChapters as unknown as { id: string; title: string; order: number; collection: { name: string } | null }[]}
      initialChapterId={firstChapterId}
      initialComments={initialComments}
      initialContent={initialContent}
      currentUserId={userId}
      myRole={hive.myRole ?? 'CONTRIBUTOR'}
    />
  );
}
