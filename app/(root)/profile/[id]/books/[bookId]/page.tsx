import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getBookById } from '@/lib/actions/book.actions';

const BookPage = async ({
  params,
}: {
  params: { id: string; bookId: string };
}) => {
  const { id, bookId } = params;
  const book = await getBookById(bookId);

  if (!book) {
    return (
      <div>
        <h2>No book found</h2>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
      <p>
        <strong>Description:</strong> {book.description}
      </p>
      <p>
        <strong>Author:</strong> {book.author}
      </p>
      <p>
        <strong>Genre:</strong> {book.genre}
      </p>
      <p>
        <strong>Category:</strong> {book.category}
      </p>
      <p>
        <strong>Created:</strong>{' '}
        {book.createdAt?.toLocaleString?.() ?? String(book.createdAt)}
      </p>
      <p>
        <strong>Updated:</strong>{' '}
        {book.updatedAt?.toLocaleString?.() ?? String(book.updatedAt)}
      </p>
      <Button variant="outline" asChild>
        <Link href={`/profile/${id}/books/${bookId}/edit`}>Edit Book</Link>
      </Button>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-2">Chapters</h2>
        {book.chapters && book.chapters.length > 0 ? (
          <ul>
            {book.chapters.map((chapter) => (
              <li key={chapter.id} className="mb-2">
                <strong>Title:</strong> {chapter.title}
                {chapter.chapterId && (
                  <span> (Chapter ID: {chapter.chapterId})</span>
                )}
                <Button variant="outline" asChild className="ml-2">
                  <Link
                    href={`/profile/${id}/books/${bookId}/edit/add-chapter/${chapter.id}`}
                  >
                    Edit Chapter
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No chapters available</p>
        )}
      </div>
    </div>
  );
};

export default BookPage;
