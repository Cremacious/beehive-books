'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { List } from 'lucide-react';

interface FeaturingList {
  id: string;
  title: string;
  curatorUsername: string | null;
  bookCount: number;
}

interface FeaturingListsProps {
  featuringLists: FeaturingList[];
  count: number;
}

export function FeaturingLists({ featuringLists, count }: FeaturingListsProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  if (featuringLists.length === 0) return null;

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors"
      >
        <List className="w-4 h-4 text-[#FFC300]/70" />
        <span>
          In {count} list{count !== 1 ? 's' : ''}
        </span>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-72 rounded-xl bg-[#252525] border border-[#2a2a2a] shadow-2xl overflow-hidden">
          {featuringLists.map((list) => (
            <Link
              key={list.id}
              href={`/reading-lists/${list.id}`}
              onClick={() => setOpen(false)}
              className="flex flex-col px-4 py-3 hover:bg-white/5 transition-colors"
            >
              <span className="text-sm text-white truncate">{list.title}</span>
              {list.curatorUsername && (
                <span className="text-xs text-white/80 truncate">
                  by {list.curatorUsername}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
