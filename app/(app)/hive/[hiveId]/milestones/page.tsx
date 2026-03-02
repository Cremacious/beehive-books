import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getHiveAction } from '@/lib/actions/hive.actions';
import { getMilestonesAction } from '@/lib/actions/hive-milestones.actions';
import HiveMilestones from '@/components/hive/hive-milestones';

export const metadata = { title: 'Milestones' };

export default async function HiveMilestonesPage({
  params,
}: {
  params: Promise<{ hiveId: string }>;
}) {
  const { hiveId } = await params;
  const { userId } = await auth();
  if (!userId) notFound();

  const hive = await getHiveAction(hiveId);
  if (!hive || !hive.isMember) notFound();

  const initialMilestones = await getMilestonesAction(hiveId);

  return (
    <HiveMilestones
      initialMilestones={initialMilestones}
      currentUserId={userId}
      myRole={hive.myRole ?? 'CONTRIBUTOR'}
    />
  );
}
