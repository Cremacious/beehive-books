import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getAllBooksByUserId } from '@/lib/actions/book.actions';

const HivePage = async (params: { params: Promise<{ id: string }> }) => {
  const { id } = await params.params;
  const books = await getAllBooksByUserId(id);
  return (
    <>
      {books.length > 0 ? (
        books.map((book) => (
          <div key={book.id}>
            <h2>{book.title}</h2>
            <p>{book.description}</p>
            <Link href={`/profile/${id}/books/${book.id}`}>
              <Button variant="outline">View Book</Button>
            </Link>
          </div>
        ))
      ) : (
        <div>
          <h2>No books found</h2>
          <Link href={`/profile/${id}/books/create`}>
            <Button variant="outline">Create Book</Button>
          </Link>
        </div>
      )}
    </>
  );
};

export default HivePage;
