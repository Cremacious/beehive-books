import { notFound } from 'next/navigation';
import { ChapterReader } from '@/components/library/chapter-reader';
import { getChapterWithContextAction } from '@/lib/actions/book.actions';
import { trackChapterOpenAction } from '@/lib/actions/reading.actions';
import { getOptionalUserId } from '@/lib/require-auth';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ bookId: string; chapterId: string }>;
}): Promise<Metadata> {
  const { chapterId } = await params;
  try {
    const data = await getChapterWithContextAction(chapterId);
    return {
      title: `${data.chapter.title} — ${data.book.title}`,
      description: `Read ${data.chapter.title} from ${data.book.title} on Beehive Books.`,
    };
  } catch {
    return { title: 'Chapter' };
  }
}

export default async function PublicChapterReaderPage({
  params,
}: {
  params: Promise<{ bookId: string; chapterId: string }>;
}) {
  const { bookId, chapterId } = await params;

  let data;
  try {
    data = await getChapterWithContextAction(chapterId);
  } catch {
    notFound();
  }

  const userId = await getOptionalUserId();
  if (userId) {
    void trackChapterOpenAction(bookId, chapterId);
  }

  return <ChapterReader bookId={bookId} data={data} basePath="/books" />;
}
