import type { Metadata } from 'next';
import { Users } from 'lucide-react';
import { searchExplorableClubsAction } from '@/lib/actions/explore.actions';
import { ExploreSearchBar } from '@/components/explore/explore-search-bar';
import { ExploreLoadMoreButton } from '@/components/explore/explore-load-more';
import ClubCard from '@/components/clubs/club-card';

export const metadata: Metadata = { title: 'Explore Clubs' };

export default async function ExploreClubsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string; cursor?: string }>;
}) {
  const { q = '', tag = '', cursor } = await searchParams;
  const tags = tag ? tag.split(',').filter(Boolean) : [];

  const { clubs, nextCursor } = await searchExplorableClubsAction(q, tags, cursor);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold text-[#FFC300] uppercase tracking-[0.15em] mb-2">
          Explore
        </p>
        <h1 className="text-2xl font-bold text-white mainFont flex items-center gap-2">
          <Users className="w-6 h-6 text-orange-400" />
          Book Clubs
        </h1>
      </div>

      <ExploreSearchBar placeholder="Search clubs by name, description, or tag..." />

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
