import AddChapterForm from './add-chapter-form';
const AddChapter = async (params: { params: Promise<{ bookId: string }> }) => {
  const { bookId } = await params.params;

  return (
    <>
      <AddChapterForm bookId={bookId} />
    </>
  );
};

export default AddChapter;
