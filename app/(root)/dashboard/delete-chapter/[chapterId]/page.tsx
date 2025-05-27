import DeleteChapterButton from './DeleteChapterButton';

const DeleteBookPage = async ({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) => {
  const { chapterId } = await params;

  return (
    <>
      Are you sure you want to delete
      <DeleteChapterButton chapterId={chapterId} />
    </>
  );
};

export default DeleteBookPage;
