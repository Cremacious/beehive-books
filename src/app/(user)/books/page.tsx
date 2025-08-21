import BooksStats from '@/components/books/books-stats';
import { mockUser } from '@/lib/sampleData';
import beeBookshelf from '@/assets/site/beeBookshelf.png';
import Image from 'next/image';
import BookShelf from '@/components/books/bookshelf';
import { getAuthenticatedUser } from '@/lib/providers/types/server-utils';
import { getUserBooksById } from '@/lib/actions/book.actions';

export default async function BooksPage() {
  const { user } = await getAuthenticatedUser();
  if (!user) {
    return <div className="text-red-500">User not authenticated</div>;
  }

  const books = await getUserBooksById(user.id);

  const userBooks = mockUser.books;

  const totalBooks = userBooks.length;
  const totalChapters = userBooks.reduce(
    (acc, b) => acc + b.chapters.length,
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-2">
      <div className="space-y-6">
        <div className="darkContainer">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
            <div className="lightContainer h-full">
              <div className="flex justify-center">
                <Image
                  src={beeBookshelf}
                  alt="bee bookshelf"
                  width={200}
                  height={200}
                />
              </div>
              <h1 className="text-4xl mt-2 font-bold text-yellow-400 mb-2 caveatBrush text-center">
                Your Bookshelf
              </h1>
              <p className="text-white text-lg max-w-2xl text-center">
                Your personal library where stories bloom and community thrives.
                Share, create, and grow together!
              </p>
            </div>
            <BooksStats
              totalBooks={totalBooks}
              totalChapters={totalChapters}
              totalComments={10}
              totalFriendsBooks={5}
            />
          </div>
        </div>

        <div className="darkContainer space-y-6">
          <BookShelf books={books} owner={'Your'} />
        </div>

        {/* <div className="darkContainer space-y-6">
          <BookShelf books={userBooks} owner={'Your'} />
        </div> */}
      </div>
    </div>
  );
}
