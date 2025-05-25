// import Link from 'next/link';
// import { Button } from '@/components/ui/button';
import BookCard from '@/components/shared/Books/BookCard';
const DashboardPage = async () => {
  return (
    <>
      <section className="mb-4">
        <div className="container justify-center mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-beeDark border-white border-8 rounded-xl p-8">
              {' '}
              Card
            </div>
            <div className="bg-beeDark border-white border-8 rounded-xl p-8">
              {' '}
              Card
            </div>
          </div>
        </div>
        <div className="flex-flex-col space-y-8 bg-beeDark p-8">
          <BookCard />
          <BookCard />
          <BookCard />
          <BookCard />
        </div>
      </section>
    </>
  );
};

export default DashboardPage;
