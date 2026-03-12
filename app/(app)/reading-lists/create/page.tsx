import type { Metadata } from 'next';
import BackButton from '@/components/shared/back-button';
import { ReadingListForm } from '@/components/reading-lists/reading-list-form';

export const metadata: Metadata = {
  title: 'New Reading List',
  description: 'Create a new reading list to track your books on Beehive Books.',
};

export default function CreateReadingListPage() {
  return (
    <div className="px-4 py-6 md:px-8 max-w-2xl mx-auto">
      <BackButton href="/reading-lists" label="Reading Lists" className="mb-6" />


      <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] p-6">
        <ReadingListForm mode="create" />
      </div>
    </div>
  );
}
