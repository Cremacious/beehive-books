import type { Metadata } from 'next';
import { Compass } from 'lucide-react';
import { getExplorableHubDataAction } from '@/lib/actions/explore.actions';
import { ExploreHub } from '@/components/explore/explore-hub';
import { ExploreSearchBar } from '@/components/explore/explore-search-bar';

export const metadata: Metadata = {
  title: 'Explore',
  description: 'Discover books, authors, and reading groups from across the Beehive Books community.',
};

export default async function ExplorePage() {
  const { books, clubs, hives, prompts, readingLists } = await getExplorableHubDataAction();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-semibold text-[#FFC300] uppercase tracking-[0.15em] mb-2">
          Discovery
        </p>
        <h1 className="text-3xl font-bold text-white mainFont flex items-center gap-3">
          <Compass className="w-7 h-7 text-[#FFC300]" />
          Explore
        </h1>
        <p className="mt-2 text-sm text-white/80 max-w-lg leading-relaxed">
          Discover books, writing hives, clubs, prompts, and reading lists shared by the Beehive
          Books community.
        </p>
      </div>

      <ExploreSearchBar placeholder="Search books, clubs, hives, prompts..." />

      <ExploreHub
        books={books}
        clubs={clubs}
        hives={hives}
        prompts={prompts}
        readingLists={readingLists}
      />
    </div>
  );
}
