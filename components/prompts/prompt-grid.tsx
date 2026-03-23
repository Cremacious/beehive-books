'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Plus, Lightbulb } from 'lucide-react';
import Pagination from '@/components/shared/pagination';
import { PromptCard } from './prompt-card';
import type { PromptCard as PromptCardType } from '@/lib/types/prompt.types';

const PAGE_SIZE = 6;

type SortOption = 'newest' | 'ending-soon' | 'most-entries';
type StatusFilter = 'all' | 'active' | 'ended';

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'ended', label: 'Ended' },
];

interface Props {
  prompts: PromptCardType[];
}

function PromptPlaceholder() {
  return (
    <div className="rounded-xl border-2 border-dashed border-[#FFC300]/15 bg-[#1a1a1a] h-44 flex items-center justify-center">
      <Lightbulb className="w-8 h-8 text-[#FFC300]/10" />
    </div>
  );
}

export function PromptGrid({ prompts }: Props) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortOption>('newest');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);

  const now = useMemo(() => new Date(), []);

  const statusCounts = useMemo(() => {
    const active = prompts.filter(
      (p) => p.status === 'ACTIVE' && p.endDate > now,
    ).length;
    return { all: prompts.length, active, ended: prompts.length - active };
  }, [prompts, now]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = q
      ? prompts.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q),
        )
      : [...prompts];

    if (statusFilter === 'active')
      list = list.filter((p) => p.status === 'ACTIVE' && p.endDate > now);
    if (statusFilter === 'ended')
      list = list.filter((p) => p.status === 'ENDED' || p.endDate <= now);

    if (sort === 'newest')
      list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    if (sort === 'ending-soon')
      list.sort((a, b) => a.endDate.getTime() - b.endDate.getTime());
    if (sort === 'most-entries')
      list.sort((a, b) => b.entryCount - a.entryCount);

    return list;
  }, [prompts, query, sort, statusFilter, now]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const displayed = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (q: string) => { setQuery(q); setPage(1); };
  const handleSort = (s: SortOption) => { setSort(s); setPage(1); };
  const handleStatus = (s: StatusFilter) => { setStatusFilter(s); setPage(1); };


  if (prompts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#1c1c1c] border border-[#2a2a2a] flex items-center justify-center mb-4">
          <Lightbulb className="w-7 h-7 text-white/20" />
        </div>
        <h2 className="text-lg font-bold text-white mainFont mb-2">No writing prompts yet</h2>
        <p className="text-sm text-white/50 max-w-sm leading-relaxed mb-6">
          Writing prompts are timed creative challenges. Join a prompt to write a short story, compete with other writers, and get feedback from the community.
        </p>
        <Link
          href="/explore/prompts"
          className="px-5 py-2.5 rounded-full bg-[#FFC300] text-black text-sm font-bold hover:bg-[#FFD040] transition-colors"
        >
          Browse prompts
        </Link>
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
            placeholder="Search by title or description…"
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
              <option value="newest">Newest</option>
              <option value="ending-soon">Ending Soon</option>
              <option value="most-entries">Most Entries</option>
            </select>
          </div>

          <Link
            href="/prompts/create"
            className="flex mainFont leading-none items-center gap-2 px-4 py-3 rounded-xl bg-[#FFC300] text-black text-sm font-semibold hover:bg-[#FFD700] transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            New Challenge
          </Link>
        </div>
      </div>

  
      <div className="flex gap-3 mb-8 overflow-x-auto pb-1">
        {STATUS_TABS.map(({ value, label }) => {
          const count = statusCounts[value];
          if (value !== 'all' && count === 0) return null;
          return (
            <button
              key={value}
              onClick={() => handleStatus(value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                statusFilter === value
                  ? 'bg-[#FFC300] text-black'
                  : 'bg-[#252525] border border-[#2a2a2a] text-white hover:text-yellow-500 hover:border-[#2a2a2a]'
              }`}
            >
              {label}
              <span
                className={`text-sm ${
                  statusFilter === value ? 'text-black/60' : 'text-yellow-500'
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
              'No prompts in this category'
            )}
          </p>
          <button
            onClick={() => { setQuery(''); setStatusFilter('all'); }}
            className="text-xs text-[#FFC300]/70 hover:text-[#FFC300] transition-colors mt-2"
          >
            Clear filters
          </button>
        </div>
      )}

   
      {displayed.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayed.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
            {displayed.length < PAGE_SIZE &&
              Array.from(
                { length: PAGE_SIZE - displayed.length },
                (_, i) => <PromptPlaceholder key={`ph-${i}`} />,
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
