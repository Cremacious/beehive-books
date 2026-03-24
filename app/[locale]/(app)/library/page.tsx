import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import BookGrid from '@/components/library/book-grid';
import FavouritesGrid from '@/components/library/favourites-grid';
import { getUserBooksAction, getLikedBooksAction } from '@/lib/actions/book.actions';
import { BadgeCount } from '@/components/ui/badge-count';

export const metadata: Metadata = {
  title: 'My Library',
  description:
    'Your creative workspace — write, organize, and publish your books and chapters.',
};

type Props = { searchParams: Promise<{ tab?: string }> };

export default async function LibraryPage({ searchParams }: Props) {
  const { tab = 'my-books' } = await searchParams;

  const [books, likedBooks] = await Promise.all([
    getUserBooksAction(),
    getLikedBooksAction(),
  ]);

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

      <div className="flex items-center gap-1 mb-8 p-1 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] w-fit">
        <TabLink href="/library?tab=my-books" active={tab === 'my-books'} label="My Books" count={books.length} />
        <TabLink href="/library?tab=favourites" active={tab === 'favourites'} label="Favourites" count={likedBooks.length} />
      </div>

      {tab === 'my-books' && <BookGrid books={books} />}
      {tab === 'favourites' && <FavouritesGrid books={likedBooks} />}
    </div>
  );
}

function TabLink({ href, active, label, count }: { href: string; active: boolean; label: string; count?: number }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
        active ? 'bg-[#FFC300] text-black' : 'text-white hover:text-white hover:bg-white/5'
      }`}
    >
      {label}
      {count !== undefined && <BadgeCount count={count} variant={active ? 'active' : 'default'} />}
    </Link>
  );
}
