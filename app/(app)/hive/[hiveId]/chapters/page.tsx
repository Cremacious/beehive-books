import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { books } from '@/db/schema';
import { getHiveAction } from '@/lib/actions/hive.actions';
import { getChaptersWithClaimsAction } from '@/lib/actions/hive-claiming.actions';
import HiveChapterClaims from '@/components/hive/hive-chapter-claims';

export const metadata = { title: 'Chapter Claims' };

export default async function HiveChaptersPage({
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

  const [initialChapters, linkedBook] = await Promise.all([
    getChaptersWithClaimsAction(hiveId),
    hive.bookId
      ? db.query.books.findFirst({
          where: eq(books.id, hive.bookId),
          columns: { id: true, title: true },
        })
      : Promise.resolve(null),
  ]);

  return (
    <HiveChapterClaims
      hiveId={hiveId}
      bookId={hive.bookId}
      bookTitle={linkedBook?.title ?? null}
      initialChapters={initialChapters}
      currentUserId={userId}
      myRole={hive.myRole ?? 'CONTRIBUTOR'}
    />
  );
}
