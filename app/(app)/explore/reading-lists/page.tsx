import type { Metadata } from 'next';
import { List } from 'lucide-react';
import { searchExplorableReadingListsAction } from '@/lib/actions/explore.actions';
import { ExploreSearchBar } from '@/components/explore/explore-search-bar';
import ReadingListCard from '@/components/reading-lists/reading-list-card';

export const metadata: Metadata = { title: 'Explore Reading Lists' };

export default async function ExploreReadingListsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = '' } = await searchParams;

  const lists = await searchExplorableReadingListsAction(q);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold text-[#FFC300] uppercase tracking-[0.15em] mb-2">
          Explore
        </p>
        <h1 className="text-2xl font-bold text-white mainFont flex items-center gap-2">
          <List className="w-6 h-6 text-emerald-400" />
          Reading Lists
        </h1>
        <p className="mt-1 text-sm text-white/80">
          {lists.length > 0
            ? `${lists.length} list${lists.length !== 1 ? 's' : ''} found`
            : 'No reading lists found'}
        </p>
      </div>

      <ExploreSearchBar placeholder="Search reading lists..." />

      {lists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-xl border-2 border-dashed border-[#FFC300]/20 bg-[#FFC300]/5 flex items-center justify-center mb-8">
            <List className="w-8 h-8 text-[#FFC300]/20" />
          </div>
          <h2 className="text-2xl font-bold text-[#FFC300] mb-2 mainFont">No reading lists found!</h2>
          <p className="text-white/80 max-w-sm">Try different keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {lists.map((list) => (
            <ReadingListCard key={list.id} list={list} />
          ))}
        </div>
      )}
    </div>
  );
}
