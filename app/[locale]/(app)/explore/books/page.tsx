import type { Metadata } from 'next';
import { BookOpen } from 'lucide-react';
import { searchExplorableBooksAction } from '@/lib/actions/explore.actions';
import { ExploreSearchBar } from '@/components/explore/explore-search-bar';
import { ExploreSidebar } from '@/components/explore/explore-sidebar';
import BookCard from '@/components/library/book-card';
import { GENRES, CATEGORIES } from '@/lib/config/constants';

export const metadata: Metadata = { title: 'Explore Books' };

export default async function ExploreBooksPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; genre?: string; category?: string }>;
}) {
  const { q = '', genre = '', category = '' } = await searchParams;
  const genres = genre ? genre.split(',').filter(Boolean) : [];
  const categories = category ? category.split(',').filter(Boolean) : [];

  const books = await searchExplorableBooksAction(q, genres, categories);

  const filterGroups = [
    { param: 'genre', label: 'Genre', options: GENRES },
    { param: 'category', label: 'Category', options: CATEGORIES },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold text-[#FFC300] uppercase tracking-[0.15em] mb-2">
          Explore
        </p>
        <h1 className="text-2xl font-bold text-white mainFont flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-[#FFC300]" />
          Books
        </h1>
  
      </div>

      <ExploreSearchBar placeholder="Search by title or author..." />

      <div className="flex flex-col lg:flex-row gap-6">
        <ExploreSidebar filterGroups={filterGroups} />

        <div className="flex-1 min-w-0">
          {books.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-xl border-2 border-dashed border-[#FFC300]/20 bg-[#FFC300]/5 flex items-center justify-center mb-8">
                <BookOpen className="w-8 h-8 text-[#FFC300]/20" />
              </div>
              <h2 className="text-2xl font-bold text-[#FFC300] mb-2 mainFont">No books found!</h2>
              <p className="text-white/80 max-w-sm">
                Try different keywords or clear the filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2  xl:grid-cols-3 gap-4">
              {books.map((book) => (
                <BookCard key={book.id} book={book} basePath="/books" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
