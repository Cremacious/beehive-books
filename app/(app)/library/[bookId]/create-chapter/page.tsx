import { ChapterForm } from '@/components/library/chapter-form';

export default async function CreateChapterPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;

  return (
    <ChapterForm
      mode="create"
      cancelHref={`/library/${bookId}`}
    />
  );
}
