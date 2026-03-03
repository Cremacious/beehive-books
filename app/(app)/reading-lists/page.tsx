import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus, BookMarked, BookOpen, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Reading Lists',
  description: 'Track your reading journey — organise books into lists and monitor your progress.',
};
import { Button } from '@/components/ui/button';
import { ReadingListGrid } from '@/components/reading-lists/reading-list-grid';
import { getUserReadingListsAction } from '@/lib/actions/reading-list.actions';

function formatNumber(n: number): string {
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}

export default async function ReadingListsPage() {
  const lists = await getUserReadingListsAction();

  const totalBooks = lists.reduce((sum, l) => sum + l.bookCount, 0);
  const totalRead = lists.reduce((sum, l) => sum + l.readCount, 0);

  return (
    <div className="px-4 py-8 md:px-8 max-w-6xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mainFont">Reading Lists</h1>
          <p className="mt-0.5 text-base text-white/80">
            Track your reading journey
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/reading-lists/create">
            <Plus />
            New List
          </Link>
        </Button>
      </div>

      {lists.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="rounded-xl bg-[#252525] border border-[#2a2a2a] p-4 flex flex-col gap-3">
            <BookMarked className="w-4 h-4 text-[#FFC300]/80" />
            <div>
              <p className="text-xl font-bold text-white leading-none">
                {lists.length}
              </p>
              <p className=" text-white/80 mt-1">
                List{lists.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="rounded-xl bg-[#252525] border border-[#2a2a2a] p-4 flex flex-col gap-3">
            <BookOpen className="w-4 h-4 text-[#FFC300]/80" />
            <div>
              <p className="text-xl font-bold text-white leading-none">
                {formatNumber(totalBooks)}
              </p>
              <p className=" text-white/80 mt-1">Books</p>
            </div>
          </div>
          <div className="rounded-xl bg-[#252525] border border-[#2a2a2a] p-4 flex flex-col gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-500/70" />
            <div>
              <p className="text-xl font-bold text-white leading-none">
                {formatNumber(totalRead)}
              </p>
              <p className=" text-white/80 mt-1">Read</p>
            </div>
          </div>
        </div>
      )}

      <ReadingListGrid lists={lists} />
    </div>
  );
}
