'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, Feather, UserPlus } from 'lucide-react';
import { FriendButton } from '@/components/friends/friend-button';
import type { FriendUser, FriendStatus } from '@/lib/actions/friend.actions';

type Request = { friendshipId: string; user: FriendUser };

function Avatar({ user, size, textSize = 'text-sm' }: { user: FriendUser; size: string; textSize?: string }) {
  const name = user.username || '?';
  return (
    <div className={`relative rounded-full overflow-hidden bg-[#2a2000] shrink-0 ${size}`}>
      {user.image ? (
        <Image src={user.image} alt={name} fill className="object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span className={`font-bold text-yellow-500 ${textSize}`}>
            {(name[0] || '?').toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
}

function UserDetail({ user, friendStatus }: { user: FriendUser; friendStatus: FriendStatus }) {
  const activity = user.activity ?? { recentBooks: [], recentPrompts: [] };
  const hasActivity = activity.recentBooks.length > 0 || activity.recentPrompts.length > 0;

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 pt-6 pb-4 border-b border-[#2a2a2a]">
        <Avatar user={user} size="w-14 h-14" textSize="text-xl" />
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-white mainFont truncate">
            {user.username || 'Unknown User'}
          </h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            <BookOpen className="w-3.5 h-3.5 text-yellow-500" />
            <span className="text-white/80 text-xs">
              {user.bookCount ?? 0} public {(user.bookCount ?? 0) === 1 ? 'book' : 'books'}
            </span>
          </div>
        </div>
        <Link
          href={`/u/${user.username ?? user.id}`}
          className="text-xs text-yellow-500 hover:text-white transition-colors font-medium shrink-0"
        >
          View Profile
        </Link>
      </div>

      {/* Bio */}
      <div className="px-6 py-4 border-b border-[#2a2a2a]">
        <p className="text-xs font-semibold text-white/80 uppercase tracking-wider mb-2">Bio</p>
        {user.bio ? (
          <p className="text-sm text-white/80 leading-relaxed">{user.bio}</p>
        ) : (
          <p className="text-sm text-white/80 italic">No bio yet.</p>
        )}
      </div>

      {/* Activity */}
      {hasActivity && (
        <div className="px-6 py-4 flex-1">
          <p className="text-xs font-semibold text-white/80 uppercase tracking-wider mb-3">
            Recent Activity
          </p>
          {activity.recentBooks.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-1.5 mb-2">
                <BookOpen className="w-3.5 h-3.5 text-yellow-500" />
                <span className="text-xs font-medium text-white">Books</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {activity.recentBooks.map((book) => (
                  <Link
                    key={book.id}
                    href={`/books/${book.id}`}
                    className="group flex items-center gap-3 p-2.5 rounded-lg bg-[#141414] border border-[#2a2a2a] hover:border-yellow-500/20 transition-colors"
                  >
                    <div className="relative w-8 h-11 rounded shrink-0 overflow-hidden bg-[#1a1a1a]">
                      {book.coverUrl ? (
                        <Image src={book.coverUrl} alt={book.title} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-xs font-bold text-white/80 mainFont">
                            {book.title[0]?.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-white group-hover:text-yellow-500 transition-colors truncate mainFont">
                        {book.title}
                      </p>
                      {book.genre && (
                        <p className="text-xs text-white/80 truncate">{book.genre}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {activity.recentPrompts.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Feather className="w-3.5 h-3.5 text-yellow-500" />
                <span className="text-xs font-medium text-white">Prompts</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {activity.recentPrompts.map((prompt) => (
                  <Link
                    key={prompt.id}
                    href={`/prompts/${prompt.id}`}
                    className="group flex items-center justify-between gap-3 p-2.5 rounded-lg bg-[#141414] border border-[#2a2a2a] hover:border-yellow-500/20 transition-colors"
                  >
                    <p className="text-sm text-white group-hover:text-yellow-500 transition-colors truncate">
                      {prompt.title}
                    </p>
                    <span className={`text-xs font-medium shrink-0 px-2 py-0.5 rounded-full ${
                      prompt.status === 'ACTIVE'
                        ? 'bg-yellow-500/15 text-yellow-500'
                        : 'bg-white/10 text-white/80'
                    }`}>
                      {prompt.status === 'ACTIVE' ? 'Active' : 'Ended'}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!hasActivity && (
        <div className="px-6 py-4 flex-1">
          <p className="text-xs font-semibold text-white/80 uppercase tracking-wider mb-2">
            Recent Activity
          </p>
          <p className="text-sm text-white/80 italic">No public activity yet.</p>
        </div>
      )}

      {/* Footer — action */}
      <div className="px-6 py-4 border-t border-[#2a2a2a] flex justify-end">
        <FriendButton targetUserId={user.id} initialStatus={friendStatus} />
      </div>
    </div>
  );
}

type Label = 'INCOMING' | 'SENT';

export function RequestsPanel({
  receivedRequests,
  sentRequests,
}: {
  receivedRequests: Request[];
  sentRequests: Request[];
}) {
  const all: Array<Request & { label: Label }> = [
    ...receivedRequests.map((r) => ({ ...r, label: 'INCOMING' as Label })),
    ...sentRequests.map((r) => ({ ...r, label: 'SENT' as Label })),
  ];

  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(all[0]?.user.id ?? null);
  const selected = all.find((r) => r.user.id === selectedId);

  if (all.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-center">
        <div className="w-20 h-20 rounded-2xl bg-[#1c1c1c] border border-[#2a2a2a] flex items-center justify-center mb-4">
          <UserPlus className="w-9 h-9 text-white/80" />
        </div>
        <h2 className="text-xl font-bold text-white mainFont mb-2">No pending requests</h2>
        <p className="text-sm text-white/80 max-w-sm">
          Friend requests you send or receive will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex rounded-xl border border-[#2a2a2a] overflow-hidden" style={{ minHeight: '560px' }}>
      {/* Left list */}
      <div className="w-full sm:w-60 shrink-0 border-r border-[#2a2a2a] overflow-y-auto">
        {receivedRequests.length > 0 && (
          <div className="px-4 pt-3 pb-1">
            <p className="text-xs font-semibold text-white/80 uppercase tracking-wider">Incoming</p>
          </div>
        )}
        {receivedRequests.map(({ friendshipId, user }) => {
          const active = user.id === selectedId;
          return (
            <button
              key={friendshipId}
              onClick={() => window.innerWidth < 640
                ? router.push(`/u/${user.username ?? user.id}`)
                : setSelectedId(user.id)
              }
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-[#2a2a2a] ${
                active ? 'bg-yellow-500/10 border-l-2 border-l-yellow-500' : 'hover:bg-white/5'
              }`}
            >
              <Avatar user={user} size="w-9 h-9" textSize="text-xs" />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate mainFont ${active ? 'text-yellow-500' : 'text-white'}`}>
                  {user.username || 'Unknown'}
                </p>
                <p className="text-xs text-yellow-500 font-medium">Wants to connect</p>
              </div>
            </button>
          );
        })}

        {sentRequests.length > 0 && (
          <div className="px-4 pt-3 pb-1">
            <p className="text-xs font-semibold text-white/80 uppercase tracking-wider">Sent</p>
          </div>
        )}
        {sentRequests.map(({ friendshipId, user }) => {
          const active = user.id === selectedId;
          return (
            <button
              key={friendshipId}
              onClick={() => window.innerWidth < 640
                ? router.push(`/u/${user.username ?? user.id}`)
                : setSelectedId(user.id)
              }
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-[#2a2a2a] last:border-b-0 ${
                active ? 'bg-yellow-500/10 border-l-2 border-l-yellow-500' : 'hover:bg-white/5'
              }`}
            >
              <Avatar user={user} size="w-9 h-9" textSize="text-xs" />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate mainFont ${active ? 'text-yellow-500' : 'text-white'}`}>
                  {user.username || 'Unknown'}
                </p>
                <p className="text-xs text-white/80">Pending</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Right detail */}
      <div className="hidden sm:block sm:flex-1 bg-[#181818] min-w-0">
        {selected ? (
          <UserDetail
            user={selected.user}
            friendStatus={
              selected.label === 'INCOMING'
                ? { status: 'PENDING_RECEIVED', friendshipId: selected.friendshipId }
                : { status: 'PENDING_SENT', friendshipId: selected.friendshipId }
            }
          />
        ) : (
          <div className="flex items-center justify-center h-full text-white/80 text-sm">
            Select a request
          </div>
        )}
      </div>
    </div>
  );
}
