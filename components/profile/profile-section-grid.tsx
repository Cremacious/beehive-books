'use client';

import React, { useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  icon: ReactNode;
  title: string;
  count: number;
  limit: number;
  gridClassName: string;
  placeholder?: ReactNode;
 
  searchTexts: string[];

  statusValues?: string[];

  statusLabels?: Record<string, string>;
  children: ReactNode;
}

export function ProfileSectionGrid({
  icon,
  title,
  count,
  limit,
  gridClassName,
  placeholder,
  searchTexts,
  statusValues,
  statusLabels,
  children,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const all = React.Children.toArray(children);

  
  const uniqueStatuses = statusValues
    ? ['ALL', ...Array.from(new Set(statusValues))]
    : [];

  const filteredItems = useMemo(() => {
    const q = query.toLowerCase().trim();
    return all.filter((_, i) => {
      const textMatch = !q || searchTexts[i]?.toLowerCase().includes(q);
      const statusMatch =
        !statusValues || statusFilter === 'ALL' || statusValues[i] === statusFilter;
      return textMatch && statusMatch;
    });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, statusFilter, searchTexts, statusValues]);

  if (!expanded) {
    const realSlice = all.slice(0, limit);
    const visible: ReactNode[] = [...realSlice];
    if (placeholder) {
      const needed = Math.max(0, limit - realSlice.length);
      for (let i = 0; i < needed; i++) {
        visible.push(
          <React.Fragment key={`__ph_${i}`}>{placeholder}</React.Fragment>,
        );
      }
    }

    return (
      <section className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            {icon}
            <h2 className="text-base font-semibold text-white">{title}</h2>
            {count > 0 && <span className="text-sm text-white/70">({count})</span>}
          </div>
          {count > limit && (
            <Button variant="outline" size="sm" onClick={() => setExpanded(true)}>
              View all ({count})
            </Button>
          )}
        </div>
        <div className={gridClassName}>{visible}</div>
      </section>
    );
  }

 
  const collapse = () => {
    setExpanded(false);
    setQuery('');
    setStatusFilter('ALL');
  };

  return (
    <section className="mb-10">
    
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <span className="text-sm text-white/70">({count})</span>
        </div>
        <Button variant="outline" size="sm" onClick={collapse}>
          Show less
        </Button>
      </div>


      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${title.toLowerCase()}…`}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#252525] border border-[#2a2a2a] text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#FFC300]/40 focus:ring-1 focus:ring-[#FFC300]/20 transition-all"
          />
        </div>

        {uniqueStatuses.length > 1 && (
          <div className="flex gap-2 shrink-0">
            {uniqueStatuses.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap border transition-all ${
                  statusFilter === status
                    ? 'bg-[#FFC300] text-black border-[#FFC300]'
                    : 'bg-[#252525] border-[#2a2a2a] text-white/70 hover:text-white hover:border-[#3a3a3a]'
                }`}
              >
                {status === 'ALL' ? 'All' : (statusLabels?.[status] ?? status)}
              </button>
            ))}
          </div>
        )}
      </div>

      {filteredItems.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#2a2a2a] bg-[#1a1a1a]/40 py-10 text-center">
          <p className="text-sm text-white/40">No results</p>
        </div>
      ) : (
        <div className={gridClassName}>{filteredItems}</div>
      )}
    </section>
  );
}
