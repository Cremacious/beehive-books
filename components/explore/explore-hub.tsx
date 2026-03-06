import Link from 'next/link';
import { BookOpen, Users, Hexagon, Lightbulb, List, ArrowRight, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

function HubSection<T>({ title, icon, seeAllHref, items, renderItem }: SectionProps<T>) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white mainFont flex items-center gap-2">
          {icon}
          {title}
        </h2>
        <Button asChild variant="outline" size="sm">
          <Link href={seeAllHref} className="flex items-center gap-1.5">
            See all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-xl border-2 border-dashed border-[#FFC300]/20 bg-[#FFC300]/5 flex items-center justify-center mb-8">
          <Compass className="w-8 h-8 text-[#FFC300]/20" />
        </div>
        <h2 className="text-2xl font-bold text-[#FFC300] mb-2 mainFont">
          Nothing to explore yet!
        </h2>
        <p className="text-white/80 max-w-sm">
          When creators enable the explorable toggle on their content, it will appear here for the
          community to discover.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {books.length > 0 && (
        <HubSection
          title="Books"
          icon={<BookOpen className="w-5 h-5 text-[#FFC300]" />}
          seeAllHref="/explore/books"
          items={books}
          renderItem={(book) => <BookCard key={book.id} book={book} />}
        />
      )}

      {clubs.length > 0 && (
        <HubSection
          title="Book Clubs"
          icon={<Users className="w-5 h-5 text-orange-400" />}
          seeAllHref="/explore/clubs"
          items={clubs}
          renderItem={(club) => <ClubCard key={club.id} club={club} />}
        />
      )}

      {hives.length > 0 && (
        <HubSection
          title="Writing Hives"
          icon={<Hexagon className="w-5 h-5 text-[#FFC300]" />}
          seeAllHref="/explore/hives"
          items={hives}
          renderItem={(hive) => <HiveCard key={hive.id} hive={hive} />}
        />
      )}

      {prompts.length > 0 && (
        <HubSection
          title="Writing Prompts"
          icon={<Lightbulb className="w-5 h-5 text-purple-400" />}
          seeAllHref="/explore/prompts"
          items={prompts}
          renderItem={(prompt) => <PromptCard key={prompt.id} prompt={prompt} />}
        />
      )}

      {readingLists.length > 0 && (
        <HubSection
          title="Reading Lists"
          icon={<List className="w-5 h-5 text-emerald-400" />}
          seeAllHref="/explore/reading-lists"
          items={readingLists}
          renderItem={(list) => <ReadingListCard key={list.id} list={list} />}
        />
      )}
    </div>
  );
}
