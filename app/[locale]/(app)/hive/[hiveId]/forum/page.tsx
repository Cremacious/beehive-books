import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getHiveAction } from '@/lib/actions/hive.actions';
import { getHiveForumAction } from '@/lib/actions/hive-forum.actions';
import HiveForum from '@/components/hive/hive-forum';

export const metadata = { title: 'Forum' };

export default async function HiveForumPage({
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

  const threads = await getHiveForumAction(hiveId);

  return (
    <HiveForum
      hiveId={hiveId}
      initialThreads={threads}
      currentUserId={userId}
      myRole={hive.myRole ?? 'CONTRIBUTOR'}
    />
  );
}
