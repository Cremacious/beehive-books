import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, Star, Flame, TrendingUp, ArrowRight } from 'lucide-react';
import { searchExplorableBooksAction, getExplorableTagsAction, getExplorableBooksPageRowsAction } from '@/lib/actions/explore.actions';
import { ExploreSearchBar } from '@/components/explore/explore-search-bar';
import { ExploreSidebar } from '@/components/explore/explore-sidebar';
import { ExploreBooksGrid } from '@/components/explore/explore-books-grid';
import { ExploreGenreChips } from '@/components/explore/explore-genre-chips';
import { ExploreLoadMoreButton } from '@/components/explore/explore-load-more';
import BookCard from '@/components/library/book-card';
import { GENRES, CATEGORIES } from '@/lib/config/constants';
import type { Book } from '@/lib/types/books.types';

export const metadata: Metadata = { title: 'Explore Books' };

type BookSort = 'newest' | 'most_liked' | 'most_chapters';

export default async function ExploreBooksPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    genre?: string;
    category?: string;
    tag?: string;
    status?: string;
    length?: string;
    comments?: string;
    updated?: string;
    sort?: string;
    cursor?: string;
  }>;
}) {
  const {
    q = '',
    genre = '',
    category = '',
    tag = '',
    status = '',
    length = '',
    comments = '',
    updated = '',
    sort = 'newest',
    cursor,
  } = await searchParams;

  const genres = genre ? genre.split(',').filter(Boolean) : [];
  const categories = category ? category.split(',').filter(Boolean) : [];
  const tags = tag ? tag.split(',').filter(Boolean) : [];
  const draftStatuses = status ? status.split(',').filter(Boolean) : [];
  const hasComments = comments === 'true';
  const sortParam = (['newest', 'most_liked', 'most_chapters'] as BookSort[]).includes(sort as BookSort)
    ? (sort as BookSort)
    : 'newest';

  const hasActiveFilters = !!(q || genre || category || tag || status || length || comments || updated);

  const [{ books, nextCursor }, explorableTags, curatedRows] = await Promise.all([
    searchExplorableBooksAction(q, genres, categories, tags, draftStatuses, length, hasComments, updated, sortParam, cursor),
    getExplorableTagsAction(),
    !hasActiveFilters ? getExplorableBooksPageRowsAction() : Promise.resolve({ newBooks: [], popular: [], trending: [] }),
  ]);

  const filterGroups = [
    { param: 'genre', label: 'Genre', options: GENRES },
    { param: 'category', label: 'Category', options: CATEGORIES },
    {
      param: 'status',
      label: 'Status',
      options: ['DRAFTING', 'COMPLETE', 'ON_HIATUS'],
      labels: { DRAFTING: 'In Progress', COMPLETE: 'Complete', ON_HIATUS: 'On Hiatus' } as Record<string, string>,
    },
    {
      param: 'length',
      label: 'Length',
      options: ['short', 'novella', 'novel', 'epic'],
      labels: { short: 'Short (< 10k words)', novella: 'Novella (10k–40k)', novel: 'Novel (40k–100k)', epic: 'Epic (100k+)' } as Record<string, string>,
    },
    {
      param: 'updated',
      label: 'Recently Updated',
      options: ['week', 'month', 'year'],
      labels: { week: 'This week', month: 'This month', year: 'This year' } as Record<string, string>,
    },
    {
      param: 'tag',
      label: 'Tags',
      options: explorableTags,
    },
  ];

  function buildSortUrl(s: BookSort) {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (genre) params.set('genre', genre);
    if (category) params.set('category', category);
    if (tag) params.set('tag', tag);
    if (status) params.set('status', status);
    if (length) params.set('length', length);
    if (comments) params.set('comments', comments);
    if (updated) params.set('updated', updated);
    params.set('sort', s);
    return `?${params.toString()}`;
  }

  const sortOptions: { value: BookSort; label: string }[] = [
    { value: 'newest', label: 'Newest' },
    { value: 'most_liked', label: 'Most Liked' },
    { value: 'most_chapters', label: 'Most Chapters' },
  ];

  function BookScrollRow({
    title,
    icon,
    books: rowBooks,
    seeAllHref,
  }: {
    title: string;
    icon: React.ReactNode;
    books: Book[];
    seeAllHref: string;
  }) {
    if (!rowBooks.length) return null;
    return (
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-white mainFont flex items-center gap-2">
            {icon}
            {title}
          </h2>
          <Link href={seeAllHref} className="flex items-center gap-1 text-xs font-medium text-yellow-500 hover:text-white transition-colors">
            See all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="relative">
          <div className="flex gap-3 overflow-x-auto pb-3 -mx-4 px-4 md:-mx-8 md:px-8 scrollbar-hide">
            {rowBooks.map((book) => (
              <div key={book.id} className="shrink-0 w-32 sm:w-36">
                <BookCard book={book} basePath="/books" />
              </div>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-linear-to-l from-[#1e1e1e] to-transparent" />
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mainFont flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-[#FFC300]" />
          Books
        </h1>
      </div>

      {!hasActiveFilters && (
        <>
          <BookScrollRow
            title="New"
            icon={<Star className="w-4 h-4 text-[#FFC300]" />}
            books={curatedRows.newBooks}
            seeAllHref="/explore/books?sort=newest"
          />
          <BookScrollRow
            title="Popular"
            icon={<Flame className="w-4 h-4 text-orange-400" />}
            books={curatedRows.popular}
            seeAllHref="/explore/books?sort=most_liked"
          />
          <BookScrollRow
            title="Trending"
            icon={<TrendingUp className="w-4 h-4 text-emerald-400" />}
            books={curatedRows.trending}
            seeAllHref="/explore/books?sort=most_liked&updated=month"
          />
        </>
      )}

      <ExploreSearchBar placeholder="Search by title, author, or description..." />

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-white/80">Sort:</span>
        {sortOptions.map((s) => (
          <Link
            key={s.value}
            href={buildSortUrl(s.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              sortParam === s.value
                ? 'bg-[#FFC300] text-black'
                : 'bg-[#1e1e1e] border border-[#2a2a2a] text-white/80 hover:text-white'
            }`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      <ExploreGenreChips genres={GENRES} />

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
