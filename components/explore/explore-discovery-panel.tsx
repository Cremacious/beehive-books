'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Star, Flame, TrendingUp } from 'lucide-react';
import BookCard from '@/components/library/book-card';
import type { Book } from '@/lib/types/books.types';

type Tab = 'new' | 'popular' | 'trending';

const TABS: { id: Tab; label: string; icon: React.ElementType; color: string; seeAllHref: string }[] = [
  { id: 'new', label: 'New', icon: Star, color: 'text-[#FFC300]', seeAllHref: '/explore/books?sort=newest' },
  { id: 'popular', label: 'Popular', icon: Flame, color: 'text-orange-400', seeAllHref: '/explore/books?sort=most_liked' },
  { id: 'trending', label: 'Trending', icon: TrendingUp, color: 'text-emerald-400', seeAllHref: '/explore/books?sort=most_liked&updated=month' },
];

export function ExploreDiscoveryPanel({
  newBooks,
  popular,
  trending,
}: {
  newBooks: Book[];
  popular: Book[];
  trending: Book[];
}) {
  const [activeTab, setActiveTab] = useState<Tab>('new');

  const books = activeTab === 'new' ? newBooks : activeTab === 'popular' ? popular : trending;
  const activeTabConfig = TABS.find((t) => t.id === activeTab)!;

  if (!newBooks.length && !popular.length && !trending.length) return null;

  return (
    <div className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-4 mb-2">
      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4">
        {TABS.map(({ id, label, icon: Icon, color }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#252525] border border-[#3a3a3a] text-white'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? color : ''}`} />
              {label}
            </button>
          );
        })}
        <Link
          href={activeTabConfig.seeAllHref}
          className="ml-auto text-xs font-medium text-yellow-500 hover:text-white transition-colors"
        >
          See all →
        </Link>
      </div>

      {/* Book scroll row */}
      {books.length > 0 ? (
        <div className="relative">
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {books.map((book) => (
              <div key={book.id} className="shrink-0 w-28 sm:w-32">
                <BookCard book={book} basePath="/books" />
              </div>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-linear-to-l from-[#1a1a1a] to-transparent" />
        </div>
      ) : (
        <p className="text-xs text-white/40 py-4 text-center">Nothing here yet — check back soon.</p>
      )}
    </div>
  );
}
