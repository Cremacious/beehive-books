import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getHiveAction } from '@/lib/actions/hive.actions';
import { getWordGoalsAction, getWordLogsAction } from '@/lib/actions/hive-word-goals.actions';
import HiveWordGoals from '@/components/hive/hive-word-goals';

export const metadata = { title: 'Word Goals' };

export default async function HiveWordGoalsPage({
  params,
}: {
  params: Promise<{ hiveId: string }>;
}) {
  const { hiveId } = await params;
  const { userId } = await auth();
  if (!userId) notFound();

  const hive = await getHiveAction(hiveId);
  if (!hive || !hive.isMember) notFound();

  const [initialGoals, initialLogs] = await Promise.all([
    getWordGoalsAction(hiveId),
    getWordLogsAction(hiveId),
  ]);

  return (
    <HiveWordGoals
      hiveId={hiveId}
      initialGoals={initialGoals}
      initialLogs={initialLogs}
      myRole={hive.myRole ?? 'CONTRIBUTOR'}
    />
  );
}
