import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getHiveAction } from '@/lib/actions/hive.actions';
import { getHiveMilestonesAction } from '@/lib/actions/hive.actions';
import { HiveMilestones } from '@/components/hive/hive-milestones';

export const metadata = { title: 'Milestones' };

export default async function HiveMilestonesPage({
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

  const achieved = await getHiveMilestonesAction(hiveId);

  return <HiveMilestones achieved={achieved} />;
}
