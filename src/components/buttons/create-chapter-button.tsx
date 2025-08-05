import Link from 'next/link';
import { Button } from '../ui/button';

export default function CreateChapterButton({ full }: { full?: boolean }) {
  return (
    <Button asChild className={`${full ? 'w-full md:w-64' : ''}`}>
      <Link href="/books/33/chapters/create">Create New Chapter</Link>
    </Button>
  );
}
