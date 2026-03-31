import type { Metadata } from 'next';
import { BookOpen } from 'lucide-react';
import { searchExplorableBooksAction, getExplorableTagsAction } from '@/lib/actions/explore.actions';
import { ExploreSearchBar } from '@/components/explore/explore-search-bar';
import { ExploreSidebar } from '@/components/explore/explore-sidebar';
import { ExploreBooksGrid } from '@/components/explore/explore-books-grid';
import { ExploreGenreChips } from '@/components/explore/explore-genre-chips';
import { GENRES, CATEGORIES } from '@/lib/config/constants';

export const metadata: Metadata = { title: 'Explore Books' };

const STATUS_LABELS: Record<string, string> = {
  DRAFTING: 'In Progress',
  COMPLETE: 'Complete',
};

const LENGTH_LABELS: Record<string, string> = {
  short: 'Short (< 10k words)',
  novella: 'Novella (10k–40k)',
  novel: 'Novel (40k–100k)',
  epic: 'Epic (100k+)',
};

const UPDATED_LABELS: Record<string, string> = {
  week: 'This week',
  month: 'This month',
  year: 'This year',
};

export default async function ExploreBooksPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    genre?: string;
    category?: string;
    status?: string;
    length?: string;
    updated?: string;
  }>;
}) {
  const { q = '', genre = '', category = '', status = '', length = '', updated = '' } =
    await searchParams;

  const genres = genre ? genre.split(',').filter(Boolean) : [];
  const categories = category ? category.split(',').filter(Boolean) : [];
  const statuses = status ? status.split(',').filter(Boolean) : [];
  const lengths = length ? length.split(',').filter(Boolean) : [];
  const updatedSince = updated ? updated.split(',').filter(Boolean) : [];

  const [{ books, nextCursor }, tags] = await Promise.all([
    searchExplorableBooksAction(q, genres, categories, statuses, lengths, updatedSince),
    getExplorableTagsAction(),
  ]);

  const filterGroups = [
    { param: 'genre', label: 'Genre', options: GENRES },
    { param: 'category', label: 'Category', options: CATEGORIES },
    {
      param: 'status',
      label: 'Status',
      options: ['DRAFTING', 'COMPLETE'],
      labels: STATUS_LABELS,
    },
    {
      param: 'length',
      label: 'Length',
      options: ['short', 'novella', 'novel', 'epic'],
      labels: LENGTH_LABELS,
    },
    {
      param: 'updated',
      label: 'Recently Updated',
      options: ['week', 'month', 'year'],
      labels: UPDATED_LABELS,
    },
    ...(tags.length > 0 ? [{ param: 'tag', label: 'Tags', options: tags }] : []),
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
            key={`${q}|${genre}|${category}|${status}|${length}|${updated}`}
            initialBooks={books}
            initialNextCursor={nextCursor}
            query={q}
            genres={genres}
            categories={categories}
            statuses={statuses}
            lengths={lengths}
            updatedSince={updatedSince}
          />
        </div>
      </div>
    </div>
  );
}
