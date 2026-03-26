import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reading Lists',
  description:
    'Track your reading journey — organize books into lists and monitor your progress.',
};
import { ReadingListGrid } from '@/components/reading-lists/reading-list-grid';
import { getUserReadingListsAction, getLikedReadingListsAction } from '@/lib/actions/reading-list.actions';
import type { ReadingList } from '@/lib/types/reading-list.types';

export default async function ReadingListsPage() {
  const [lists, likedLists] = await Promise.all([
    getUserReadingListsAction(),
    getLikedReadingListsAction(),
  ]);

  return (
    <div className="px-4 py-6 md:px-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mainFont">
          My Reading Lists
        </h1>
      </div>

      <ReadingListGrid lists={lists as unknown as ReadingList[]} likedLists={likedLists as unknown as ReadingList[]} />
    </div>
  );
}
