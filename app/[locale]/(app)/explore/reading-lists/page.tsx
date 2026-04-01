import type { Metadata } from 'next';
import Link from 'next/link';
import { List } from 'lucide-react';
import { searchExplorableReadingListsAction, getExplorableReadingListsPageRowsAction } from '@/lib/actions/explore.actions';
import { ExploreSearchBar } from '@/components/explore/explore-search-bar';
import { ExploreLoadMoreButton } from '@/components/explore/explore-load-more';
import { ExploreCommunityDiscoveryPanel } from '@/components/explore/explore-community-discovery-panel';
import ReadingListCard from '@/components/reading-lists/reading-list-card';

export const metadata: Metadata = { title: 'Explore Reading Lists' };

type ListSort = 'newest' | 'most_books';

export default async function ExploreReadingListsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; cursor?: string }>;
}) {
  const { q = '', sort = 'newest', cursor } = await searchParams;
  const sortParam = (['newest', 'most_books'] as ListSort[]).includes(sort as ListSort)
    ? (sort as ListSort)
    : 'newest';

  const hasActiveFilters = !!(q || cursor);

  const [{ readingLists, nextCursor }, curatedRows] = await Promise.all([
    searchExplorableReadingListsAction(q, sortParam, cursor),
    !hasActiveFilters ? getExplorableReadingListsPageRowsAction() : Promise.resolve({ newLists: [], popular: [] }),
  ]);

  function buildSortUrl(s: ListSort) {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    params.set('sort', s);
    return `?${params.toString()}`;
  }

  const sortOptions: { value: ListSort; label: string }[] = [
    { value: 'newest', label: 'Newest' },
    { value: 'most_books', label: 'Most Books' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white mainFont flex items-center gap-2">
        <List className="w-6 h-6 text-emerald-400" />
        Reading Lists
      </h1>

      <ExploreSearchBar placeholder="Search reading lists..." />

      {!hasActiveFilters && (
        <ExploreCommunityDiscoveryPanel
          newItems={curatedRows.newLists}
          popularItems={curatedRows.popular}
          popularLabel="Most Books"
          renderItem={(list) => <ReadingListCard key={list.id} list={list} />}
        />
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-white/80">Sort:</span>
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

      {readingLists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-xl border-2 border-dashed border-[#FFC300]/20 bg-[#FFC300]/5 flex items-center justify-center mb-8">
            <List className="w-8 h-8 text-[#FFC300]/20" />
          </div>
          <h2 className="text-2xl font-bold text-[#FFC300] mb-2 mainFont">No reading lists found!</h2>
          <p className="text-white/80 max-w-sm">Try different keywords.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {readingLists.map((list) => (
              <ReadingListCard key={list.id} list={list} />
            ))}
          </div>
          {nextCursor && <ExploreLoadMoreButton nextCursor={nextCursor} />}
        </>
      )}
    </div>
  );
}
