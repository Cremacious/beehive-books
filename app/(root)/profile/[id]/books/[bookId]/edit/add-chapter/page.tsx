import { getBookById } from '@/lib/actions/book.actions';

const AddChapterPage = async (params: {
  params: Promise<{ id: string; bookId: string }>;
}) => {
  const { id, bookId } = await params.params;
  const book = await getBookById(bookId);
  return (
    <>
      Add Chapter Page
      {book?.author}
      {id}
    </>
  );
};

export default AddChapterPage;
