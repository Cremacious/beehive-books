import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { books } from '@/db/schema';
import { getHiveAction } from '@/lib/actions/hive.actions';
import { getBetaChaptersAction } from '@/lib/actions/hive-beta.actions';
import HiveBetaReader from '@/components/hive/hive-beta-reader';

export const metadata = { title: 'Beta Reading' };

export default async function HiveBetaPage({
  params,
}: {
  params: Promise<{ hiveId: string }>;
}) {
  const { hiveId } = await params;

  const hive = await getHiveAction(hiveId);
  if (!hive || !hive.isMember) notFound();

  const [initialChapters, linkedBook] = await Promise.all([
    getBetaChaptersAction(hiveId),
    hive.bookId
      ? db.query.books.findFirst({
          where: eq(books.id, hive.bookId),
          columns: { id: true, title: true },
        })
      : Promise.resolve(null),
  ]);

  return (
    <HiveBetaReader
      hiveId={hiveId}
      bookId={hive.bookId}
      bookTitle={linkedBook?.title ?? null}
      initialChapters={initialChapters}
    />
  );
}
