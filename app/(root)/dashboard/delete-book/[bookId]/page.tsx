// import { deleteBook } from '@/lib/actions/book.actions';
import DeleteBookButton from './DeleteBookButton';

const DeleteBookPage = async ({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) => {
  const { bookId } = await params;

  return (
    <>
      Are you sure you want to delete
      <DeleteBookButton bookId={bookId} />
    </>
  );
};

export default DeleteBookPage;
