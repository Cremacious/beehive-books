import Link from 'next/link';
import type { Metadata } from 'next';
import { Users2, UserPlus, Search } from 'lucide-react';
import { getMyFriendsDataAction, getSuggestedUsersAction } from '@/lib/actions/friend.actions';
import { FriendsPanel } from '@/components/friends/friends-panel';
import { RequestsPanel } from '@/components/friends/requests-panel';
import { SuggestedUsers } from '@/components/friends/suggested-users';

export const metadata: Metadata = {
  title: 'Friends',
  description: 'Connect with other writers and readers — manage your friends, requests, and discover new people.',
};

type Props = { searchParams: Promise<{ tab?: string }> };

export default async function FriendsPage({ searchParams }: Props) {
  const { tab = 'friends' } = await searchParams;

  const [{ friends, receivedRequests, sentRequests }, suggested] = await Promise.all([
    getMyFriendsDataAction(),
    tab === 'find' ? getSuggestedUsersAction() : Promise.resolve([]),
  ]);

  const pendingCount = receivedRequests.length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:px-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mainFont">Friends</h1>
        <p className="mt-1 text-sm text-white/80">
          Connect with other writers on Beehive
        </p>
      </div>

      <div className="flex items-center gap-1 mb-8 p-1 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] w-full max-w-xs">
        <TabLink
          href="/friends?tab=friends"
          active={tab === 'friends'}
          icon={<Users2 className="w-4 h-4" />}
          label="Friends"
          badge={friends.length > 0 ? friends.length : undefined}
        />
        <TabLink
          href="/friends?tab=requests"
          active={tab === 'requests'}
          icon={<UserPlus className="w-4 h-4" />}
          label="Requests"
          badge={pendingCount > 0 ? pendingCount : undefined}
        />
        <TabLink
          href="/friends?tab=find"
          active={tab === 'find'}
          icon={<Search className="w-4 h-4" />}
          label="Find"
        />
      </div>

      {tab === 'friends' && <FriendsPanel friends={friends} />}

      {tab === 'requests' && (
        <RequestsPanel
          receivedRequests={receivedRequests}
          sentRequests={sentRequests}
        />
      )}

      {tab === 'find' && <SuggestedUsers suggested={suggested} />}
    </div>
  );
}

function TabLink({
  href,
  active,
  icon,
  label,
  badge,
}: {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 ${
        active
          ? 'bg-[#FFC300] text-black'
          : 'text-white hover:text-white hover:bg-white/5'
      }`}
    >
      {icon}
      <span>{label}</span>
      {badge !== undefined && (
        <span className={`inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-[10px] font-bold ${
          active ? 'bg-black text-yellow-500' : 'bg-[#FFC300] text-black'
        }`}>
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  );
}


