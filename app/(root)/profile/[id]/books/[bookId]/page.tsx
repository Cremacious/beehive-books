import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getBookById } from '@/lib/actions/book.actions';

const BooksPage = async (params: {
  params: Promise<{ id: string; bookId: string }>;
}) => {
  const { id, bookId } = await params.params;
  const book = await getBookById(bookId);
  return (
    <>
      {id}
      Book Page
      {book ? (
        <div>
          <h2>{book.title}</h2>
          <p>{book.description}</p>
          <p>{book.author}</p>
          <p>{book.genre}</p>
          <Button variant="outline">
            <Link href={`/profile/${id}/books/${bookId}/edit`}>Edit Book</Link>
          </Button>
        </div>
      ) : (
        <div>
          <h2>No book found</h2>
        </div>
      )}
    </>
  );
};

export default BooksPage;
