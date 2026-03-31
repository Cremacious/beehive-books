import { notFound } from 'next/navigation';
import { getHiveAction, getHiveMembersAction } from '@/lib/actions/hive.actions';
import { getPendingSubmissionCountAction } from '@/lib/actions/hive-submissions.actions';
import { getSuggestionCountAction } from '@/lib/actions/hive-suggestions.actions';
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
  const isMod = hive.myRole === 'OWNER' || hive.myRole === 'MODERATOR';
  const isMember = hive.isMember;
  const topMembers = members.slice(0, 5).map((m) => m.user);

  const [pendingSubmissionCount, pendingSuggestionCount] = isMod
    ? await Promise.all([
        getPendingSubmissionCountAction(hiveId),
        getSuggestionCountAction(hiveId),
      ])
    : [0, 0];

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex gap-8">
          {/* Desktop sidebar */}
          {isMember && (
            <aside className="hidden lg:flex flex-col w-52 xl:w-60 shrink-0 pt-6">
              {/* <BackButton href="/hive" label="Hives" className="mb-6" /> */}
              <div className="sticky top-6">
                <HiveSidebar
                  hiveId={hiveId}
                  isOwner={isOwner}
                  hive={hive}
                  topMembers={topMembers}
                  pendingSubmissionCount={pendingSubmissionCount}
                  pendingSuggestionCount={pendingSuggestionCount}
                />
              </div>
            </aside>
          )}

          {/* Main content */}
          <main className={`flex-1 min-w-0 py-6 ${!isMember ? 'max-w-4xl mx-auto w-full' : ''}`}>
            {!isMember && (
              <BackButton href="/hive" label="Hives" className="mb-4" />
            )}
            {isMember && (
              <div className="lg:hidden flex items-center justify-between mb-5">
                <HiveMobileMenuButton
                  hiveId={hiveId}
                  isOwner={isOwner}
                  hive={hive}
                  topMembers={topMembers}
                  pendingSubmissionCount={pendingSubmissionCount}
                  pendingSuggestionCount={pendingSuggestionCount}
                />
                <span className="text-xs text-white/80 truncate max-w-[60%] text-right">{hive.name}</span>
              </div>
            )}
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
