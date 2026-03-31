'use client';

import { useState, useTransition } from 'react';
import { Loader2, BookOpen } from 'lucide-react';
import { searchExplorableBooksAction } from '@/lib/actions/explore.actions';
import BookCard from '@/components/library/book-card';
import type { Book } from '@/lib/types/books.types';

interface ExploreBooksGridProps {
  initialBooks: Book[];
  initialNextCursor: string | null;
  query: string;
  genres: string[];
  categories: string[];
  statuses: string[];
  lengths: string[];
  updatedSince: string[];
}

export function ExploreBooksGrid({
  initialBooks,
  initialNextCursor,
  query,
  genres,
  categories,
  statuses,
  lengths,
  updatedSince,
}: ExploreBooksGridProps) {
  const [allBooks, setAllBooks] = useState<Book[]>(initialBooks);
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
  const [hasLoadedMore, setHasLoadedMore] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleLoadMore() {
    if (!nextCursor) return;
    startTransition(async () => {
      const result = await searchExplorableBooksAction(
        query,
        genres,
        categories,
        statuses,
        lengths,
        updatedSince,
        nextCursor,
      );
      setAllBooks((prev) => [...prev, ...result.books]);
      setNextCursor(result.nextCursor);
      setHasLoadedMore(true);
    });
  }

  if (allBooks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-xl border-2 border-dashed border-[#FFC300]/20 bg-[#FFC300]/5 flex items-center justify-center mb-8">
          <BookOpen className="w-8 h-8 text-[#FFC300]/20" />
        </div>
        <h2 className="text-2xl font-bold text-yellow-500 mb-2 mainFont">No books found!</h2>
        <p className="text-white/80 max-w-sm">Try different keywords or clear the filters.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
        {allBooks.map((book) => (
          <BookCard key={book.id} book={book} basePath="/books" />
        ))}
      </div>

      <div className="flex justify-center mt-8">
        {nextCursor ? (
          <button
            onClick={handleLoadMore}
            disabled={isPending}
            className="flex items-center gap-2 rounded-full border border-[#2a2a2a] bg-[#1e1e1e] px-6 py-2.5 text-sm font-medium text-white/80 hover:text-white hover:border-[#444] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load more'
            )}
          </button>
        ) : hasLoadedMore ? (
          <p className="text-sm text-white/80">No more books</p>
        ) : null}
      </div>
    </>
  );
}
