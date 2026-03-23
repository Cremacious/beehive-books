import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reading Lists',
  description:
    'Track your reading journey — organize books into lists and monitor your progress.',
};
import { ReadingListGrid } from '@/components/reading-lists/reading-list-grid';
import { getUserReadingListsAction } from '@/lib/actions/reading-list.actions';

export default async function ReadingListsPage() {
  const lists = await getUserReadingListsAction();

  return (
    <div className="px-4 py-6 md:px-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mainFont">
          My Reading Lists
        </h1>
        <p className="mt-2 text-sm text-white/80 max-w-sm leading-relaxed">
          Create lists to organize books you want to read, are currently
          reading, or have finished. Track your progress and share your lists
          with friends.
        </p>
      </div>

      <ReadingListGrid lists={lists} />
    </div>
  );
}
