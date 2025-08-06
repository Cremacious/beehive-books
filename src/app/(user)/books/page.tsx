import BooksStats from '@/components/books/books-stats';
import BookCard from '@/components/books/book-card';
import { userBooks, friendsBooks } from '@/lib/sampleData';

export default function BooksPage() {
  const totalBooks = userBooks.length;
  const totalFriendsBooks = friendsBooks.length;
  const totalChapters = userBooks.reduce(
    (acc, b) => acc + b.chapters.length,
    0
  );
  const totalComments =
    userBooks.reduce((acc, b) => acc + b.comments.length, 0) +
    friendsBooks.reduce((acc, b) => acc + b.comments.length, 0);

  return (
    <div className="max-w-7xl mx-auto px-2">
      <div className="darkContainer space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
          <div className="whiteContainer">
            <h1 className="text-4xl font-bold text-slate-800 mb-2 caveatBrush ">
              Your Bookshelf
            </h1>
            <p className="text-slate-700 text-lg max-w-2xl">
              Your personal library where stories bloom and community thrives.
              Share, create, and grow together!
            </p>
          </div>

          <BooksStats
            totalBooks={totalBooks}
            totalChapters={totalChapters}
            totalComments={totalComments}
            totalFriendsBooks={totalFriendsBooks}
          />
        </div>

        <div className="whiteContainer">
          <div className="flex justify-center mb-6">
            <div className="text-4xl font-bold text-slate-800 caveatBrush flex items-center gap-2 text-center">
              My Books
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-6 border-2 border-yellow-200 p-4 rounded-xl">
            {userBooks.length > 0 ? (
              userBooks.map((book) => <BookCard key={book.id} book={book} />)
            ) : (
              <div className="col-span-full text-slate-500 text-center py-12 bg-yellow-50 rounded-xl border-2 border-yellow-200">
                <p className="font-['Caveat',cursive] text-lg">
                  No books found.
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="whiteContainer">
          <div className="flex justify-center mb-6">
            <div className="text-4xl font-bold text-slate-800 caveatBrush flex items-center gap-2 text-center">
              Friend&apos;s Book
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-6">
            {friendsBooks.length > 0 ? (
              friendsBooks.map((book) => <BookCard key={book.id} book={book} />)
            ) : (
              <div className="col-span-full text-slate-500 text-center py-12 bg-yellow-50 rounded-xl border-2 border-yellow-200">
                <p className="font-['Caveat',cursive] text-lg">
                  No books found.
                </p>
              </div>
            )}
          </div>
        </div>


      </div>
    </div>
  );
}
