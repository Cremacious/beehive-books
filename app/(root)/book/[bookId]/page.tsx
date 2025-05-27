import { getBookById } from '@/lib/actions/book.actions';
import Image from 'next/image';
import stockBookCover from '@/assets/images/stock/bookCoverImage.jpg';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const BookPage = async (params: { params: Promise<{ bookId: string }> }) => {
  const { bookId } = await params.params;
  const book = await getBookById(bookId);
  if (!book) {
    return (
      <div className="container mx-auto justify-center">
        <div className="newCard">No Book Found</div>
      </div>
    );
  }

  return (
    <section>
      <div className="container mx-auto justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="justify-center flex flex-col items-center">
            <div className="newCard w-1/2 py-8">
              <div className="flex flex-col items-center">
                <Image
                  src={stockBookCover}
                  alt="Book Cover"
                  className="rounded-lg"
                  height={150}
                  width={150}
                />
              </div>
            </div>
          </div>
          <div className="newCard">
            <div className="text-2xl text-center text-beeYellow font-bold">
              {book.title}
            </div>
            <div>
              <div className="text-lg text-center text-beeYellow font-bold">
                Written by {book.author}
              </div>
              <div className="text-lg text-center text-beeYellow font-bold">
                {book.description}
              </div>
              {book.category}
              {book.genre}
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto justify-center">
        <div className="newCard">
          {book.chapters && book.chapters.length > 0 ? (
            <div>
              <div className="text-2xl text-center text-beeYellow font-bold">
                Chapters
              </div>
              <ul className="list-disc pl-8">
                {book.chapters.map((chapter, index) => (
                  <div key={index} className="text-lg text-beeYellow">
                    {chapter.title}{' '}
                    <Button className="ml-4">
                      <Link href={`/book/${book.id}/${chapter.id}`}>
                        Read Chapter
                      </Link>
                    </Button>
                  </div>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-center text-lg text-beeYellow font-bold">
              No Chapters Available
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default BookPage;
