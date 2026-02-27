'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { Plus, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Pagination from '@/components/shared/pagination';
import { PromptCard } from './prompt-card';
import type { PromptCard as PromptCardType } from '@/lib/types/prompt.types';

const PAGE_SIZE = 12;

type SortOption = 'newest' | 'ending-soon' | 'most-entries';
type FilterOption = 'all' | 'active' | 'ended';

interface Props {
  prompts: PromptCardType[];
}

export function PromptGrid({ prompts }: Props) {
  const [sort, setSort] = useState<SortOption>('newest');
  const [filter, setFilter] = useState<FilterOption>('all');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let list = [...prompts];

    if (filter === 'active')
      list = list.filter(
        (p) => p.status === 'ACTIVE' && p.endDate > new Date(),
      );
    if (filter === 'ended')
      list = list.filter(
        (p) => p.status === 'ENDED' || p.endDate <= new Date(),
      );

    if (sort === 'newest')
      list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    if (sort === 'ending-soon')
      list.sort((a, b) => a.endDate.getTime() - b.endDate.getTime());
    if (sort === 'most-entries')
      list.sort((a, b) => b.entryCount - a.entryCount);

    return list;
  }, [prompts, sort, filter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleFilter(f: FilterOption) {
    setFilter(f);
    setPage(1);
  }

  function handleSort(s: SortOption) {
    setSort(s);
    setPage(1);
  }

  if (prompts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#2a2a2a] bg-[#1a1a1a]/40 py-20 text-center">
        <Lightbulb className="w-10 h-10 text-[#FFC300]/30 mx-auto mb-4" />
        <p className="text-white/80 font-medium mb-2">No prompts yet</p>
        <p className="text-sm text-white/80 mb-6">
          Create your first writing challenge and invite friends!
        </p>
        <Button asChild size="sm">
          <Link href="/prompts/create">
            <Plus className="w-4 h-4" />
            Create Prompt
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a]">
          {(['all', 'active', 'ended'] as FilterOption[]).map((f) => (
            <button
              key={f}
              onClick={() => handleFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                filter === f
                  ? 'bg-[#FFC300] text-black'
                  : 'text-white hover:text-white hover:bg-white/5'
              }`}
            >
              {f === 'all'
                ? `All (${prompts.length})`
                : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <select
          value={sort}
          onChange={(e) => handleSort(e.target.value as SortOption)}
          className="ml-auto px-3 py-1.5 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] text-sm text-white focus:outline-none focus:border-[#FFC300]/40 transition-all"
        >
          <option value="newest">Newest</option>
          <option value="ending-soon">Ending Soon</option>
          <option value="most-entries">Most Entries</option>
        </select>
      </div>

      {paginated.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#2a2a2a] py-12 text-center">
          <p className="text-sm text-white/80">No prompts match this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginated.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        className="mt-8"
      />
    </div>
  );
}
