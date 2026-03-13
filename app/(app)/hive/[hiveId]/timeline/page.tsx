import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getHiveAction } from '@/lib/actions/hive.actions';
import { getWikiEntriesByCategoryAction } from '@/lib/actions/hive-wiki.actions';
import HiveTimeline from '@/components/hive/hive-timeline';

export const metadata = { title: 'Timeline' };

export default async function HiveTimelinePage({
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

  const entries = await getWikiEntriesByCategoryAction(hiveId, 'TIMELINE');

  return (
    <HiveTimeline
      hiveId={hiveId}
      entries={entries}
      myRole={hive.myRole ?? 'CONTRIBUTOR'}
    />
  );
}
