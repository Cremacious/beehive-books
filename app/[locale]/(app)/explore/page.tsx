import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getExplorableHubDataAction, getExplorableBooksByGenreAction, getFriendsReadingAction } from '@/lib/actions/explore.actions';
import { ExploreHub } from '@/components/explore/explore-hub';
import { ExploreSearchBar } from '@/components/explore/explore-search-bar';
import { GeneratedCover } from '@/components/library/generated-cover';
import type { Book } from '@/lib/types/books.types';

export const metadata: Metadata = {
  title: 'Explore',
  description: 'Discover books, authors, and reading groups from across the Beehive Books community.',
};

function FriendsReadingSection({ books }: { books: Book[] }) {
  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-white mainFont">Friends are Reading</h2>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 md:-mx-8 md:px-8 scrollbar-hide">
        {books.map((book) => (
          <Link
            key={book.id}
            href={`/books/${book.id}`}
            className="group shrink-0 w-40 sm:w-44 flex flex-col rounded-xl bg-[#1c1c1c] border border-[#2a2a2a] overflow-hidden hover:border-[#FFC300]/25 hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="relative w-full aspect-2/3 overflow-hidden">
              {book.coverUrl ? (
                <Image src={book.coverUrl} alt={book.title} fill className="object-cover" />
              ) : (
                <GeneratedCover title={book.title} author={book.author} bookId={book.id} />
              )}
            </div>
            <div className="px-3 pt-2.5 pb-3">
              <p className="text-sm font-semibold text-white line-clamp-2 group-hover:text-yellow-500 transition-colors mainFont min-h-10">
                {book.title}
              </p>
              <p className="text-xs text-white/80 truncate mt-0.5">{book.author}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default async function ExplorePage() {
  const [{ clubs, hives, prompts, readingLists }, { featured, genreRows }, friendsBooks] = await Promise.all([
    getExplorableHubDataAction(),
    getExplorableBooksByGenreAction(),
    getFriendsReadingAction(),
  ]);

  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <div className="relative px-4 md:px-8 pb-10 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" />
        <div className="max-w-6xl mx-auto relative">
          <h1 className="text-3xl md:text-4xl font-bold text-white mainFont mb-2">
            Discover Stories
          </h1>
          <p className="text-white/80 text-base max-w-lg mb-6">
            Books, writing communities, and creative challenges from the Beehive Books community.
          </p>
          <ExploreSearchBar placeholder="Search books, clubs, hives, prompts..." />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 md:px-8 pb-12 max-w-6xl mx-auto">
        {friendsBooks.length > 0 && <FriendsReadingSection books={friendsBooks} />}
        <ExploreHub
          featured={featured}
          genreRows={genreRows}
          clubs={clubs}
          hives={hives}
          prompts={prompts}
          readingLists={readingLists}
        />
      </div>
    </div>
  );
}
