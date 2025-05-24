import { getBookById } from '@/lib/actions/book.actions';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
const EditPage = async (params: {
  params: Promise<{ id: string; bookId: string }>;
}) => {
  const { id, bookId } = await params.params;
  const book = await getBookById(bookId);
  return (
    <>
      Edit book page
      {book?.author}
      {id}
      <Button asChild>
        <Link href={`/profile/${id}/books/${bookId}/edit/add-chapter`}>
          Add Chapter
        </Link>
      </Button>
    </>
  );
};

export default EditPage;
