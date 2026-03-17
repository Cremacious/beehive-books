import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getHiveAction } from '@/lib/actions/hive.actions';
import { getActiveSprintAction, getPastSprintsAction } from '@/lib/actions/hive-sprints.actions';
import HiveSprint from '@/components/hive/hive-sprint';

export const metadata = { title: 'Sprint' };

export default async function HiveSprintPage({
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

  const [initialActiveSprint, initialPastSprints] = await Promise.all([
    getActiveSprintAction(hiveId),
    getPastSprintsAction(hiveId),
  ]);

  return (
    <HiveSprint
      hiveId={hiveId}
      initialActiveSprint={initialActiveSprint}
      initialPastSprints={initialPastSprints}
      myRole={hive.myRole ?? 'CONTRIBUTOR'}
      currentUserId={userId}
    />
  );
}
