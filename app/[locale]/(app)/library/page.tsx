import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import BookGrid from '@/components/library/book-grid';
import { getUserBooksAction } from '@/lib/actions/book.actions';


export const metadata: Metadata = {
  title: 'My Library',
  description:
    'Your creative workspace — write, organize, and publish your books and chapters.',
};

export default async function LibraryPage() {
  const books = await getUserBooksAction();

  return (
    <div className="px-4 py-6 md:px-8 max-w-6xl mx-auto">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
      
          <h1 className="text-2xl font-bold text-white mainFont">My Library</h1>
        </div>
        <Link
          href="/library/create"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FFC300] text-black text-sm font-bold hover:bg-[#FFD040] transition-colors shrink-0 mainFont"
        >
          <Plus className="w-4 h-4" />
          New Book
        </Link>
      </div>
      <BookGrid books={books} />
    </div>
  );
}
