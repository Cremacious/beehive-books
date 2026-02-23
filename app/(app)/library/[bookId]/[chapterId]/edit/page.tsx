import { ChapterForm } from '@/components/library/chapter-form';

// Placeholder — replace with DB fetch using bookId + chapterId params
const PLACEHOLDER_CHAPTER = {
  title:       'Old Letters',
  authorNotes: 'This chapter was the hardest to write.',
  content:     '<p>The attic smelled of cedar and forgotten decades.</p>',
};

export default async function EditChapterPage({
  params,
}: {
  params: Promise<{ bookId: string; chapterId: string }>;
}) {
  const { bookId, chapterId } = await params;

  return (
    <ChapterForm
      mode="edit"
      chapter={PLACEHOLDER_CHAPTER}
      cancelHref={`/library/${bookId}/${chapterId}`}
    />
  );
}
