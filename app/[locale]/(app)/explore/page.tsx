import type { Metadata } from 'next';
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
    <div className="min-h-screen">
      {/* Hero section */}
      <div className="relative px-4 md:px-8 pt-8 pb-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(255,195,0,0.07),transparent)] pointer-events-none" />
        <div className="max-w-6xl mx-auto relative">
          <h1 className="text-3xl md:text-4xl font-bold text-white mainFont mb-2">
            Discover Stories
          </h1>
          <p className="text-white/50 text-base max-w-lg mb-6">
            Books, writing communities, and creative challenges from the Beehive Books community.
          </p>
          <ExploreSearchBar placeholder="Search books, clubs, hives, prompts..." />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 md:px-8 pb-12 max-w-6xl mx-auto">
        <ExploreHub
          books={books}
          clubs={clubs}
          hives={hives}
          prompts={prompts}
          readingLists={readingLists}
        />
      </div>
    </div>
  );
}
