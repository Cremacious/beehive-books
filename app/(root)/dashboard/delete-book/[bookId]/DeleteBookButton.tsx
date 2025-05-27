'use client';
import { Button } from '@/components/ui/button';
import { deleteBook } from '@/lib/actions/book.actions';
import { toast } from 'sonner';

const DeleteBookButton = ({ bookId }: { bookId: string }) => {
  const handleDelete = async () => {
    const response = await deleteBook(bookId);
    if (response.success) {
      toast.success(response.message);
    } else {
      toast.error(response.message);
    }
  };
  return (
    <>
      <Button onClick={handleDelete}>Delete The Book</Button>
    </>
  );
};

export default DeleteBookButton;
