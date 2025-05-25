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

const BookCard = () => {
  return (
    <div className="bg-beeYellow p-4 roundShadow max-w-sm">
      <div className="flex flex-row justify-around gap-4">
        <div className="flex flex-col items-center ">
          <div className="space-y-1 flex flex-col items-center ">
            <div className="text-xl text-center font-bold line-clamp-3 break-words w-full">
              The Hundred-Year-Old Man Who Climbed Out the Window and
              Disappeared fdsf  fdsfsd fs fdfs 
            </div>
            <div className="text-center font-bold line-clamp-2 break-words">
              Christopher Mackall Christopher Mackall Christopher Mackall
              Christopher Mackall
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
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuItem>Team</DropdownMenuItem>
            <DropdownMenuItem>Subscription</DropdownMenuItem>
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
