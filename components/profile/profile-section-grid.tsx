'use client';

import React, { useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  title: string;
  count: number;
  limit: number;
  gridClassName: string;
  placeholder?: ReactNode;
  statusValues?: string[];
  statusLabels?: Record<string, string>;
  layout?: 'grid' | 'scroll';
  children: ReactNode;
}

export function ProfileSectionGrid({
  title,
  count,
  limit,
  gridClassName,
  placeholder,
  statusValues,
  statusLabels,
  layout = 'grid',
  children,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const all = React.Children.toArray(children);

  const uniqueStatuses = statusValues
    ? ['ALL', ...Array.from(new Set(statusValues))]
    : [];

  const filteredItems = useMemo(() => {
    return all.filter((_, i) => {
      const statusMatch =
        !statusValues || statusFilter === 'ALL' || statusValues[i] === statusFilter;
      return statusMatch;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, statusValues]);

  if (!expanded) {
    const realSlice = all.slice(0, limit);
    const displayItems: ReactNode[] = [...realSlice];
    if (placeholder) {
      const needed = Math.max(0, limit - realSlice.length);
      for (let i = 0; i < needed; i++) {
        displayItems.push(
          <React.Fragment key={`__ph_${i}`}>{placeholder}</React.Fragment>,
        );
      }
    }

    return (
      <section className="mb-10">
        {/* Section title row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white mainFont">{title}</h2>
            {count > 0 && <span className="text-sm text-white/40">({count})</span>}
          </div>
          {count > limit && (
            <Button variant="outline" size="sm" onClick={() => setExpanded(true)}>
              View all ({count})
            </Button>
          )}
        </div>

        {/* Content */}
        {layout === 'scroll' ? (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:-mx-8 md:px-8">
            {displayItems.map((item, i) => (
              <div key={i} className="shrink-0 w-40 sm:w-45 flex flex-col">
                {item}
              </div>
            ))}
          </div>
        ) : (
          <div className={gridClassName}>{displayItems}</div>
        )}
      </section>
    );
  }

  const collapse = () => {
    setExpanded(false);
    setStatusFilter('ALL');
  };

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-white mainFont">{title}</h2>
          <span className="text-sm text-white/40">({count})</span>
        </div>
        <Button variant="outline" size="sm" onClick={collapse}>
          Show less
        </Button>
      </div>

      {uniqueStatuses.length > 1 && (
        <div className="flex gap-2 mb-5">
          {uniqueStatuses.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap border transition-all ${
                statusFilter === status
                  ? 'bg-[#FFC300] text-black border-[#FFC300]'
                  : 'bg-[#252525] border-[#2a2a2a] text-white/80 hover:text-white hover:border-[#2a2a2a]'
              }`}
            >
              {status === 'ALL' ? 'All' : (statusLabels?.[status] ?? status)}
            </button>
          ))}
        </div>
      )}

      {filteredItems.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#2a2a2a] bg-[#1a1a1a]/40 py-10 text-center">
          <p className="text-sm text-white/50">No results</p>
        </div>
      ) : (
        <div className={gridClassName}>{filteredItems}</div>
      )}
    </section>
  );
}
