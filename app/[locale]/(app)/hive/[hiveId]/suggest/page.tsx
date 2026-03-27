import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getHiveAction } from '@/lib/actions/hive.actions';
import { getHiveChapterSuggestionsAction } from '@/lib/actions/hive-suggestions.actions';
import { db } from '@/db';
import { chapters } from '@/db/schema';
import { eq } from 'drizzle-orm';
import HiveSuggestEditor from '@/components/hive/hive-suggest-editor';

export const metadata = { title: 'Suggest' };

export default async function HiveSuggestPage({
  params,
  searchParams,
}: {
  params: Promise<{ hiveId: string }>;
  searchParams: Promise<{ chapterId?: string }>;
}) {
  const { hiveId } = await params;
  const { chapterId: initialChapterId } = await searchParams;

  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id ?? null;
  if (!userId) notFound();

  const hive = await getHiveAction(hiveId);
  if (!hive || !hive.isMember) notFound();
  if (!hive.bookId) notFound();

  const bookChapters = await db.query.chapters.findMany({
    where: eq(chapters.bookId, hive.bookId),
    columns: { id: true, title: true, order: true, content: true },
    orderBy: (c, { asc }) => asc(c.order),
  });

  if (bookChapters.length === 0) notFound();

  const myRole = hive.myRole ?? 'CONTRIBUTOR';
  const isMod = myRole === 'OWNER' || myRole === 'MODERATOR';

  const chaptersNormalized = bookChapters.map((c) => ({ ...c, content: c.content ?? '' }));

  const initialChapter =
    chaptersNormalized.find((c) => c.id === initialChapterId) ?? chaptersNormalized[0];

  const suggestions = isMod
    ? await getHiveChapterSuggestionsAction(hiveId)
    : [];

  return (
    <HiveSuggestEditor
      hiveId={hiveId}
      myRole={myRole}
      chapters={chaptersNormalized}
      initialChapterId={initialChapter.id}
      initialContent={initialChapter.content}
      initialSuggestions={suggestions}
    />
  );
}
