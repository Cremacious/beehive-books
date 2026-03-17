import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getHiveAction } from '@/lib/actions/hive.actions';
import { getOutlineItemsAction } from '@/lib/actions/hive-outline.actions';
import HiveOutlineBoard from '@/components/hive/hive-outline-board';

export const metadata = { title: 'Outline Board' };

export default async function HiveOutlinePage({
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

  const initialItems = await getOutlineItemsAction(hiveId);

  return (
    <HiveOutlineBoard
      hiveId={hiveId}
      initialItems={initialItems}
      currentUserId={userId}
      myRole={hive.myRole ?? 'CONTRIBUTOR'}
    />
  );
}
