import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getHiveAction } from '@/lib/actions/hive.actions';
import { getHiveActivityAction } from '@/lib/actions/hive-activity.actions';
import HiveActivityFeed from '@/components/hive/hive-activity-feed';

export const metadata = { title: 'Activity' };

export default async function HiveActivityPage({
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

  const initialEvents = await getHiveActivityAction(hiveId);

  return <HiveActivityFeed hiveId={hiveId} initialEvents={initialEvents} />;
}
