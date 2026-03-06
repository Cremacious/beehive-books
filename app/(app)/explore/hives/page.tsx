import type { Metadata } from 'next';
import { Hexagon } from 'lucide-react';
import { searchExplorableHivesAction } from '@/lib/actions/explore.actions';
import { ExploreSearchBar } from '@/components/explore/explore-search-bar';
import { ExploreSidebar } from '@/components/explore/explore-sidebar';
import HiveCard from '@/components/hive/hive-card';
import { GENRES } from '@/lib/config/constants';

export const metadata: Metadata = { title: 'Explore Hives' };

export default async function ExploreHivesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; genre?: string; tag?: string }>;
}) {
  const { q = '', genre = '', tag = '' } = await searchParams;
  const genres = genre ? genre.split(',').filter(Boolean) : [];
  const tags = tag ? tag.split(',').filter(Boolean) : [];

  const hives = await searchExplorableHivesAction(q, genres, tags);

  const filterGroups = [{ param: 'genre', label: 'Genre', options: GENRES }];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold text-[#FFC300] uppercase tracking-[0.15em] mb-2">
          Explore
        </p>
        <h1 className="text-2xl font-bold text-white mainFont flex items-center gap-2">
          <Hexagon className="w-6 h-6 text-[#FFC300]" />
          Writing Hives
        </h1>
        <p className="mt-1 text-sm text-white/80">
          {hives.length > 0
            ? `${hives.length} hive${hives.length !== 1 ? 's' : ''} found`
            : 'No hives found'}
        </p>
      </div>

      <ExploreSearchBar placeholder="Search hives by name, genre, or tags..." />

      <div className="flex flex-col lg:flex-row gap-6">
        <ExploreSidebar filterGroups={filterGroups} />

        <div className="flex-1 min-w-0">
          {hives.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-xl border-2 border-dashed border-[#FFC300]/20 bg-[#FFC300]/5 flex items-center justify-center mb-8">
                <Hexagon className="w-8 h-8 text-[#FFC300]/20" />
              </div>
              <h2 className="text-2xl font-bold text-[#FFC300] mb-2 mainFont">No hives found!</h2>
              <p className="text-white/80 max-w-sm">
                Try different keywords or clear the filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {hives.map((hive) => (
                <HiveCard key={hive.id} hive={hive} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
