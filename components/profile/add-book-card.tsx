import Link from 'next/link';
import { Button } from '../ui/button';

const AddBookCard = () => {
  return (
    <section className="my-4 flex items-center justify-center">
      <div className="rounded-xl border-8 border-white bg-bee-dark p-4 shadow-lg">
        <Link href="/create-book">
          <Button variant="beeYellow" className="m-2 text-xl font-bold" size="lg">
            Add Book
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default AddBookCard;
