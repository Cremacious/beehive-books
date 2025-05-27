// import Link from 'next/link';
// import { Button } from '@/components/ui/button';
import BookGallery from '@/components/shared/Books/BookGallery';
import { getAllUserBooks } from '@/lib/actions/book.actions';
import AddBookButton from '@/components/shared/Books/AddBookButton';

const DashboardPage = async () => {
  const books = await getAllUserBooks();
  if (!books) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold">No Books Found</h1>
      </div>
    );
  }

  return (
    <>
      <section className="mb-4">
        <div className="container justify-center mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-beeDark border-white border-8 rounded-xl p-8">
              <AddBookButton />
            </div>
            <div className="bg-beeDark border-white border-8 rounded-xl p-8">
              {' '}
              Card
            </div>
          </div>
        </div>
        <div className="flex-flex-col space-y-8 bg-beeDark p-8">
          <BookGallery books={books} />
        </div>
      </section>
    </>
  );
};

export default DashboardPage;
