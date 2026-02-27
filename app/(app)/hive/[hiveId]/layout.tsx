import { notFound } from 'next/navigation';
// import { auth } from '@clerk/nextjs/server';
import { getHiveAction } from '@/lib/actions/hive.actions';
import HiveNav from '@/components/hive/hive-nav';

interface HiveLayoutProps {
  children: React.ReactNode;
  params: Promise<{ hiveId: string }>;
}

export default async function HiveLayout({ children, params }: HiveLayoutProps) {
  const { hiveId } = await params;
  // const { userId } = await auth();

  const hive = await getHiveAction(hiveId);
  if (!hive) notFound();

  const isOwner = hive.myRole === 'OWNER';
  const isMember = hive.isMember;



  return (
    <div className="px-4 py-6 md:px-8 max-w-6xl mx-auto">
      {isMember && <HiveNav hiveId={hiveId} isOwner={isOwner} />}
      {children}
    </div>
  );
}
