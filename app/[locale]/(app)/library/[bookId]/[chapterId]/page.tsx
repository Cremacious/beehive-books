import { notFound } from 'next/navigation';
import { ChapterReader } from '@/components/library/chapter-reader';
import { getChapterWithContextAction } from '@/lib/actions/book.actions';
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
      title: `${data.chapter.title} - ${data.book.title}`,
      description: `Read ${data.chapter.title} from ${data.book.title} on Beehive Books.`,
    };
  } catch {
    return { title: 'Chapter' };
  }
}

export default async function ChapterReaderPage({
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

  return <ChapterReader bookId={bookId} data={data} basePath="/library" />;
}
