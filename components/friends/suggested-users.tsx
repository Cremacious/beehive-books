'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, Feather, Search, Loader2 } from 'lucide-react';
import { FriendButton } from '@/components/friends/friend-button';
import { searchUsersAction } from '@/lib/actions/friend.actions';
import type { SuggestedUser, SearchResult, FriendUser } from '@/lib/actions/friend.actions';

type ListUser = SuggestedUser | (SearchResult & { activity: { recentBooks: []; recentPrompts: [] }; bookCount: 0; latestBook: null; bio: null });

function toFriendUser(u: SuggestedUser): FriendUser {
  return {
    id: u.id,
    username: u.username,
    image: u.image,
    bio: u.bio,
    bookCount: u.bookCount,
    latestBook: u.latestBook,
    activity: u.activity,
  };
}

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

function UserDetail({ user }: { user: SuggestedUser }) {
  const activity = user.activity ?? { recentBooks: [], recentPrompts: [] };
  const hasActivity = activity.recentBooks.length > 0 || activity.recentPrompts.length > 0;

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 pt-6 pb-4 border-b border-[#2a2a2a]">
        <Avatar user={toFriendUser(user)} size="w-14 h-14" textSize="text-xl" />
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-white mainFont truncate">
            {user.username || 'Unknown User'}
          </h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            <BookOpen className="w-3.5 h-3.5 text-yellow-500" />
            <span className="text-white/80 text-xs">
              {user.bookCount} public {user.bookCount === 1 ? 'book' : 'books'}
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
                <span className="text-xs font-medium text-white">Sparks</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {activity.recentPrompts.map((prompt) => (
                  <Link
                    key={prompt.id}
                    href={`/sparks/${prompt.id}`}
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

      {/* Footer */}
      <div className="px-6 py-4 border-t border-[#2a2a2a] flex justify-end">
        <FriendButton targetUserId={user.id} initialStatus={user.friendStatus} />
      </div>
    </div>
  );
}

export function SuggestedUsers({ suggested }: { suggested: SuggestedUser[] }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Convert search results to SuggestedUser shape for the list
  const searchAsSuggested: SuggestedUser[] = searchResults.map((r) => ({
    id: r.user.id,
    username: r.user.username,
    image: r.user.image,
    bio: null,
    bookCount: 0,
    latestBook: null,
    activity: { recentBooks: [], recentPrompts: [] },
    friendStatus: r.friendStatus,
  }));

  const listItems = isSearching ? searchAsSuggested : suggested;
  const [selectedId, setSelectedId] = useState<string | null>(suggested[0]?.id ?? null);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (value.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      setSelectedId(suggested[0]?.id ?? null);
      return;
    }
    setIsSearching(true);
    startTransition(async () => {
      const data = await searchUsersAction(value);
      setSearchResults(data);
      setSelectedId(data[0]?.user.id ?? null);
    });
  };

  const selected = listItems.find((u) => u.id === selectedId);

  return (
    <div>
      {/* Search bar above the panel */}
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/80 pointer-events-none" />
        {isPending && (
          <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/80 animate-spin pointer-events-none" />
        )}
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by username..."
          className="w-full rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-white/80 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/20 transition-all"
        />
      </div>

      {listItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-white/80">
            {isSearching ? `No results for "${query}"` : 'No suggested writers right now.'}
          </p>
        </div>
      ) : (
        <div className="flex rounded-xl border border-[#2a2a2a] overflow-hidden" style={{ minHeight: '560px' }}>
          {/* Left list */}
          <div className="w-full sm:w-60 shrink-0 border-r border-[#2a2a2a] overflow-y-auto">
            {!isSearching && (
              <div className="px-4 pt-3 pb-1">
                <p className="text-xs font-semibold text-white/80 uppercase tracking-wider">Active Writers</p>
              </div>
            )}
            {listItems.map((user) => {
              const active = user.id === selectedId;
              return (
                <button
                  key={user.id}
                  onClick={() => window.innerWidth < 640
                    ? router.push(`/u/${user.username ?? user.id}`)
                    : setSelectedId(user.id)
                  }
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors border-b border-[#2a2a2a] last:border-b-0 ${
                    active ? 'bg-yellow-500/10 border-l-2 border-l-yellow-500' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="relative w-9 h-9 rounded-full overflow-hidden bg-[#2a2000] shrink-0">
                    {user.image ? (
                      <Image src={user.image} alt={user.username || '?'} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-xs font-bold text-yellow-500">
                          {(user.username?.[0] || '?').toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate mainFont ${active ? 'text-yellow-500' : 'text-white'}`}>
                      {user.username || 'Unknown'}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <BookOpen className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs text-white/80">{user.bookCount} books</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right detail */}
          <div className="hidden sm:block sm:flex-1 bg-[#181818] min-w-0">
            {selected ? (
              <UserDetail user={selected} />
            ) : (
              <div className="flex items-center justify-center h-full text-white/80 text-sm">
                Select a writer
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
