import { getBookById } from '@/lib/actions/book.actions';

const BookPage = async (params: { params: Promise<{ bookId: string }> }) => {
  const { bookId } = await params.params;
  const book = await getBookById(bookId);
  return <>{book?.title}</>;
};

export default BookPage;
