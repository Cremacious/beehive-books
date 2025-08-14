import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import Link from 'next/link';
import defaultCoverImage from '@/assets/stock/defaultBook.jpg';
import { BookType } from '@/lib/types/books.type';

export default function BookCard({ book }: { book: any }) {
  const src =
    book.cover && typeof book.cover === 'string'
      ? book.cover
      : defaultCoverImage;

  return (
    <div className="customDark2 hoverAnimate2 rounded-2xl shadow-lg p-5 flex flex-col items-center border-b-6 border-b-yellow-500 relative h-[400px]">
      <div className="flex flex-col items-center flex-1 justify-between">
        <div className="flex flex-col items-center">
          <Image
            src={src}
            alt={book.title}
            width={112}
            height={160}
            className="rounded-lg border-3 border-yellow-400 mb-3 object-cover shadow-lg group-hover:scale-105 transition-transform"
            style={{ aspectRatio: '7/10' }}
            priority
          />
          <h3 className="font-bold text-lg text-yellow-100 mb-1 text-center poppins line-clamp-2">
            {book.title}
          </h3>
          <p className="text-yellow-300 text-sm mb-2">by {book.author}</p>
        </div>

        <div className="flex flex-wrap gap-1 mb-3 justify-center min-h-[2.5rem] items-start">
          <Badge variant={'wood'}>{book.genre}</Badge>
          <Badge variant={'wood'}>{book.privacy}</Badge>
        </div>
      </div>

      <div className="flex gap-2 w-full justify-between items-center mt-auto">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant={'secondary'}>Options</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <Link href={`/books/${book.id}`}>View</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/books/${book.id}/edit`}>Edit</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/books/${book.id}/share`}> Share</Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button asChild className="flex-1">
          <Link href={`/books/${book.id}`}>Read</Link>
        </Button>
      </div>
    </div>
  );
}
