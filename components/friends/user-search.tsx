'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Loader2 } from 'lucide-react';
import { searchUsersAction } from '@/lib/actions/friend.actions';
import { FriendButton } from '@/components/friends/friend-button';
import type { SearchResult } from '@/lib/actions/friend.actions';

export function UserSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleChange = (value: string) => {
    setQuery(value);
    if (value.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    startTransition(async () => {
      const data = await searchUsersAction(value);
      setResults(data);
      setSearched(true);
    });
  };

  return (
    <div>
      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70 pointer-events-none" />
        {isPending && (
          <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70 animate-spin pointer-events-none" />
        )}
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Search by username or email…"
          className="w-full rounded-xl bg-[#1e1e1e] border border-[#333] pl-10 pr-10 py-2.5 text-sm text-white placeholder-white/75 focus:outline-none focus:border-[#FFC300]/50 focus:ring-1 focus:ring-[#FFC300]/20 transition-all"
        />
      </div>

      {searched && results.length === 0 && (
        <p className="text-sm text-white/80 text-center py-8">
          No users found for &ldquo;{query}&rdquo;
        </p>
      )}

      {results.length > 0 && (
        <ul className="space-y-2">
          {results.map(({ user, friendStatus }) => {
            const displayName = user.username || 'Unknown User';

            return (
              <li
                key={user.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a]"
              >
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[#2a2000] shrink-0">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={displayName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-sm font-bold text-[#FFC300]">
                        {(displayName[0] || '?').toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <Link
                    href={`/u/${user.username ?? user.id}`}
                    className=" font-semibold text-white hover:text-[#FFC300] transition-colors truncate block"
                  >
                    {user.username}
                  </Link>
                </div>

             
                <FriendButton
                  targetUserId={user.id}
                  initialStatus={friendStatus}
                  compact
                />
              </li>
            );
          })}
        </ul>
      )}

      {!searched && (
        <p className="text-sm text-white text-center py-8">
          Type at least 2 characters to search
        </p>
      )}
    </div>
  );
}
