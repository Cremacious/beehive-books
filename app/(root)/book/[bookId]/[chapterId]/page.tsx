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

  return (
    <div className="container mx-auto justify-center space-y-4">
      <div className="newCard p-4 max-w-lg mx-auto">
        <div className="text-3xl text-center text-beeYellow font-bold">
          {chapter.title}
        </div>
      </div>

      <div className="newCard p-8 max-w-7xl mx-auto">
        <div className="text-2xl text-center text-white">{chapter.content}</div>
      </div>
      <div className="newCard p-4 max-w-7xl mx-auto">
        <div className="text-2xl text-center text-beeYellow font-bold">
          Author&apos;s Notes
        </div>
        {chapter.notes}
      </div>
      <div className="newCard p-4 max-w-7xl mx-auto">
        <div className="text-2xl text-center text-beeYellow font-bold">
          Comments
        </div>
      </div>
    </div>
  );
};

export default ChapterPage;
