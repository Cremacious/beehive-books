import type { Metadata } from 'next';
import Link from 'next/link';
import { Users } from 'lucide-react';
import { searchExplorableClubsAction, getExplorableClubsPageRowsAction } from '@/lib/actions/explore.actions';
import { ExploreSearchBar } from '@/components/explore/explore-search-bar';
import { ExploreLoadMoreButton } from '@/components/explore/explore-load-more';
import { ExploreCommunityDiscoveryPanel } from '@/components/explore/explore-community-discovery-panel';
import ClubCard from '@/components/clubs/club-card';

export const metadata: Metadata = { title: 'Explore Clubs' };

type ClubSort = 'newest' | 'most_liked' | 'most_members';

export default async function ExploreClubsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string; sort?: string; cursor?: string }>;
}) {
  const { q = '', tag = '', sort = 'most_members', cursor } = await searchParams;
  const tags = tag ? tag.split(',').filter(Boolean) : [];
  const sortParam = (['newest', 'most_liked', 'most_members'] as ClubSort[]).includes(sort as ClubSort)
    ? (sort as ClubSort)
    : 'most_members';

  const hasActiveFilters = !!(q || tag || cursor);

  const [{ clubs, nextCursor }, curatedRows] = await Promise.all([
    searchExplorableClubsAction(q, tags, sortParam, cursor),
    !hasActiveFilters ? getExplorableClubsPageRowsAction() : Promise.resolve({ newClubs: [], popular: [] }),
  ]);

  function buildSortUrl(s: ClubSort) {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (tag) params.set('tag', tag);
    params.set('sort', s);
    return `?${params.toString()}`;
  }

  const sortOptions: { value: ClubSort; label: string }[] = [
    { value: 'most_members', label: 'Most Members' },
    { value: 'newest', label: 'Newest' },
    { value: 'most_liked', label: 'Most Liked' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white mainFont flex items-center gap-2">
        <Users className="w-6 h-6 text-orange-400" />
        Book Clubs
      </h1>

      <ExploreSearchBar placeholder="Search clubs by name, description, or tag..." />

      {!hasActiveFilters && (
        <ExploreCommunityDiscoveryPanel
          newItems={curatedRows.newClubs}
          popularItems={curatedRows.popular}
          popularLabel="Most Members"
          renderItem={(club) => <ClubCard key={club.id} club={club} />}
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

      {clubs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-xl border-2 border-dashed border-[#FFC300]/20 bg-[#FFC300]/5 flex items-center justify-center mb-8">
            <Users className="w-8 h-8 text-[#FFC300]/20" />
          </div>
          <h2 className="text-2xl font-bold text-[#FFC300] mb-2 mainFont">No clubs found!</h2>
          <p className="text-white/80 max-w-sm">Try different keywords.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {clubs.map((club) => (
              <ClubCard key={club.id} club={club} />
            ))}
          </div>
          {nextCursor && <ExploreLoadMoreButton nextCursor={nextCursor} />}
        </>
      )}
    </div>
  );
}
