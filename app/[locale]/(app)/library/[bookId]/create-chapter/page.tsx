import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ChapterForm } from '@/components/library/chapter-form';
import { getBookWithChaptersAction } from '@/lib/actions/book.actions';

export const metadata: Metadata = {
  title: 'New Chapter',
  description: 'Add a new chapter to your book on Beehive Books.',
};

export default async function CreateChapterPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;

  let collections: { id: string; name: string }[] = [];
  try {
    const book = await getBookWithChaptersAction(bookId);
    collections = book.collections.map((c) => ({ id: c.id, name: c.name }));
  } catch {
    notFound();
  }

  return (
    <ChapterForm
      mode="create"
      bookId={bookId}
      cancelHref={`/library/${bookId}`}
      collections={collections}
    />
  );
}
