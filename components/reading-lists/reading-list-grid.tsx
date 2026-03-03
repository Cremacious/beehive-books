'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Plus, BookMarked } from 'lucide-react';
import ReadingListCard from '@/components/reading-lists/reading-list-card';
import { Button } from '@/components/ui/button';
import type { ReadingList } from '@/lib/types/reading-list.types';

type PrivacyFilter = 'ALL' | 'PUBLIC' | 'FRIENDS' | 'PRIVATE';

const PRIVACY_TABS: { value: PrivacyFilter; label: string }[] = [
  { value: 'ALL',     label: 'All'     },
  { value: 'PUBLIC',  label: 'Public'  },
  { value: 'FRIENDS', label: 'Friends' },
  { value: 'PRIVATE', label: 'Private' },
];

export function ReadingListGrid({ lists }: { lists: ReadingList[] }) {
  const [query,         setQuery]         = useState('');
  const [privacyFilter, setPrivacyFilter] = useState<PrivacyFilter>('ALL');

  const privacyCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: lists.length };
    for (const l of lists) {
      counts[l.privacy] = (counts[l.privacy] ?? 0) + 1;
    }
    return counts;
  }, [lists]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = q
      ? lists.filter(
          (l) =>
            l.title.toLowerCase().includes(q) ||
            l.description.toLowerCase().includes(q),
        )
      : [...lists];

    if (privacyFilter !== 'ALL') {
      result = result.filter((l) => l.privacy === privacyFilter);
    }

    return result;
  }, [lists, query, privacyFilter]);

  if (lists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 rounded-2xl bg-[#252525] flex items-center justify-center mb-5">
          <BookMarked className="w-9 h-9 text-white/80" />
        </div>
        <h2 className="text-lg font-semibold text-white mb-2 mainFont">No reading lists yet</h2>
        <p className="text-sm text-white/80 mb-6 max-w-xs">
          Create your first reading list to track books you want to read.
        </p>
        <Button asChild>
          <Link href="/reading-lists/create">
            <Plus />
            Create your first list
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <>

      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/80 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); }}
          placeholder="Search your reading lists…"
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#252525] border border-[#2a2a2a] text-sm text-white placeholder-white/75 focus:outline-none focus:border-[#FFC300]/40 focus:ring-1 focus:ring-[#FFC300]/20 transition-all"
        />
      </div>

   
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {PRIVACY_TABS.map(({ value, label }) => {
          const count = privacyCounts[value] ?? 0;
          if (value !== 'ALL' && count === 0) return null;
          return (
            <button
              key={value}
              onClick={() => setPrivacyFilter(value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                privacyFilter === value
                  ? 'bg-[#FFC300] text-black'
                  : 'bg-[#252525] border border-[#2a2a2a] text-white hover:text-yellow-500 hover:border-[#3a3a3a]'
              }`}
            >
              {label}
              <span className={`text-sm ${privacyFilter === value ? 'text-black' : 'text-yellow-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

   
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="w-8 h-8 text-white/80 mb-3" />
          <p className="text-sm text-white/80 mb-2">
            {query ? <>No results for &ldquo;{query}&rdquo;</> : 'No lists in this category'}
          </p>
          <button
            onClick={() => { setQuery(''); setPrivacyFilter('ALL'); }}
            className="text-sm text-[#FFC300] hover:text-[#FFC300] transition-colors"
          >
            Clear filters
          </button>
        </div>
      )}

   
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((list) => (
            <ReadingListCard key={list.id} list={list} />
          ))}
        </div>
      )}
    </>
  );
}
