import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getHiveAction } from '@/lib/actions/hive.actions';
import { getBuzzItemsAction } from '@/lib/actions/hive-buzz.actions';
import HiveBuzzBoard from '@/components/hive/hive-buzz-board';

export const metadata = { title: 'Buzz Board' };

export default async function HiveBuzzPage({
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

  const initialItems = await getBuzzItemsAction(hiveId);

  return (
    <HiveBuzzBoard
      hiveId={hiveId}
      initialItems={initialItems}
      currentUserId={userId}
      myRole={hive.myRole ?? 'CONTRIBUTOR'}
    />
  );
}
