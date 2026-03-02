import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getHiveAction } from '@/lib/actions/hive.actions';
import { getPollsAction } from '@/lib/actions/hive-polls.actions';
import HivePollList from '@/components/hive/hive-poll-list';

export const metadata = { title: 'Hive Polls' };

export default async function HivePollsPage({
  params,
}: {
  params: Promise<{ hiveId: string }>;
}) {
  const { hiveId } = await params;
  const { userId } = await auth();
  if (!userId) notFound();

  const hive = await getHiveAction(hiveId);
  if (!hive || !hive.isMember) notFound();

  const initialPolls = await getPollsAction(hiveId);

  return (
    <HivePollList
      hiveId={hiveId}
      initialPolls={initialPolls}
      currentUserId={userId}
      myRole={hive.myRole ?? 'CONTRIBUTOR'}
    />
  );
}
