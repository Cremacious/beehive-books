import type { Metadata } from 'next';
import { BookOpen } from 'lucide-react';
import { searchExplorableBooksAction } from '@/lib/actions/explore.actions';
import { ExploreSearchBar } from '@/components/explore/explore-search-bar';
import { ExploreSidebar } from '@/components/explore/explore-sidebar';
import { ExploreBooksGrid } from '@/components/explore/explore-books-grid';
import { ExploreGenreChips } from '@/components/explore/explore-genre-chips';
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

  const { books, nextCursor } = await searchExplorableBooksAction(q, genres, categories);

  const filterGroups = [
    { param: 'genre', label: 'Genre', options: GENRES },
    { param: 'category', label: 'Category', options: CATEGORIES },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mainFont flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-[#FFC300]" />
          Books
        </h1>
      </div>

      <ExploreSearchBar placeholder="Search by title or author..." />

      <ExploreGenreChips genres={GENRES} />

      <div className="flex flex-col lg:flex-row gap-6">
        <ExploreSidebar filterGroups={filterGroups} />

        <div className="flex-1 min-w-0">
          <ExploreBooksGrid
            key={`${q}|${genre}|${category}`}
            initialBooks={books}
            initialNextCursor={nextCursor}
            query={q}
            genres={genres}
            categories={categories}
          />
        </div>
      </div>
    </div>
  );
}
