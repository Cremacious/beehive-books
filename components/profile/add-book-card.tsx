import Link from 'next/link';
import { Button } from '../ui/button';

const AddBookCard = () => {
  return (
    <section className="flex items-center justify-center my-4">
      <div className="bg-bee-dark border-8 border-white rounded-xl shadow-lg p-4">
        <Link href="/create-book">
          <Button variant="yellow" className="font-bold text-xl m-2 " size="lg">
            Add Book
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default AddBookCard;
