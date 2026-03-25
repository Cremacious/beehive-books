import { notFound } from 'next/navigation';
import BackButton from '@/components/shared/back-button';
import { ReadingListHeader } from '@/components/reading-lists/reading-list-header';
import { ListStats } from '@/components/reading-lists/list-stats';
import { BookListView } from '@/components/reading-lists/book-list-view';
import { AddBookForm } from '@/components/reading-lists/add-book-form';
import { getReadingListAction } from '@/lib/actions/reading-list.actions';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ listId: string }>;
}): Promise<Metadata> {
  const { listId } = await params;
  const data = await getReadingListAction(listId);
  if (!data) return { title: 'Reading List' };
  return {
    title: data.title,
    description: data.description
      ? data.description.slice(0, 155)
      : `A reading list on Beehive Books.`,
  };
}

export default async function ReadingListPage({
  params,
}: {
  params: Promise<{ listId: string }>;
}) {
  const { listId } = await params;

  const data = await getReadingListAction(listId);
  if (!data) notFound();

  const { books, isOwner, ...list } = data;

  return (
    <div className="px-4 py-6 md:px-8">
      <div className="max-w-6xl mx-auto">
        <BackButton href="/reading-lists" label="Reading Lists" className="mb-6" />

        <ReadingListHeader list={list} isOwner={isOwner} />

        {list.currentlyReadingTitle && (
          <div className="flex items-baseline gap-2 mb-5">
            <span className="text-xs font-semibold text-yellow-500 uppercase tracking-wider shrink-0">Now Reading</span>
            <span className="text-base font-semibold text-white">{list.currentlyReadingTitle}</span>
            {list.currentlyReadingAuthor && (
              <span className="text-sm text-white/80">by {list.currentlyReadingAuthor}</span>
            )}
          </div>
        )}

        {list.bookCount > 0 && (
          <ListStats bookCount={list.bookCount} readCount={list.readCount} />
        )}

        {isOwner && (
          <div className="mb-6">
            <AddBookForm listId={listId} />
          </div>
        )}

        <BookListView
          books={books}
          listId={listId}
          isOwner={isOwner}
          currentlyReadingId={list.currentlyReadingId}
        />
      </div>
    </div>
  );
}
