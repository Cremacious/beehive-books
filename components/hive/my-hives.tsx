'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  SlidersHorizontal,
  Plus,
  Hexagon,
} from 'lucide-react';
import HiveCard from './hive-card';
import Pagination from '@/components/shared/pagination';
import type { HiveWithMembership, HiveRole } from '@/lib/types/hive.types';

type SortOption = 'recent' | 'name' | 'members';
type RoleFilter = 'ALL' | HiveRole;

const ROLE_TABS: { value: RoleFilter; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'OWNER', label: 'Owner' },
  { value: 'MODERATOR', label: 'Moderator' },
  { value: 'CONTRIBUTOR', label: 'Contributor' },
  { value: 'BETA_READER', label: 'Beta Reader' },
];

const PAGE_SIZE = 6;

function HivePlaceholder() {
  return (
    <div className="flex flex-col rounded-xl border border-dashed border-[#2a2a2a] bg-[#141414] overflow-hidden opacity-40 h-44">
      <div className="flex-1 px-4 pt-4 pb-3 flex flex-col gap-2">
        <div className="h-3 rounded bg-[#2a2a2a] w-2/3" />
        <div className="h-2 rounded bg-[#2a2a2a] w-full" />
        <div className="h-2 rounded bg-[#2a2a2a] w-4/5" />
      </div>
      <div className="px-4 pb-4">
        <div className="h-2 rounded bg-[#2a2a2a] w-1/3" />
      </div>
    </div>
  );
}

export default function MyHives({ hives }: { hives: HiveWithMembership[] }) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortOption>('recent');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');
  const [page, setPage] = useState(1);

  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: hives.length };
    for (const h of hives) {
      if (h.myRole) {
        counts[h.myRole] = (counts[h.myRole] ?? 0) + 1;
      }
    }
    return counts;
  }, [hives]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = q
      ? hives.filter(
          (h) =>
            h.name.toLowerCase().includes(q) ||
            h.genre.toLowerCase().includes(q) ||
            h.description.toLowerCase().includes(q) ||
            h.tags.some((t) => t.toLowerCase().includes(q)),
        )
      : [...hives];

    if (roleFilter !== 'ALL') {
      result = result.filter((h) => h.myRole === roleFilter);
    }

    if (sort === 'name') result.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'members') result.sort((a, b) => b.memberCount - a.memberCount);

    return result;
  }, [hives, query, sort, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const displayed = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (q: string) => { setQuery(q); setPage(1); };
  const handleSort = (s: SortOption) => { setSort(s); setPage(1); };
  const handleRole = (r: RoleFilter) => { setRoleFilter(r); setPage(1); };


  if (hives.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-center">
        <div className="w-20 h-20 rounded-2xl bg-[#1c1c1c] border border-[#2a2a2a] flex items-center justify-center mb-4">
          <Hexagon className="w-9 h-9 text-white/20" />
        </div>
        <h2 className="text-xl font-bold text-white mainFont mb-2">No hives yet</h2>
        <p className="text-sm text-white/80 max-w-sm leading-relaxed mb-6">
          Hives are collaborative writing spaces. Create one to co-write a book with other authors, beta readers, and editors. Or join an existing hive to contribute.
        </p>
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <Link
            href="/hive/create"
            className="px-5 py-2.5 rounded-full bg-[#FFC300] text-black text-sm font-bold hover:bg-[#FFD040] transition-colors"
          >
            Create a Hive
          </Link>
          <Link
            href="/explore/hives"
            className="px-5 py-2.5 rounded-full border border-[#2a2a2a] text-white/70 text-sm font-medium hover:text-white hover:border-white/30 transition-colors"
          >
            Explore Hives
          </Link>
        </div>
      </div>
    );
  }

  
  return (
    <>
   
      <div className="flex flex-col sm:flex-row gap-3 mb-6 mt-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/80 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by name, genre, or tag…"
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#252525] border border-[#2a2a2a] text-base text-white placeholder-white/30 focus:outline-none focus:border-[#FFC300]/40 focus:ring-1 focus:ring-[#FFC300]/20 transition-all"
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
              <option value="name">Name (A–Z)</option>
              <option value="members">Most Members</option>
            </select>
          </div>

          <Link
            href="/hive/create"
            className="flex mainFont leading-none items-center gap-2 px-4 py-3 rounded-xl bg-[#FFC300] text-black text-sm font-semibold hover:bg-[#FFD700] transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            New Hive
          </Link>
        </div>
      </div>


      <div className="flex gap-3 mb-8 overflow-x-auto pb-1">
        {ROLE_TABS.map(({ value, label }) => {
          const count = roleCounts[value] ?? 0;
          if (value !== 'ALL' && count === 0) return null;
          return (
            <button
              key={value}
              onClick={() => handleRole(value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                roleFilter === value
                  ? 'bg-[#FFC300] text-black'
                  : 'bg-[#252525] border border-[#2a2a2a] text-white hover:text-yellow-500 hover:border-[#2a2a2a]'
              }`}
            >
              {label}
              <span
                className={`text-sm ${
                  roleFilter === value ? 'text-black/60' : 'text-yellow-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

   
      {displayed.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-sm text-white/50">No hives match your filters.</p>
          <button
            onClick={() => { setQuery(''); setRoleFilter('ALL'); }}
            className="text-xs text-[#FFC300]/70 hover:text-[#FFC300] transition-colors mt-2"
          >
            Clear filters
          </button>
        </div>
      )}

      {displayed.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayed.map((hive) => (
              <HiveCard key={hive.id} hive={hive} />
            ))}
            {displayed.length < PAGE_SIZE &&
              Array.from(
                { length: PAGE_SIZE - displayed.length },
                (_, i) => <HivePlaceholder key={`ph-${i}`} />,
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
