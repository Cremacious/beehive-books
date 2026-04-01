import type { Metadata } from 'next';
import Link from 'next/link';
import { Lightbulb } from 'lucide-react';
import { searchExplorablePromptsAction, getExplorableSparksPageRowsAction } from '@/lib/actions/explore.actions';
import { ExploreSearchBar } from '@/components/explore/explore-search-bar';
import { ExploreLoadMoreButton } from '@/components/explore/explore-load-more';
import { ExploreCommunityDiscoveryPanel } from '@/components/explore/explore-community-discovery-panel';
import { PromptCard } from '@/components/prompts/prompt-card';

export const metadata: Metadata = { title: 'Explore Sparks' };

type SparkSort = 'newest' | 'most_entries';

export default async function ExplorePromptsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; cursor?: string }>;
}) {
  const { q = '', sort = 'newest', cursor } = await searchParams;
  const sortParam = (['newest', 'most_entries'] as SparkSort[]).includes(sort as SparkSort)
    ? (sort as SparkSort)
    : 'newest';

  const hasActiveFilters = !!(q || cursor);

  const [{ prompts, nextCursor }, curatedRows] = await Promise.all([
    searchExplorablePromptsAction(q, sortParam, cursor),
    !hasActiveFilters ? getExplorableSparksPageRowsAction() : Promise.resolve({ newSparks: [], popular: [] }),
  ]);

  function buildSortUrl(s: SparkSort) {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    params.set('sort', s);
    return `?${params.toString()}`;
  }

  const sortOptions: { value: SparkSort; label: string }[] = [
    { value: 'newest', label: 'Newest' },
    { value: 'most_entries', label: 'Most Entries' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white mainFont flex items-center gap-2">
        <Lightbulb className="w-6 h-6 text-purple-400" />
        Writing Sparks
      </h1>

      <ExploreSearchBar placeholder="Search writing prompts..." />

      {!hasActiveFilters && (
        <ExploreCommunityDiscoveryPanel
          kind="sparks"
          newItems={curatedRows.newSparks}
          popularItems={curatedRows.popular}
          popularLabel="Most Entries"
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

      {prompts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-xl border-2 border-dashed border-[#FFC300]/20 bg-[#FFC300]/5 flex items-center justify-center mb-8">
            <Lightbulb className="w-8 h-8 text-[#FFC300]/20" />
          </div>
          <h2 className="text-2xl font-bold text-[#FFC300] mb-2 mainFont">No prompts found!</h2>
          <p className="text-white/80 max-w-sm">Try different keywords.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {prompts.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>
          {nextCursor && <ExploreLoadMoreButton nextCursor={nextCursor} />}
        </>
      )}
    </div>
  );
}
