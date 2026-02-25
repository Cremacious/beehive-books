import { notFound } from 'next/navigation';
import BackButton from '@/components/shared/back-button';
import { ReadingListForm } from '@/components/reading-lists/reading-list-form';
import { getReadingListAction } from '@/lib/actions/reading-list.actions';

export default async function EditReadingListPage({
  params,
}: {
  params: Promise<{ listId: string }>;
}) {
  const { listId } = await params;

  const data = await getReadingListAction(listId);
  if (!data || !data.isOwner) notFound();

  const { books: _books, currentUserId: _uid, isOwner: _own, ...list } = data;

  return (
    <div className="px-4 py-6 md:px-8 max-w-2xl mx-auto">
      <BackButton href={`/reading-lists/${listId}`} label={list.title} className="mb-6" />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Edit Reading List</h1>
        <p className="text-sm text-white/45 mt-1">Update your list&apos;s details.</p>
      </div>

      <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] p-6">
        <ReadingListForm
          mode="edit"
          listId={listId}
          defaultValues={list}
        />
      </div>
    </div>
  );
}
