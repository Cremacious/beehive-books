'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal, Plus, BookOpen, Users } from 'lucide-react';
import ClubCard from './club-card';
import Pagination from '@/components/shared/pagination';
import type { ClubWithMembership, ClubRole } from '@/lib/types/club.types';

type SortOption = 'recent' | 'name' | 'members';
type RoleFilter = 'ALL' | ClubRole;

const ROLE_TABS: { value: RoleFilter; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'OWNER', label: 'Owner' },
  { value: 'MODERATOR', label: 'Moderator' },
  { value: 'MEMBER', label: 'Member' },
];

const PAGE_SIZE = 6;

function ClubPlaceholder() {
  return (
    <div className="rounded-xl border-2 border-dashed border-[#FFC300]/15 bg-[#1a1a1a] h-44 flex items-center justify-center">
      <BookOpen className="w-8 h-8 text-[#FFC300]/10" />
    </div>
  );
}

export default function MyClubs({ clubs }: { clubs: ClubWithMembership[] }) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortOption>('recent');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');
  const [page, setPage] = useState(1);

  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: clubs.length };
    for (const c of clubs) {
      if (c.myRole) {
        counts[c.myRole] = (counts[c.myRole] ?? 0) + 1;
      }
    }
    return counts;
  }, [clubs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = q
      ? clubs.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.description?.toLowerCase().includes(q) ||
            c.tags?.some((t) => t.toLowerCase().includes(q)),
        )
      : [...clubs];

    if (roleFilter !== 'ALL') {
      result = result.filter((c) => c.myRole === roleFilter);
    }

    if (sort === 'name') result.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'members')
      result.sort((a, b) => b.memberCount - a.memberCount);

    return result;
  }, [clubs, query, sort, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const displayed = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (q: string) => {
    setQuery(q);
    setPage(1);
  };
  const handleSort = (s: SortOption) => {
    setSort(s);
    setPage(1);
  };
  const handleRole = (r: RoleFilter) => {
    setRoleFilter(r);
    setPage(1);
  };

  if (clubs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-center">
        <div className="w-20 h-20 rounded-2xl bg-[#1c1c1c] border border-[#2a2a2a] flex items-center justify-center mb-4">
          <Users className="w-9 h-9 text-white/20" />
        </div>
        <h2 className="text-xl font-bold text-white mainFont mb-2">No book clubs yet</h2>
        <p className="text-sm text-white/80 max-w-sm leading-relaxed mb-6">
          Book clubs let you read and discuss books with a group. Create your own club to host discussions, or browse public clubs to find one that matches your reading taste.
        </p>
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <Link
            href="/clubs/create"
            className="px-5 py-2.5 rounded-full bg-[#FFC300] text-black text-sm font-bold hover:bg-[#FFD040] transition-colors"
          >
            Create a Club
          </Link>
          <Link
            href="/explore/clubs"
            className="px-5 py-2.5 rounded-full border border-[#2a2a2a] text-white/70 text-sm font-medium hover:text-white hover:border-white/30 transition-colors"
          >
            Explore Clubs
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
            placeholder="Search by name, description, or tag…"
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
              <option value="name">Name (A–Z)</option>
              <option value="members">Most Members</option>
            </select>
          </div>

          <Link
            href="/clubs/create"
            className="flex mainFont leading-none items-center gap-2 px-4 py-3 rounded-xl bg-[#FFC300] text-black text-sm font-semibold hover:bg-[#FFD700] transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            New Club
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
          <p className="text-sm text-white/50">No clubs match your filters.</p>
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
            {displayed.map((club) => (
              <ClubCard key={club.id} club={club} />
            ))}
            {displayed.length < PAGE_SIZE &&
              Array.from({ length: PAGE_SIZE - displayed.length }, (_, i) => (
                <ClubPlaceholder key={`ph-${i}`} />
              ))}
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
