import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
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
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id ?? null;
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
