'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal, BookOpen, Plus } from 'lucide-react';
import BookCard from '@/components/library/book-card';
import Pagination from '@/components/shared/pagination';
import type { Book } from '@/lib/types/books';

type SortOption = 'date-added' | 'title' | 'author';

export default function BookGrid({ books }: { books: Book[] }) {
  const [query, setQuery] = useState('');
  const [sort, setSort]   = useState<SortOption>('date-added');
  const [page, setPage]   = useState(1);

  const PAGE_SIZE = 12;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = q
      ? books.filter(b =>
          b.title.toLowerCase().includes(q)  ||
          b.author.toLowerCase().includes(q) ||
          b.genre.toLowerCase().includes(q)
        )
      : [...books];

    if (sort === 'title')  result.sort((a, b) => a.title.localeCompare(b.title));
    if (sort === 'author') result.sort((a, b) => a.author.localeCompare(b.author));

    return result;
  }, [books, query, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const displayed  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (q: string) => { setQuery(q); setPage(1); };
  const handleSort   = (s: SortOption) => { setSort(s); setPage(1); };

  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 rounded-2xl bg-[#252525] flex items-center justify-center mb-5">
          <BookOpen className="w-9 h-9 text-white/15" />
        </div>
        <h2 className="text-lg font-semibold text-white/55 mb-2">No books yet</h2>
        <p className="text-sm text-white/30 mb-6 max-w-xs">
          Start writing by creating your first book.
        </p>
        <Link
          href="/library/create"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FFC300] text-[#1a1a1a] text-sm font-semibold hover:bg-[#FFD740] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create your first book
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search by title, author, or genre…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#252525] border border-[#2a2a2a] text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#FFC300]/40 focus:ring-1 focus:ring-[#FFC300]/20 transition-all"
          />
        </div>
        <div className="relative">
          <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
          <select
            value={sort}
            onChange={e => handleSort(e.target.value as SortOption)}
            className="pl-9 pr-4 py-2.5 rounded-xl bg-[#252525] border border-[#2a2a2a] text-sm text-white/60 focus:outline-none focus:border-[#FFC300]/40 transition-all appearance-none cursor-pointer"
          >
            <option value="date-added">Date Added</option>
            <option value="title">Title (A–Z)</option>
            <option value="author">Author (A–Z)</option>
          </select>
        </div>
      </div>

      {displayed.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="w-8 h-8 text-white/10 mb-3" />
          <p className="text-sm text-white/40 mb-1">No results for &ldquo;{query}&rdquo;</p>
          <button
            onClick={() => setQuery('')}
            className="text-xs text-[#FFC300]/70 hover:text-[#FFC300] transition-colors mt-2"
          >
            Clear search
          </button>
        </div>
      )}

      {displayed.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayed.map(book => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            className="mt-10"
          />
        </>
      )}
    </>
  );
}
