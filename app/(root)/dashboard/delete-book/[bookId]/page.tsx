// import { deleteBook } from '@/lib/actions/book.actions';
import DeleteBookButton from './DeleteBookButton';

const DeleteBookPage = ({ params }: { params: { bookId: string } }) => {
  const { bookId } = params;
  
  return (
    <>
      Are you sure you want to delete
      <DeleteBookButton bookId={bookId} />
    </>
  );
};

export default DeleteBookPage;
