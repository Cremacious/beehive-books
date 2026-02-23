import Link from 'next/link';
import { Plus, Search, BookOpen, SlidersHorizontal } from 'lucide-react';

// Placeholder data — replace with DB query
const PLACEHOLDER_BOOKS = [
  { id: '1', title: 'The Silent Garden',    author: 'Sarah Mitchell', genre: 'Literary Fiction', category: 'Fiction',     chapters: 12 },
  { id: '2', title: 'Starfall Chronicles',  author: 'Sarah Mitchell', genre: 'Science Fiction',  category: 'Fiction',     chapters: 7  },
  { id: '3', title: 'Letters Unsent',       author: 'Sarah Mitchell', genre: 'Romance',          category: 'Fiction',     chapters: 24 },
  { id: '4', title: 'The Amber Road',       author: 'Sarah Mitchell', genre: 'Fantasy',          category: 'Fiction',     chapters: 3  },
  { id: '5', title: 'Midnight Confessions', author: 'Sarah Mitchell', genre: 'Thriller',         category: 'Fiction',     chapters: 18 },
  { id: '6', title: 'Notes on Silence',     author: 'Sarah Mitchell', genre: 'Contemporary',     category: 'Non-Fiction', chapters: 9  },
];

const SORT_OPTIONS = ['Title', 'Author', 'Genre', 'Date Added'];

export default function LibraryPage() {
  const books = PLACEHOLDER_BOOKS;
  const isEmpty = books.length === 0;

  return (
    <div className="min-h-screen bg-[#1a1a1a] px-4 py-8 md:px-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">My Library</h1>
          <p className="mt-0.5 text-sm text-white/45">
            {books.length} book{books.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/library/create"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FFC300] text-[#1a1a1a] text-sm font-semibold hover:bg-[#FFD740] transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Book
        </Link>
      </div>

      {/* Search + sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by title, author, or genre…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#252525] border border-[#2a2a2a] text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#FFC300]/40 focus:ring-1 focus:ring-[#FFC300]/20 transition-all"
          />
        </div>
        <div className="relative">
          <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
          <select className="pl-9 pr-4 py-2.5 rounded-xl bg-[#252525] border border-[#2a2a2a] text-sm text-white/60 focus:outline-none focus:border-[#FFC300]/40 transition-all appearance-none cursor-pointer">
            <option value="">Sort by…</option>
            {SORT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>

      {/* Empty state */}
      {isEmpty && (
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
      )}

      {/* Book grid */}
      {!isEmpty && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {books.map(book => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              disabled
              className="px-4 py-2 rounded-xl text-sm text-white/30 bg-[#252525] border border-[#2a2a2a] disabled:opacity-40"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map(n => (
                <button
                  key={n}
                  className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${
                    n === 1
                      ? 'bg-[#FFC300] text-[#1a1a1a]'
                      : 'text-white/40 hover:text-white hover:bg-white/6'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <button className="px-4 py-2 rounded-xl text-sm text-white/60 bg-[#252525] border border-[#2a2a2a] hover:border-[#FFC300]/30 transition-colors">
              Next
            </button>
          </div>
        </>
      )}

    </div>
  );
}



type Book = typeof PLACEHOLDER_BOOKS[number];

function BookCard({ book }: { book: Book }) {
  return (
    <div className="group flex flex-col rounded-2xl bg-[#202020] border border-[#2a2a2a] overflow-hidden hover:border-[#FFC300]/20 transition-all duration-200">

      {/* Cover */}
      <Link href={`/library/${book.id}`} className="block">
        <div className="aspect-2/3 bg-[#252525] flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 p-4 text-center">
            <BookOpen className="w-8 h-8 text-white/10" />
            <span className="text-[10px] text-white/15 leading-tight line-clamp-3 font-medium">
              {book.title}
            </span>
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="flex flex-col flex-1 p-3 gap-2">
        <div>
          <h3 className="text-sm font-semibold text-white leading-tight line-clamp-2 group-hover:text-[#FFC300] transition-colors duration-200">
            {book.title}
          </h3>
          <p className="text-xs text-white/35 mt-0.5 truncate">{book.author}</p>
        </div>

        <span className="inline-block px-2 py-0.5 rounded-full bg-[#FFC300]/10 text-[#FFC300] text-[10px] font-medium self-start truncate max-w-full">
          {book.genre}
        </span>

        <p className="text-[11px] text-white/25">
          {book.chapters} chapter{book.chapters !== 1 ? 's' : ''}
        </p>

        <Link
          href={`/library/${book.id}`}
          className="mt-auto w-full text-center py-1.5 rounded-lg text-xs font-semibold text-white/50 border border-[#2e2e2e] hover:border-[#FFC300]/40 hover:text-[#FFC300] transition-all duration-200"
        >
          View Book
        </Link>
      </div>
    </div>
  );
}
