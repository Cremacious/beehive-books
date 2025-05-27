import DeleteChapterButton from './DeleteChapterButton';

const DeleteBookPage = ({ params }: { params: { chapterId: string } }) => {
  const { chapterId } = params;

  return (
    <>
      Are you sure you want to delete
      <DeleteChapterButton chapterId={chapterId} />
    </>
  );
};

export default DeleteBookPage;
