'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, Search, Loader2 } from 'lucide-react';
import { FriendButton } from '@/components/friends/friend-button';
import { searchUsersAction } from '@/lib/actions/friend.actions';
import type { SuggestedUser, SearchResult } from '@/lib/actions/friend.actions';
import { useTransition } from 'react';

function Avatar({ user }: { user: { username: string | null; image: string | null } }) {
  const name = user.username || '?';
  return (
    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[#2a2000] shrink-0">
      {user.image ? (
        <Image src={user.image} alt={name} fill className="object-cover" />
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

function SuggestedCard({ user }: { user: SuggestedUser }) {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] hover:border-[#FFC300]/20 transition-colors">
      <div className="flex items-start gap-3">
        <Avatar user={user} />
        <div className="flex-1 min-w-0">
          <Link
            href={`/u/${user.username ?? user.id}`}
            className="text-sm font-semibold text-white hover:text-[#FFC300] transition-colors truncate block mainFont"
          >
            {user.username || 'Unknown User'}
          </Link>
          <div className="flex items-center gap-1 mt-0.5 text-white/50 text-xs">
            <BookOpen className="w-3 h-3" />
            <span>{user.bookCount} public {user.bookCount === 1 ? 'book' : 'books'}</span>
          </div>
        </div>
      </div>

      {user.bio ? (
        <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">{user.bio}</p>
      ) : (
        <p className="text-xs text-white/30 italic">No bio yet.</p>
      )}

      {user.latestBook && (
        <Link
          href={`/books/${user.latestBook.id}`}
          className="group flex items-center gap-2 p-2 rounded-lg bg-[#141414] border border-[#2a2a2a] hover:border-[#FFC300]/20 transition-colors"
        >
          <div className="relative w-7 h-10 rounded shrink-0 overflow-hidden bg-[#1a1a1a]">
            {user.latestBook.coverUrl ? (
              <Image
                src={user.latestBook.coverUrl}
                alt={user.latestBook.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-xs font-bold text-white/20 mainFont">
                  {user.latestBook.title[0]?.toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <p className="text-xs text-white/70 truncate group-hover:text-white transition-colors">
            {user.latestBook.title}
          </p>
        </Link>
      )}

      <div className="mt-auto">
        <FriendButton
          targetUserId={user.id}
          initialStatus={user.friendStatus}
        />
      </div>
    </div>
  );
}

export function SuggestedUsers({ suggested }: { suggested: SuggestedUser[] }) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);
  const [searched, setSearched] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (value: string) => {
    setQuery(value);
    if (value.trim().length < 2) {
      setSearchResults(null);
      setSearched(false);
      return;
    }
    startTransition(async () => {
      const data = await searchUsersAction(value);
      setSearchResults(data);
      setSearched(true);
    });
  };

  return (
    <div>
      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
        {isPending && (
          <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 animate-spin pointer-events-none" />
        )}
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by username..."
          className="w-full rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] pl-10 pr-10 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFC300]/50 focus:ring-1 focus:ring-[#FFC300]/20 transition-all"
        />
      </div>

      {/* Search results */}
      {searchResults !== null && (
        <>
          {searched && searchResults.length === 0 && (
            <p className="text-sm text-white/60 text-center py-8">
              No users found for &ldquo;{query}&rdquo;
            </p>
          )}
          {searchResults.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map(({ user, friendStatus }) => (
                <SuggestedCard
                  key={user.id}
                  user={{
                    ...user,
                    bio: null,
                    bookCount: 0,
                    latestBook: null,
                    friendStatus,
                  }}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Suggested (shown when not searching) */}
      {searchResults === null && (
        <>
          {suggested.length > 0 && (
            <>
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">
                Active Writers
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {suggested.map((user) => (
                  <SuggestedCard key={user.id} user={user} />
                ))}
              </div>
            </>
          )}
          {suggested.length === 0 && (
            <p className="text-sm text-white/50 text-center py-12">
              No suggestions right now — try searching above.
            </p>
          )}
        </>
      )}
    </div>
  );
}
