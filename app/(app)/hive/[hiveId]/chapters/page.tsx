import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
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
  const { userId } = await auth();
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
