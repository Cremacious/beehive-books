import EditChapterForm from './edit-chapter-form';
import { getChapterById } from '@/lib/actions/book.actions';
const EditChapterPage = async (params: {
  params: Promise<{ chapterId: string }>;
}) => {
  const { chapterId } = await params.params;
  const chapter = await getChapterById(chapterId);
  if (!chapter) {
    return <div>Chapter not found</div>;
  }
  return (
    <>
      <EditChapterForm chapter={{ ...chapter, notes: chapter.notes ?? undefined }} chapterId={chapterId} />
    </>
  );
};

export default EditChapterPage;
