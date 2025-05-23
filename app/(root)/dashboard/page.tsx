import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getAllUserBooks } from '@/lib/actions/book.actions';

const DashboardPage = async () => {
  const books = await getAllUserBooks();
  if (!books) {
    return (
      <div className="container mx-auto rounded-2xl bg-white p-2 text-white shadow-xl">
        <div className="rounded-2xl bg-beeDark p-4">No books found</div>
      </div>
    );
  }
  return (
    <>
      <section>
        <div className="container mx-auto rounded-2xl bg-white p-2 text-white shadow-xl">
          <div className="rounded-2xl bg-beeDark p-4">
            Container
            <Link href="/dashboard/add-book">
              <Button className="">Add Book</Button>
            </Link>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {books.map((book) => (
                <div
                  key={book.id}
                  className="rounded-lg bg-beeYellow p-4 text-black"
                >
                  <h2 className="text-xl font-bold">{book.title}</h2>
                  <p>{book.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default DashboardPage;
