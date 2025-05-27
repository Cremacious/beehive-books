'use client';
import bookCoverImage from '@/assets/images/stock/bookCoverImage.jpg';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Book } from '@/lib/types/Book';
import Link from 'next/link';

const BookCard = ({ book }: { book: Book }) => {
  if (!book) {
    return (
      <div className="bg-beeYellow p-4 roundShadow max-w-sm">
        <div className="flex flex-row justify-around gap-4">
          <div className="flex flex-col items-center ">
            <div className="space-y-1 flex flex-col items-center ">
              <div className="text-xl text-center font-bold line-clamp-3 break-words w-full">
                No Book Found
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-beeYellow p-4 roundShadow max-w-sm">
      <div className="flex flex-row justify-around gap-4">
        <div className="flex flex-col items-center ">
          <div className="space-y-1 flex flex-col items-center ">
            <div className="text-xl text-center font-bold line-clamp-3 break-words w-full">
              {book.title}
            </div>
            <div className="text-center font-bold line-clamp-2 break-words">
              {book.author}
            </div>
          </div>
        </div>
        <Image
          src={bookCoverImage}
          alt="Book Cover"
          className="rounded-lg"
          height={150}
        />
      </div>
      <div className="mt-6 flex flex-row gap-4 justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button
              variant="ghost"
              className="text-lg font-bold text-slate-800 bg-white"
            >
              Edit
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href={`/book/${book.id}`}>View Book</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href={`/dashboard/add-chapter/${book.id}`}>
                Add Chapter
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href={`/dashboard/edit-book/${book.id}`}>Edit Book</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              {' '}
              <Link href={`/dashboard/delete-book/${book.id}`}>
                Delete Book
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="secondary" size="sm" className="text-lg">
          Read Book
        </Button>
      </div>
    </div>
  );
};

export default BookCard;
