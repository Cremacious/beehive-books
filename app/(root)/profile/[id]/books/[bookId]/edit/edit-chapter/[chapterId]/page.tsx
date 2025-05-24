import EditChapterForm from './edit-chapter-form';
import { getChapterById } from '@/lib/actions/book.actions';

const EditChapterPage = async ({
  params,
}: {
  params: { chapterId: string };
}) => {
  const { chapterId } = params;
  const chapter = await getChapterById(chapterId);
  if (!chapter) {
    return <div>Chapter not found</div>;
  }
  return (
    <>
      <EditChapterForm
        chapter={{ ...chapter, notes: chapter.notes ?? undefined }}
        chapterId={chapterId}
      />
    </>
  );
};

export default EditChapterPage;
