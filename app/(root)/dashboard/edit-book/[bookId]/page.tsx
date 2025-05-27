import { getBookById } from '@/lib/actions/book.actions';

const EditBookPage = async (params: {
  params: Promise<{ bookId: string }>;
}) => {
  const { bookId } = await params.params;
  const book = await getBookById(bookId);
  return (
    <>
      {book?.title} by {book?.author}

    </>
  );
};

export default EditBookPage;
