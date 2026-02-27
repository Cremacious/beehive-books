import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getHiveAction, getHiveMembersAction } from '@/lib/actions/hive.actions';
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

  const members = await getHiveMembersAction(hiveId);

  return (
    <HiveDashboard hive={hive} members={members} currentUserId={userId ?? null} />
  );
}
