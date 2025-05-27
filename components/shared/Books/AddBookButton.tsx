import { Button } from '@/components/ui/button';
import Link from 'next/link';

const AddBookButton = () => {
  return (
    <>
      <Button>
        <Link href="/dashboard/add-book">Add Book</Link>
      </Button>
    </>
  );
};

export default AddBookButton;
