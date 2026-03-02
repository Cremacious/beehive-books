import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { asc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { chapters } from '@/db/schema';
import { getHiveAction } from '@/lib/actions/hive.actions';
import { getVersionSnapshotsAction } from '@/lib/actions/hive-version-snapshots.actions';
import HiveVersionHistory from '@/components/hive/hive-version-history';

export const metadata = { title: 'Version History' };

export default async function HiveHistoryPage({
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

  const initialSnapshots = firstChapterId
    ? await getVersionSnapshotsAction(hiveId, firstChapterId)
    : [];

  return (
    <HiveVersionHistory
      hiveId={hiveId}
      bookId={hive.bookId}
      chapters={bookChapters}
      initialChapterId={firstChapterId}
      initialSnapshots={initialSnapshots}
      currentUserId={userId}
      myRole={hive.myRole ?? 'CONTRIBUTOR'}
    />
  );
}
