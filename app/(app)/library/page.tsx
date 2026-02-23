import Link from 'next/link';
import { Plus } from 'lucide-react';
import { getBooks } from '@/lib/sample/books.sample';
import BookGrid from '@/components/library/book-grid';

export default function LibraryPage() {
  const books = getBooks();

  return (
    <div className="px-4 py-8 md:px-8">

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

      <BookGrid books={books} />

    </div>
  );
}
