import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { searchExplorableBooksAction, getExplorableTagsAction } from '@/lib/actions/explore.actions';
import { ExploreSearchBar } from '@/components/explore/explore-search-bar';
import { ExploreSidebar } from '@/components/explore/explore-sidebar';
import { ExploreLoadMoreButton } from '@/components/explore/explore-load-more';
import BookCard from '@/components/library/book-card';
import { GENRES, CATEGORIES } from '@/lib/config/constants';

export const metadata: Metadata = { title: 'Explore Books' };

type BookSort = 'newest' | 'most_liked' | 'most_chapters';

export default async function ExploreBooksPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; genre?: string; category?: string; tag?: string; sort?: string; cursor?: string }>;
}) {
  const { q = '', genre = '', category = '', tag = '', sort = 'newest', cursor } = await searchParams;
  const genres = genre ? genre.split(',').filter(Boolean) : [];
  const categories = category ? category.split(',').filter(Boolean) : [];
  const tags = tag ? tag.split(',').filter(Boolean) : [];
  const sortParam = (['newest', 'most_liked', 'most_chapters'] as BookSort[]).includes(sort as BookSort)
    ? (sort as BookSort)
    : 'newest';

  const [{ books, nextCursor }, explorableTags] = await Promise.all([
    searchExplorableBooksAction(q, genres, categories, tags, sortParam, cursor),
    getExplorableTagsAction(),
  ]);

  const filterGroups = [
    { param: 'genre', label: 'Genre', options: GENRES },
    { param: 'category', label: 'Category', options: CATEGORIES },
    ...(explorableTags.length > 0 ? [{ param: 'tag', label: 'Tags', options: explorableTags }] : []),
  ];

  function buildSortUrl(s: BookSort) {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (genre) params.set('genre', genre);
    if (category) params.set('category', category);
    if (tag) params.set('tag', tag);
    params.set('sort', s);
    return `?${params.toString()}`;
  }

  const sortOptions: { value: BookSort; label: string }[] = [
    { value: 'newest', label: 'Newest' },
    { value: 'most_liked', label: 'Most Liked' },
    { value: 'most_chapters', label: 'Most Chapters' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mainFont flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-[#FFC300]" />
          Books
        </h1>
      </div>

      <ExploreSearchBar placeholder="Search by title, author, or description..." />

      {!q && (
        <div className="flex items-center gap-2 flex-wrap">
          {sortOptions.map(({ value, label }) => (
            <Link
              key={value}
              href={buildSortUrl(value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                sortParam === value
                  ? 'bg-[#FFC300] text-black'
                  : 'bg-[#1e1e1e] border border-[#2a2a2a] text-white/80 hover:text-white'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      )}

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
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                {books.map((book) => (
                  <BookCard key={book.id} book={book} basePath="/books" />
                ))}
              </div>
              {nextCursor && <ExploreLoadMoreButton nextCursor={nextCursor} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
