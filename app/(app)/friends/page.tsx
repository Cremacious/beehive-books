import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { Users2, UserPlus, Search } from 'lucide-react';
import { getMyFriendsDataAction } from '@/lib/actions/friend.actions';
import { FriendButton } from '@/components/friends/friend-button';
import { UserSearch } from '@/components/friends/user-search';
import type { FriendUser, FriendStatus } from '@/lib/actions/friend.actions';

export const metadata: Metadata = { title: 'Friends · Beehive Books' };

type Props = { searchParams: Promise<{ tab?: string }> };

export default async function FriendsPage({ searchParams }: Props) {
  const { tab = 'friends' } = await searchParams;
  const { friends, receivedRequests, sentRequests } = await getMyFriendsDataAction();
  const pendingCount = receivedRequests.length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:px-8">
  
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white">Friends</h1>
        <p className="mt-1 text-sm text-white/70">
          Connect with other writers on Beehive
        </p>
      </div>


      <div className="flex items-center gap-1 mb-8 p-1 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] w-fit">
        <TabLink href="/friends?tab=friends"  active={tab === 'friends'}  icon={<Users2 className="w-4 h-4" />}  label={`Friends${friends.length > 0 ? ` (${friends.length})` : ''}`} />
        <TabLink href="/friends?tab=requests" active={tab === 'requests'} icon={<UserPlus className="w-4 h-4" />} label="Requests" badge={pendingCount} />
        <TabLink href="/friends?tab=find"     active={tab === 'find'}     icon={<Search className="w-4 h-4" />}   label="Find People" />
      </div>


      {tab === 'friends' && (
        <>
          {friends.length === 0 ? (
            <Empty
              message="You haven't added any friends yet."
              cta={{ href: '/friends?tab=find', label: 'Find People' }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {friends.map(({ friendshipId, user }) => (
                <FriendCard
                  key={friendshipId}
                  user={user}
                  friendshipId={friendshipId}
                  friendStatus={{ status: 'FRIENDS', friendshipId }}
                />
              ))}
            </div>
          )}
        </>
      )}

     
      {tab === 'requests' && (
        <div className="space-y-8">
        
          <div>
            <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-3">
              Incoming ({receivedRequests.length})
            </h2>
            {receivedRequests.length === 0 ? (
              <Empty message="No incoming friend requests." />
            ) : (
              <ul className="space-y-2">
                {receivedRequests.map(({ friendshipId, user }) => (
                  <RequestRow
                    key={friendshipId}
                    user={user}
                    friendStatus={{ status: 'PENDING_RECEIVED', friendshipId }}
                  />
                ))}
              </ul>
            )}
          </div>

       
          <div>
            <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-3">
              Sent ({sentRequests.length})
            </h2>
            {sentRequests.length === 0 ? (
              <Empty message="No pending outgoing requests." />
            ) : (
              <ul className="space-y-2">
                {sentRequests.map(({ friendshipId, user }) => (
                  <RequestRow
                    key={friendshipId}
                    user={user}
                    friendStatus={{ status: 'PENDING_SENT', friendshipId }}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

   
      {tab === 'find' && <UserSearch />}
    </div>
  );
}



function TabLink({
  href, active, icon, label, badge,
}: {
  href: string; active: boolean; icon: React.ReactNode; label: string; badge?: number;
}) {
  return (
    <Link
      href={href}
      className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        active
          ? 'bg-[#FFC300] text-black'
          : 'text-white/70 hover:text-white hover:bg-white/5'
      }`}
    >
      {icon}
      <span>{label}</span>
      {!!badge && badge > 0 && (
        <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center ${active ? 'bg-black text-[#FFC300]' : 'bg-[#FFC300] text-black'}`}>
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </Link>
  );
}

function Avatar({ user, size = 10 }: { user: FriendUser; size?: number }) {
  const name =
    [user.firstName, user.lastName].filter(Boolean).join(' ') ||
    user.username ||
    '?';
  const cls = `relative rounded-full overflow-hidden bg-[#2a2000] shrink-0 w-${size} h-${size}`;
  return (
    <div className={cls}>
      {user.imageUrl ? (
        <Image src={user.imageUrl} alt={name} fill className="object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-sm font-bold text-[#FFC300]">
            {(name[0] || '?').toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
}

function FriendCard({
  user, friendshipId, friendStatus,
}: {
  user: FriendUser; friendshipId: string; friendStatus: FriendStatus;
}) {
  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(' ') ||
    user.username ||
    'Unknown User';

  return (
    <div className="flex flex-col items-center gap-3 p-5 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] text-center">
      <Avatar user={user} size={16} />
      <div className="min-w-0">
        <p className="font-semibold text-white truncate">{displayName}</p>
        {user.username && (
          <p className="text-xs text-white/70 mt-0.5">@{user.username}</p>
        )}
      </div>
      <div className="flex items-center gap-2 mt-1">
        <Link
          href={`/u/${user.username ?? user.clerkId}`}
          className="text-xs px-3 py-1.5 rounded-lg border border-[#333] text-white/70 hover:text-white hover:border-[#FFC300]/40 transition-all"
        >
          View Profile
        </Link>
        <FriendButton
          targetUserId={user.clerkId}
          initialStatus={friendStatus}
          compact
        />
      </div>
    </div>
  );
}

function RequestRow({ user, friendStatus }: { user: FriendUser; friendStatus: FriendStatus }) {
  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(' ') ||
    user.username ||
    'Unknown User';

  return (
    <li className="flex items-center gap-3 p-3 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a]">
      <Avatar user={user} size={10} />
      <div className="flex-1 min-w-0">
        <Link
          href={`/u/${user.username ?? user.clerkId}`}
          className="text-sm font-semibold text-white hover:text-[#FFC300] transition-colors truncate block"
        >
          {displayName}
        </Link>
        {user.username && (
          <p className="text-xs text-white/70">@{user.username}</p>
        )}
      </div>
      <FriendButton targetUserId={user.clerkId} initialStatus={friendStatus} />
    </li>
  );
}

function Empty({ message, cta }: { message: string; cta?: { href: string; label: string } }) {
  return (
    <div className="rounded-xl border border-dashed border-[#2a2a2a] bg-[#1a1a1a]/40 py-12 text-center">
      <p className="text-sm text-white/70 mb-3">{message}</p>
      {cta && (
        <Link
          href={cta.href}
          className="text-sm text-[#FFC300] hover:underline"
        >
          {cta.label} →
        </Link>
      )}
    </div>
  );
}
