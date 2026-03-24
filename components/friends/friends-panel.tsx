'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, Users2 } from 'lucide-react';
import { FriendButton } from '@/components/friends/friend-button';
import type { FriendUser, FriendStatus } from '@/lib/actions/friend.actions';

type Friend = { friendshipId: string; user: FriendUser };

function Avatar({
  user,
  size,
  textSize = 'text-sm',
}: {
  user: FriendUser;
  size: string;
  textSize?: string;
}) {
  const name = user.username || '?';
  return (
    <div className={`relative rounded-full overflow-hidden bg-[#2a2000] shrink-0 ${size}`}>
      {user.image ? (
        <Image src={user.image} alt={name} fill className="object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span className={`font-bold text-[#FFC300] ${textSize}`}>
            {(name[0] || '?').toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
}

function FriendDetail({ user, friendshipId }: { user: FriendUser; friendshipId: string }) {
  return (
    <div className="flex flex-col h-full">
      {/* Hero */}
      <div className="flex flex-col items-center text-center px-8 pt-10 pb-6 border-b border-[#2a2a2a]">
        <Avatar user={user} size="w-24 h-24" textSize="text-3xl" />
        <h2 className="mt-4 text-xl font-bold text-white mainFont">
          {user.username || 'Unknown User'}
        </h2>
        {user.bio ? (
          <p className="mt-2 text-sm text-white/70 max-w-xs leading-relaxed">{user.bio}</p>
        ) : (
          <p className="mt-2 text-sm text-white/30 italic">No bio yet.</p>
        )}
        <div className="flex items-center gap-1.5 mt-3 text-white/50 text-xs">
          <BookOpen className="w-3.5 h-3.5" />
          <span>
            {user.bookCount ?? 0} public {(user.bookCount ?? 0) === 1 ? 'book' : 'books'}
          </span>
        </div>
      </div>

      {/* Latest book */}
      <div className="px-6 py-5 border-b border-[#2a2a2a]">
        <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
          Latest Work
        </p>
        {user.latestBook ? (
          <Link
            href={`/books/${user.latestBook.id}`}
            className="group flex items-center gap-3 p-3 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#FFC300]/25 transition-colors"
          >
            <div className="relative w-10 h-14 rounded shrink-0 overflow-hidden bg-[#141414]">
              {user.latestBook.coverUrl ? (
                <Image
                  src={user.latestBook.coverUrl}
                  alt={user.latestBook.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-lg font-bold text-white/20 mainFont">
                    {user.latestBook.title[0]?.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate group-hover:text-[#FFC300] transition-colors mainFont">
                {user.latestBook.title}
              </p>
              {user.latestBook.genre && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#2a2a2a] text-white/60 font-medium mt-1 inline-block">
                  {user.latestBook.genre}
                </span>
              )}
            </div>
          </Link>
        ) : (
          <p className="text-sm text-white/30 italic">No public books yet.</p>
        )}
      </div>

      {/* Actions */}
      <div className="px-6 py-5 flex flex-col gap-2 mt-auto">
        <Link
          href={`/u/${user.username ?? user.id}`}
          className="block w-full text-center py-2.5 rounded-xl bg-[#FFC300] text-black text-sm font-bold hover:bg-[#FFD040] transition-colors mainFont"
        >
          View Profile
        </Link>
        <div className="flex justify-center">
          <FriendButton
            targetUserId={user.id}
            initialStatus={{ status: 'FRIENDS', friendshipId }}
          />
        </div>
      </div>
    </div>
  );
}

export function FriendsPanel({ friends }: { friends: Friend[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(
    friends[0]?.user.id ?? null,
  );

  const selected = friends.find((f) => f.user.id === selectedId);

  if (friends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-center">
        <div className="w-20 h-20 rounded-2xl bg-[#1c1c1c] border border-[#2a2a2a] flex items-center justify-center mb-4">
          <Users2 className="w-9 h-9 text-white/20" />
        </div>
        <h2 className="text-xl font-bold text-white mainFont mb-2">No friends yet</h2>
        <p className="text-sm text-white/70 mb-5 max-w-sm">
          Find writers to connect with on the Find People tab.
        </p>
        <Link
          href="/friends?tab=find"
          className="px-5 py-2.5 rounded-full bg-[#FFC300] text-black text-sm font-bold hover:bg-[#FFD040] transition-colors mainFont"
        >
          Find People
        </Link>
      </div>
    );
  }

  return (
    <div className="flex gap-0 rounded-xl border border-[#2a2a2a] overflow-hidden min-h-[520px]">
      {/* Left — friend list */}
      <div className="w-64 shrink-0 border-r border-[#2a2a2a] overflow-y-auto">
        {friends.map(({ friendshipId, user }) => {
          const active = user.id === selectedId;
          return (
            <button
              key={friendshipId}
              onClick={() => setSelectedId(user.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors border-b border-[#2a2a2a] last:border-b-0 ${
                active
                  ? 'bg-[#FFC300]/10 border-l-2 border-l-[#FFC300]'
                  : 'hover:bg-white/5'
              }`}
            >
              <Avatar user={user} size="w-9 h-9" textSize="text-xs" />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate mainFont ${active ? 'text-[#FFC300]' : 'text-white'}`}>
                  {user.username || 'Unknown'}
                </p>
                {user.bio ? (
                  <p className="text-xs text-white/50 truncate">{user.bio}</p>
                ) : (
                  <p className="text-xs text-white/25 italic">No bio</p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Right — detail panel */}
      <div className="flex-1 bg-[#181818]">
        {selected ? (
          <FriendDetail user={selected.user} friendshipId={selected.friendshipId} />
        ) : (
          <div className="flex items-center justify-center h-full text-white/30 text-sm">
            Select a friend
          </div>
        )}
      </div>
    </div>
  );
}
