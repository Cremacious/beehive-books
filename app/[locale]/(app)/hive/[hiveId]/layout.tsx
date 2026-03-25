import { notFound } from 'next/navigation';
import { getHiveAction, getHiveMembersAction } from '@/lib/actions/hive.actions';
import HiveSidebar from '@/components/hive/hive-sidebar';
import HiveMobileMenuButton from '@/components/hive/hive-mobile-menu-button';
import BackButton from '@/components/shared/back-button';

interface HiveLayoutProps {
  children: React.ReactNode;
  params: Promise<{ hiveId: string }>;
}

export default async function HiveLayout({ children, params }: HiveLayoutProps) {
  const { hiveId } = await params;

  const [hive, members] = await Promise.all([
    getHiveAction(hiveId),
    getHiveMembersAction(hiveId),
  ]);
  if (!hive) notFound();

  const isOwner = hive.myRole === 'OWNER';
  const isMember = hive.isMember;
  const topMembers = members.slice(0, 5).map((m) => m.user);

  return (
    <div className="min-h-screen">
      {/* Mobile sticky header */}
      {isMember && (
        <div className="lg:hidden sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-[#1a1a1a] border-b border-[#2a2a2a]">
          <HiveMobileMenuButton
            hiveId={hiveId}
            isOwner={isOwner}
            hive={hive}
            topMembers={topMembers}
          />
    
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex gap-8">
          {/* Desktop sidebar */}
          {isMember && (
            <aside className="hidden lg:flex flex-col w-52 xl:w-60 shrink-0 pt-6">
              <BackButton href="/hive" label="Hives" className="mb-6" />
              <div className="sticky top-6">
                <HiveSidebar
                  hiveId={hiveId}
                  isOwner={isOwner}
                  hive={hive}
                  topMembers={topMembers}
                />
              </div>
            </aside>
          )}

          {/* Main content */}
          <main className={`flex-1 min-w-0 py-6 ${!isMember ? 'max-w-4xl mx-auto w-full' : ''}`}>
            {!isMember && (
              <BackButton href="/hive" label="Hives" className="mb-4" />
            )}
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
