import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import {
  getHiveAction,
  checkHiveJoinRequestStatusAction,
  getPendingHiveJoinRequestsAction,
} from '@/lib/actions/hive.actions';
import { getHiveActivityAction } from '@/lib/actions/hive-activity.actions';
import { getHiveBookAction } from '@/lib/actions/book.actions';
import HiveDashboard from '@/components/hive/hive-dashboard';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ hiveId: string }>;
}): Promise<Metadata> {
  const { hiveId } = await params;
  const hive = await getHiveAction(hiveId);
  return {
    title: hive ? hive.name : 'Hive',
    description: hive
      ? `Join the ${hive.name} hive on Beehive Books — collaborate to write and build a book together.`
      : 'A collaborative writing hive on Beehive Books.',
  };
}

export default async function HiveDashboardPage({
  params,
}: {
  params: Promise<{ hiveId: string }>;
}) {
  const { hiveId } = await params;
  const { userId } = await auth();

  const hive = await getHiveAction(hiveId);
  if (!hive) notFound();

  const isOwnerOrMod = hive.myRole === 'OWNER' || hive.myRole === 'MODERATOR';
  const isNonMember = !hive.isMember && hive.privacy !== 'PRIVATE';

  const [initialActivity, linkedBook, joinRequestStatus, pendingRequests] = await Promise.all([
    getHiveActivityAction(hiveId),
    hive.bookId ? getHiveBookAction(hive.bookId) : Promise.resolve(null),
    isNonMember && userId ? checkHiveJoinRequestStatusAction(hiveId) : Promise.resolve(null),
    isOwnerOrMod ? getPendingHiveJoinRequestsAction(hiveId) : Promise.resolve([]),
  ]);

  return (
    <HiveDashboard
      hive={hive}
      initialActivity={initialActivity}
      currentUserId={userId ?? null}
      linkedBook={linkedBook}
      joinRequestStatus={joinRequestStatus ?? undefined}
      pendingRequests={pendingRequests}
    />
  );
}
