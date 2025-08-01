import Link from 'next/link';
import { Button } from '../ui/button';

export default function CreateBookButton({ full }: { full?: boolean }) {
  return (
    <Button
      asChild
      className={`${full ? 'w-full md:w-64' : ''}`}

    >
      <Link href="/books/create-book">Create New Book</Link>
    </Button>
  );
}
