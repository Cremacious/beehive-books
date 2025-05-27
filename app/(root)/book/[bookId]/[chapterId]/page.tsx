import { getChapterById } from '@/lib/actions/book.actions';

const ChapterPage = async (params: {
  params: Promise<{ chapterId: string }>;
}) => {
  const { chapterId } = await params.params;
  const chapter = await getChapterById(chapterId);
  if (!chapter) {
    return (
      <div className="container mx-auto justify-center">
        <div className="newCard">No Chapter Found</div>
      </div>
    );
  }

  return <>{chapter.title}</>;
};

export default ChapterPage;
