import Link from 'next/link';
import { Users, Hexagon, Lightbulb, List, ArrowRight, Compass, Star, Flame, TrendingUp, BookOpen } from 'lucide-react';
import BookCard from '@/components/library/book-card';
import ClubCard from '@/components/clubs/club-card';
import HiveCard from '@/components/hive/hive-card';
import { PromptCard } from '@/components/prompts/prompt-card';
import ReadingListCard from '@/components/reading-lists/reading-list-card';
import type { Book } from '@/lib/types/books.types';
import type { ClubWithMembership } from '@/lib/types/club.types';
import type { HiveWithMembership } from '@/lib/types/hive.types';
import type { PromptCard as PromptCardType } from '@/lib/types/prompt.types';
import type { ReadingList } from '@/lib/types/reading-list.types';

interface ExploreHubProps {
  featured: Book[];
  popular: Book[];
  trending: Book[];
  clubs: ClubWithMembership[];
  hives: HiveWithMembership[];
  prompts: PromptCardType[];
  readingLists: ReadingList[];
}

function BookRow({
  title,
  icon,
  books,
  seeAllHref,
  cardWidth = 'w-36 sm:w-40',
}: {
  title: string;
  icon: React.ReactNode;
  books: Book[];
  seeAllHref: string;
  cardWidth?: string;
}) {
  if (!books.length) return null;
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white mainFont flex items-center gap-2">
          {icon}
          {title}
        </h3>
        <Link href={seeAllHref} className="flex items-center gap-1 text-xs font-medium text-yellow-500 hover:text-white transition-colors">
          See all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="relative">
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:-mx-8 md:px-8 scrollbar-hide">
          {books.map((book) => (
            <div key={book.id} className={`shrink-0 ${cardWidth}`}>
              <BookCard book={book} basePath="/books" />
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 " />
      </div>
    </div>
  );
}

function CommunityPanel<T>({
  title,
  icon,
  seeAllHref,
  items,
  renderItem,
}: {
  title: string;
  icon: React.ReactNode;
  seeAllHref: string;
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}) {
  if (!items.length) return null;
  return (
    <div className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white mainFont flex items-center gap-2">
          {icon}
          {title}
        </h3>
        <Link href={seeAllHref} className="flex items-center gap-1 text-xs font-medium text-yellow-500 hover:text-white transition-colors">
          See all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="space-y-3">
        {items.slice(0, 3).map((item) => renderItem(item))}
      </div>
    </div>
  );
}

export function ExploreHub({
  featured,
  popular,
  trending,
  clubs,
  hives,
  prompts,
  readingLists,
}: ExploreHubProps) {
  const hasBooks = featured.length > 0 || popular.length > 0 || trending.length > 0;
  const hasCommunity = clubs.length > 0 || hives.length > 0 || prompts.length > 0 || readingLists.length > 0;

  if (!hasBooks && !hasCommunity) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 rounded-2xl bg-[#1c1c1c] border border-[#2a2a2a] flex items-center justify-center mb-6">
          <Compass className="w-9 h-9 text-white/10" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2 mainFont">Nothing to explore yet</h2>
        <p className="text-sm text-white/70 max-w-sm leading-relaxed">
          Content appears here when creators mark their books, clubs, and hives as explorable. Check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Books section — all rows grouped together */}
      {hasBooks && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-white mainFont flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#FFC300]" />
              Books
            </h2>
            <Link href="/explore/books" className="flex items-center gap-1 text-xs font-medium text-yellow-500 hover:text-white transition-colors">
              Browse all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-5 space-y-6">
            <BookRow
              title="Featured"
              icon={<Star className="w-4 h-4 text-[#FFC300]" />}
              books={featured}
              seeAllHref="/explore/books?sort=most_liked"
              cardWidth="w-36 sm:w-44"
            />
            <BookRow
              title="Popular"
              icon={<Flame className="w-4 h-4 text-orange-400" />}
              books={popular}
              seeAllHref="/explore/books?sort=most_liked"
            />
            <BookRow
              title="Trending"
              icon={<TrendingUp className="w-4 h-4 text-emerald-400" />}
              books={trending}
              seeAllHref="/explore/books?sort=most_liked&updated=month"
            />
          </div>
        </section>
      )}

      {/* Community section — two columns on desktop */}
      {hasCommunity && (
        <section>
          <h2 className="text-lg font-bold text-white mainFont mb-5">Community</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CommunityPanel
              title="Book Clubs"
              icon={<Users className="w-4 h-4 text-orange-400" />}
              seeAllHref="/explore/clubs"
              items={clubs}
              renderItem={(club) => <ClubCard key={club.id} club={club} />}
            />
            <CommunityPanel
              title="Writing Hives"
              icon={<Hexagon className="w-4 h-4 text-[#FFC300]" />}
              seeAllHref="/explore/hives"
              items={hives}
              renderItem={(hive) => <HiveCard key={hive.id} hive={hive} />}
            />
            <CommunityPanel
              title="Writing Sparks"
              icon={<Lightbulb className="w-4 h-4 text-purple-400" />}
              seeAllHref="/explore/sparks"
              items={prompts}
              renderItem={(prompt) => <PromptCard key={prompt.id} prompt={prompt} />}
            />
            <CommunityPanel
              title="Reading Lists"
              icon={<List className="w-4 h-4 text-emerald-400" />}
              seeAllHref="/explore/reading-lists"
              items={readingLists}
              renderItem={(list) => <ReadingListCard key={list.id} list={list} />}
            />
          </div>
        </section>
      )}
    </div>
  );
}
