'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Heart, LayoutGrid, List } from 'lucide-react';
import Image from 'next/image';
import Pagination from '@/components/shared/pagination';
import type { Book } from '@/lib/types/books.types';

type ViewMode = 'grid' | 'list';

function FavouriteCard({ book }: { book: Book }) {
  return (
    <Link
      href={`/books/${book.id}`}
      className="group flex flex-col rounded-xl bg-[#1c1c1c] border border-[#2a2a2a] overflow-hidden hover:border-[#FFC300]/25 hover:shadow-lg hover:shadow-black/40 hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="relative w-full aspect-2/3 overflow-hidden">
        {book.coverUrl ? (
          <Image src={book.coverUrl} alt={book.title} fill className="object-cover" />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-[#1e1e1e] to-[#141414] flex items-center justify-center">
            <span className="text-4xl font-bold text-white/20 mainFont">
              {book.title[0]?.toUpperCase()}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-col flex-1 px-3 pt-2.5 pb-3">
        <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-[#FFC300] transition-colors mainFont">
          {book.title}
        </h3>
        <p className="text-xs text-white/60 truncate mt-0.5">{book.author}</p>
        {book.genre && (
          <span className="mt-1.5 self-start text-xs px-2 py-0.5 rounded-full bg-[#2a2a2a] text-white/70 font-medium truncate max-w-full">
            {book.genre}
          </span>
        )}
      </div>
    </Link>
  );
}

function FavouriteListItem({ book }: { book: Book }) {
  return (
    <Link
      href={`/books/${book.id}`}
      className="group flex gap-4 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] p-4 hover:border-[#FFC300]/25 hover:shadow-lg hover:shadow-black/40 hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="relative w-16 shrink-0 aspect-2/3 rounded-md overflow-hidden">
        {book.coverUrl ? (
          <Image src={book.coverUrl} alt={book.title} fill className="object-cover" />
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

const PAGE_SIZE = 8;

export default function FavouritesGrid({ books }: { books: Book[] }) {
  const [query, setQuery] = useState('');
  const [view, setView] = useState<ViewMode>('grid');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return books;
    return books.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.genre.toLowerCase().includes(q),
    );
  }, [books, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const displayed = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (q: string) => {
    setQuery(q);
    setPage(1);
  };

  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-center">
        <div className="w-20 h-20 rounded-2xl bg-[#1c1c1c] border border-[#2a2a2a] flex items-center justify-center mb-4">
          <Heart className="w-9 h-9 text-white/20" />
        </div>
        <h2 className="text-xl font-bold text-white mainFont mb-2">No favourites yet</h2>
        <p className="text-sm text-white/80 mb-5 max-w-sm">
          Like books you enjoy while reading and they will show up here.
        </p>
        <Link
          href="/explore"
          className="px-5 py-2.5 rounded-full bg-[#FFC300] text-black text-sm font-bold transition-all duration-100 hover:bg-[#FFD040] active:scale-95 mainFont"
        >
          Explore books
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
            placeholder="Search favourites by title, author, or genre..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#252525] border border-[#2a2a2a] text-base text-white placeholder-white/30 focus:outline-none focus:border-[#FFC300]/40 focus:ring-1 focus:ring-[#FFC300]/20 transition-all"
          />
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

      {displayed.length === 0 && query && (
        <div className="flex flex-col items-center justify-center py-28 text-center">
          <h2 className="text-xl font-bold text-white mainFont mb-2">
            No results for &quot;{query}&quot;
          </h2>
          <button
            onClick={() => handleSearch('')}
            className="text-sm text-[#FFC300]/70 hover:text-[#FFC300] transition-colors mt-2"
          >
            Clear search
          </button>
        </div>
      )}

      {displayed.length > 0 && (
        <>
          {view === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {displayed.map((book) => (
                <FavouriteCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {displayed.map((book) => (
                <FavouriteListItem key={book.id} book={book} />
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
