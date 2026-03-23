'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  SlidersHorizontal,
  BookOpen,
  LayoutGrid,
  List,
} from 'lucide-react';
import BookCard from '@/components/library/book-card';
import Pagination from '@/components/shared/pagination';
import type { Book } from '@/lib/types/books.types';

type SortOption = 'date-added' | 'title' | 'author';
type PrivacyFilter = 'ALL' | 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
type ViewMode = 'grid' | 'list';

const PRIVACY_TABS: { value: PrivacyFilter; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'PUBLIC', label: 'Public' },
  { value: 'FRIENDS', label: 'Friends' },
  { value: 'PRIVATE', label: 'Private' },
];

function BookListItem({ book }: { book: Book }) {
  return (
    <Link
      href={`/library/${book.id}`}
      className="group flex gap-4 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] p-4 hover:border-[#FFC300]/25 hover:shadow-lg hover:shadow-black/40 hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="relative w-16 shrink-0 aspect-2/3 rounded-md overflow-hidden">
        {book.coverUrl ? (
          <Image
            src={book.coverUrl}
            alt={book.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-[#1e1e1e] to-[#141414] flex items-center justify-center">
            <span className="text-xl font-bold text-white/20 mainFont">
              {book.title[0]?.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-between gap-1">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-white truncate group-hover:text-[#FFC300] transition-colors mainFont">
            {book.title}
          </h3>
          <p className="text-xs text-white/60 truncate">{book.author}</p>
        </div>

        {book.genre && (
          <div className="flex items-center">
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#2a2a2a] text-white/70 font-medium">
              {book.genre}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

const PLACEHOLDER_COUNT = 10;

function Placeholder() {
  return (
    <div className="flex flex-col rounded-xl border border-dashed border-[#2a2a2a] bg-[#141414] overflow-hidden opacity-40">
      <div className="relative w-full aspect-2/3" />
      <div className="px-3 py-3">
        <div className="h-3 rounded bg-[#2a2a2a] w-3/4 mb-2" />
        <div className="h-2 rounded bg-[#2a2a2a] w-1/2" />
      </div>
    </div>
  );
}

export default function BookGrid({ books }: { books: Book[] }) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortOption>('date-added');
  const [privacyFilter, setPrivacyFilter] = useState<PrivacyFilter>('ALL');
  const [view, setView] = useState<ViewMode>('grid');
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 8;

  const privacyCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: books.length };
    for (const b of books) {
      counts[b.privacy] = (counts[b.privacy] ?? 0) + 1;
    }
    return counts;
  }, [books]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = q
      ? books.filter(
          (b) =>
            b.title.toLowerCase().includes(q) ||
            b.author.toLowerCase().includes(q) ||
            b.genre.toLowerCase().includes(q),
        )
      : [...books];

    if (privacyFilter !== 'ALL') {
      result = result.filter((b) => b.privacy === privacyFilter);
    }

    if (sort === 'title') result.sort((a, b) => a.title.localeCompare(b.title));
    if (sort === 'author')
      result.sort((a, b) => a.author.localeCompare(b.author));

    return result;
  }, [books, query, sort, privacyFilter]);

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
  const handlePrivacy = (p: PrivacyFilter) => {
    setPrivacyFilter(p);
    setPage(1);
  };

  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-center">
        <div className="w-20 h-20 rounded-2xl bg-[#1c1c1c] border border-[#2a2a2a] flex items-center justify-center mb-4">
          <BookOpen className="w-9 h-9 text-white/20" />
        </div>
        <h2 className="text-xl font-bold text-white mainFont mb-2">No books yet</h2>
        <p className="text-sm text-white/80 mb-5 max-w-sm">
          Write your own book or discover stories from other authors on the Explore page.
        </p>
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <Link
            href="/library/create"
            className="px-5 py-2.5 rounded-full bg-[#FFC300] text-black text-sm font-bold hover:bg-[#FFD040] transition-colors mainFont"
          >
            Start writing
          </Link>
          <Link
            href="/explore"
            className="px-5 py-2.5 rounded-full border border-[#2a2a2a] text-white/70 text-sm font-medium hover:text-white hover:border-white/30 transition-colors"
          >
            Explore books
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
            placeholder="Search by title, author, or genre…"
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
              <option value="date-added">Date Added</option>
              <option value="title">Title (A–Z)</option>
              <option value="author">Author (A–Z)</option>
            </select>
          </div>

          <div className="flex rounded-xl border border-[#2a2a2a] overflow-hidden shrink-0">
            <button
              onClick={() => setView('grid')}
              title="Grid view"
              className={`px-4 py-3 flex items-center transition-colors ${
                view === 'grid'
                  ? 'bg-[#FFC300]/15 text-[#FFC300]'
                  : 'bg-[#252525] text-white hover:text-yellow-500'
              }`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setView('list')}
              title="List view"
              className={`px-4 py-3 flex items-center border-l border-[#2a2a2a] transition-colors ${
                view === 'list'
                  ? 'bg-[#FFC300]/15 text-[#FFC300]'
                  : 'bg-[#252525] text-white hover:text-yellow-500'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>

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
        <div className="flex flex-col items-center justify-center py-28 text-center">
          <div className="w-20 h-20 rounded-2xl bg-[#1c1c1c] border border-[#2a2a2a] flex items-center justify-center mb-4">
            <BookOpen className="w-9 h-9 text-white/20" />
          </div>
          <h2 className="text-xl font-bold text-white mainFont mb-2">
            {query ? `No results for "${query}"` : 'No books in this category'}
          </h2>
          <p className="text-sm text-white/80 mb-4 max-w-sm">
            {query
              ? 'Try a different search term or clear your filters.'
              : 'Try a different filter.'}
          </p>
          <button
            onClick={() => { setQuery(''); setPrivacyFilter('ALL'); }}
            className="text-sm text-[#FFC300]/70 hover:text-[#FFC300] transition-colors"
          >
            Clear filters
          </button>
        </div>
      )}

      {displayed.length > 0 && (
        <>
          {view === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {displayed.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
              {displayed.length < PLACEHOLDER_COUNT &&
                Array.from(
                  { length: PLACEHOLDER_COUNT - displayed.length },
                  (_, i) => <Placeholder key={`ph-${i}`} />,
                )}
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {displayed.map((book) => (
                <BookListItem key={book.id} book={book} />
              ))}
            </div>
          )}

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
