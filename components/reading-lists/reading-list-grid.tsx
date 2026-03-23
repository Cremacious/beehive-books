'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal, Plus, BookMarked } from 'lucide-react';
import ReadingListCard from '@/components/reading-lists/reading-list-card';
import Pagination from '@/components/shared/pagination';
import type { ReadingList } from '@/lib/types/reading-list.types';

type PrivacyFilter = 'ALL' | 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
type SortOption = 'recent' | 'title' | 'most-books';

const PRIVACY_TABS: { value: PrivacyFilter; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'PUBLIC', label: 'Public' },
  { value: 'FRIENDS', label: 'Friends' },
  { value: 'PRIVATE', label: 'Private' },
];

const PAGE_SIZE = 6;

function ListPlaceholder() {
  return (
    <div className="rounded-xl border-2 border-dashed border-[#FFC300]/15 bg-[#1a1a1a] h-44 flex items-center justify-center">
      <BookMarked className="w-8 h-8 text-[#FFC300]/10" />
    </div>
  );
}

export function ReadingListGrid({ lists }: { lists: ReadingList[] }) {
  const [query, setQuery] = useState('');
  const [privacyFilter, setPrivacyFilter] = useState<PrivacyFilter>('ALL');
  const [sort, setSort] = useState<SortOption>('recent');
  const [page, setPage] = useState(1);

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

    if (sort === 'title') result.sort((a, b) => a.title.localeCompare(b.title));
    if (sort === 'most-books') result.sort((a, b) => b.bookCount - a.bookCount);

    return result;
  }, [lists, query, privacyFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const displayed = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (q: string) => { setQuery(q); setPage(1); };
  const handleSort = (s: SortOption) => { setSort(s); setPage(1); };
  const handlePrivacy = (p: PrivacyFilter) => { setPrivacyFilter(p); setPage(1); };


  if (lists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-center">
        <div className="w-20 h-20 rounded-2xl bg-[#1c1c1c] border border-[#2a2a2a] flex items-center justify-center mb-4">
          <BookMarked className="w-9 h-9 text-white/20" />
        </div>
        <h2 className="text-xl font-bold text-white mainFont mb-2">No reading lists yet</h2>
        <p className="text-sm text-white/80 max-w-sm leading-relaxed mb-6">
          Reading lists let you organize books you want to read, are currently reading, or have finished. Create a list to start curating your reading journey.
        </p>
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <Link
            href="/reading-lists/create"
            className="px-5 py-2.5 rounded-full bg-[#FFC300] text-black text-sm font-bold hover:bg-[#FFD040] transition-colors"
          >
            New List
          </Link>
          <Link
            href="/explore/reading-lists"
            className="px-5 py-2.5 rounded-full border border-[#2a2a2a] text-white/70 text-sm font-medium hover:text-white hover:border-white/30 transition-colors"
          >
            Explore reading lists
          </Link>
        </div>
      </div>
    );
  }


  return (
    <>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/80 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search your reading lists…"
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#252525] border border-[#2a2a2a] text-base text-white placeholder-white/70 focus:outline-none focus:border-[#FFC300]/40 focus:ring-1 focus:ring-[#FFC300]/20 transition-all"
          />
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1 sm:flex-none">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-500 pointer-events-none" />
            <select
              value={sort}
              onChange={(e) => handleSort(e.target.value as SortOption)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#252525] border border-[#2a2a2a] text-base text-white focus:outline-none focus:border-[#FFC300]/40 transition-all appearance-none cursor-pointer"
            >
              <option value="recent">Most Recent</option>
              <option value="title">Title (A–Z)</option>
              <option value="most-books">Most Books</option>
            </select>
          </div>

          <Link
            href="/reading-lists/create"
            className="flex mainFont leading-none items-center gap-2 px-4 py-3 rounded-xl bg-[#FFC300] text-black text-sm font-semibold hover:bg-[#FFD700] transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            New List
          </Link>
        </div>
      </div>

  
      <div className="flex gap-3 mb-8 overflow-x-auto pb-1">
        {PRIVACY_TABS.map(({ value, label }) => {
          const count = privacyCounts[value] ?? 0;
          if (value !== 'ALL' && count === 0) return null;
          return (
            <button
              key={value}
              onClick={() => handlePrivacy(value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                privacyFilter === value
                  ? 'bg-[#FFC300] text-black'
                  : 'bg-[#252525] border border-[#2a2a2a] text-white hover:text-yellow-500 hover:border-[#2a2a2a]'
              }`}
            >
              {label}
              <span
                className={`text-sm ${
                  privacyFilter === value ? 'text-black/60' : 'text-yellow-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

  
      {displayed.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="w-8 h-8 text-white/80 mb-3" />
          <p className="text-sm text-white/80 mb-1">
            {query ? (
              <>No results for &ldquo;{query}&rdquo;</>
            ) : (
              'No lists in this category'
            )}
          </p>
          <button
            onClick={() => { setQuery(''); setPrivacyFilter('ALL'); }}
            className="text-xs text-[#FFC300]/70 hover:text-[#FFC300] transition-colors mt-2"
          >
            Clear filters
          </button>
        </div>
      )}

      {displayed.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayed.map((list) => (
              <ReadingListCard key={list.id} list={list} />
            ))}
            {displayed.length < PAGE_SIZE &&
              Array.from(
                { length: PAGE_SIZE - displayed.length },
                (_, i) => <ListPlaceholder key={`ph-${i}`} />,
              )}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            className="mt-8"
          />
        </>
      )}
    </>
  );
}
