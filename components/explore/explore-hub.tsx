import Link from 'next/link';
import { BookOpen, Users, Hexagon, Lightbulb, List, ArrowRight, Compass } from 'lucide-react';
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

interface SectionProps<T> {
  title: string;
  icon: React.ReactNode;
  seeAllHref: string;
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

function SectionHeader({ title, icon, seeAllHref }: { title: string; icon: React.ReactNode; seeAllHref: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-base font-bold text-white mainFont flex items-center gap-2">
        {icon}
        {title}
      </h2>
      <Link href={seeAllHref} className="flex items-center gap-1 text-xs font-medium text-yellow-500 hover:text-white transition-colors">
        See all
        <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}

function ScrollSection<T>({ title, icon, seeAllHref, items, renderItem }: SectionProps<T>) {
  return (
    <section className="mb-10">
      <SectionHeader title={title} icon={icon} seeAllHref={seeAllHref} />
      <div className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 md:-mx-8 md:px-8 scrollbar-hide">
        {items.map((item, i) => (
          <div key={i} className="shrink-0 w-40 sm:w-45 flex flex-col">
            {renderItem(item)}
          </div>
        ))}
      </div>
    </section>
  );
}

function GridSection<T>({ title, icon, seeAllHref, items, renderItem }: SectionProps<T>) {
  return (
    <section className="mb-10">
      <SectionHeader title={title} icon={icon} seeAllHref={seeAllHref} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((item) => renderItem(item))}
      </div>
    </section>
  );
}

interface ExploreHubProps {
  books: Book[];
  clubs: ClubWithMembership[];
  hives: HiveWithMembership[];
  prompts: PromptCardType[];
  readingLists: ReadingList[];
}

export function ExploreHub({ books, clubs, hives, prompts, readingLists }: ExploreHubProps) {
  const isEmpty =
    books.length === 0 &&
    clubs.length === 0 &&
    hives.length === 0 &&
    prompts.length === 0 &&
    readingLists.length === 0;

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 rounded-2xl bg-[#1c1c1c] border border-[#2a2a2a] flex items-center justify-center mb-6">
          <Compass className="w-9 h-9 text-white/10" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2 mainFont">Nothing to explore yet</h2>
        <p className="text-sm text-white/70 max-w-sm leading-relaxed">
          Content appears here when creators mark their books, clubs, and hives as explorable.
          Check back soon.
        </p>
      </div>
    );
  }

  const sections: React.ReactNode[] = [];

  if (books.length > 0) {
    sections.push(
      <ScrollSection
        key="books"
        title="Books"
        icon={<BookOpen className="w-4 h-4 text-[#FFC300]" />}
        seeAllHref="/explore/books"
        items={books}
        renderItem={(book) => <BookCard book={book} basePath="/books" />}
      />
    );
  }

  if (clubs.length > 0) {
    sections.push(
      <GridSection
        key="clubs"
        title="Book Clubs"
        icon={<Users className="w-4 h-4 text-orange-400" />}
        seeAllHref="/explore/clubs"
        items={clubs}
        renderItem={(club) => <ClubCard key={club.id} club={club} />}
      />
    );
  }

  if (hives.length > 0) {
    sections.push(
      <GridSection
        key="hives"
        title="Writing Hives"
        icon={<Hexagon className="w-4 h-4 text-[#FFC300]" />}
        seeAllHref="/explore/hives"
        items={hives}
        renderItem={(hive) => <HiveCard key={hive.id} hive={hive} />}
      />
    );
  }

  if (prompts.length > 0) {
    sections.push(
      <GridSection
        key="prompts"
        title="Writing Sparks"
        icon={<Lightbulb className="w-4 h-4 text-purple-400" />}
        seeAllHref="/explore/sparks"
        items={prompts}
        renderItem={(prompt) => <PromptCard key={prompt.id} prompt={prompt} />}
      />
    );
  }

  if (readingLists.length > 0) {
    sections.push(
      <GridSection
        key="reading-lists"
        title="Reading Lists"
        icon={<List className="w-4 h-4 text-emerald-400" />}
        seeAllHref="/explore/reading-lists"
        items={readingLists}
        renderItem={(list) => <ReadingListCard key={list.id} list={list} />}
      />
    );
  }

  return (
    <div>
      {sections.map((section, i) => (
        <div key={i}>
          {section}
          {i < sections.length - 1 && <hr className="border-[#2f2e2e] mb-10" />}
        </div>
      ))}
    </div>
  );
}
