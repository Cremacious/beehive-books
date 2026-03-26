import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ChapterForm } from '@/components/library/chapter-form';
import { getBookWithChaptersAction } from '@/lib/actions/book.actions';
import type { ExistingChapter } from '@/lib/types/books.types';

export const metadata: Metadata = {
  title: 'Edit Chapter',
  description: 'Edit your chapter on Beehive Books.',
};

export default async function EditChapterPage({
  params,
}: {
  params: Promise<{ bookId: string; chapterId: string }>;
}) {
  const { bookId, chapterId } = await params;

  let book;
  try {
    book = await getBookWithChaptersAction(bookId);
  } catch {
    notFound();
  }

  const chapter = book.chapters.find(c => c.id === chapterId);
  if (!chapter) notFound();

  const collections = book.collections.map((c) => ({ id: c.id, name: c.name }));

  return (
    <ChapterForm
      mode="edit"
      bookId={bookId}
      chapter={chapter as unknown as ExistingChapter}
      collections={collections}
      cancelHref={`/library/${bookId}/${chapterId}`}
    />
  );
}
