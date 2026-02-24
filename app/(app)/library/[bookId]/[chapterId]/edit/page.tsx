import { notFound } from 'next/navigation';
import { ChapterForm } from '@/components/library/chapter-form';
import { getBookWithChaptersAction } from '@/lib/actions/book.actions';

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

  return (
    <ChapterForm
      mode="edit"
      bookId={bookId}
      chapter={chapter}
      cancelHref={`/library/${bookId}/${chapterId}`}
    />
  );
}
