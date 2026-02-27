import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getHiveAction, getHiveMembersAction } from '@/lib/actions/hive.actions';
import HiveMemberList from '@/components/hive/hive-member-list';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ hiveId: string }>;
}): Promise<Metadata> {
  const { hiveId } = await params;
  const hive = await getHiveAction(hiveId);
  return { title: hive ? `${hive.name} · Members` : 'Members' };
}

export default async function HiveMembersPage({
  params,
}: {
  params: Promise<{ hiveId: string }>;
}) {
  const { hiveId } = await params;
  const { userId } = await auth();

  const [hive, members] = await Promise.all([
    getHiveAction(hiveId),
    getHiveMembersAction(hiveId),
  ]);

  if (!hive) notFound();

  return (
    <div className="max-w-2xl">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-white">
          Members
        </h2>
        <p className="text-sm text-white/60 mt-0.5">
          {members.length} member{members.length !== 1 ? 's' : ''} in this hive
        </p>
      </div>

      <HiveMemberList
        members={members}
        hiveId={hiveId}
        myRole={hive.myRole}
        currentUserId={userId ?? null}
      />
    </div>
  );
}
