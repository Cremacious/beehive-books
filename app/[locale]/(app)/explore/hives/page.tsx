import type { Metadata } from 'next';
import Link from 'next/link';
import { Hexagon } from 'lucide-react';
import { searchExplorableHivesAction, getExplorableHivesPageRowsAction } from '@/lib/actions/explore.actions';
import { ExploreSearchBar } from '@/components/explore/explore-search-bar';
import { ExploreSidebar } from '@/components/explore/explore-sidebar';
import { ExploreLoadMoreButton } from '@/components/explore/explore-load-more';
import { ExploreCommunityDiscoveryPanel } from '@/components/explore/explore-community-discovery-panel';
import HiveCard from '@/components/hive/hive-card';
import { GENRES } from '@/lib/config/constants';

export const metadata: Metadata = { title: 'Explore Hives' };

type HiveSort = 'newest' | 'most_liked' | 'most_members';

export default async function ExploreHivesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; genre?: string; tag?: string; sort?: string; cursor?: string }>;
}) {
  const { q = '', genre = '', tag = '', sort = 'most_members', cursor } = await searchParams;
  const genres = genre ? genre.split(',').filter(Boolean) : [];
  const tags = tag ? tag.split(',').filter(Boolean) : [];
  const sortParam = (['newest', 'most_liked', 'most_members'] as HiveSort[]).includes(sort as HiveSort)
    ? (sort as HiveSort)
    : 'most_members';

  const hasActiveFilters = !!(q || genre || tag || cursor);

  const [{ hives, nextCursor }, curatedRows] = await Promise.all([
    searchExplorableHivesAction(q, genres, tags, sortParam, cursor),
    !hasActiveFilters ? getExplorableHivesPageRowsAction() : Promise.resolve({ newHives: [], popular: [] }),
  ]);

  const filterGroups = [{ param: 'genre', label: 'Genre', options: GENRES }];

  function buildSortUrl(s: HiveSort) {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (genre) params.set('genre', genre);
    if (tag) params.set('tag', tag);
    params.set('sort', s);
    return `?${params.toString()}`;
  }

  const sortOptions: { value: HiveSort; label: string }[] = [
    { value: 'most_members', label: 'Most Members' },
    { value: 'newest', label: 'Newest' },
    { value: 'most_liked', label: 'Most Liked' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white mainFont flex items-center gap-2">
        <Hexagon className="w-6 h-6 text-[#FFC300]" />
        Writing Hives
      </h1>

      <ExploreSearchBar placeholder="Search hives by name, genre, or tags..." />

      {!hasActiveFilters && (
        <ExploreCommunityDiscoveryPanel
          newItems={curatedRows.newHives}
          popularItems={curatedRows.popular}
          popularLabel="Most Members"
          renderItem={(hive) => <HiveCard key={hive.id} hive={hive} />}
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

      <div className="flex flex-col lg:flex-row gap-6">
        <ExploreSidebar filterGroups={filterGroups} />

        <div className="flex-1 min-w-0">
          {hives.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-xl border-2 border-dashed border-[#FFC300]/20 bg-[#FFC300]/5 flex items-center justify-center mb-8">
                <Hexagon className="w-8 h-8 text-[#FFC300]/20" />
              </div>
              <h2 className="text-2xl font-bold text-[#FFC300] mb-2 mainFont">No hives found!</h2>
              <p className="text-white/80 max-w-sm">Try different keywords or clear the filters.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {hives.map((hive) => (
                  <HiveCard key={hive.id} hive={hive} />
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
