import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import Link from 'next/link';

export function Sidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="bg-[#181818] text-yellow-300 font-bold rounded-xl border-b-4 border-t-2 border-r-2 border-l-2 border-b-yellow-500 border-t-yellow-400 border-r-yellow-400  border-l-yellow-400 hover:bg-[#121212] hover:border-b-yellow-500 hover:text-yellow-400 transition-all duration-300 hover:-translate-y-0.5 p-1 hover:cursor-pointer caveatBrush text-xl">
          <Menu className="h-6 w-8" />
        </button>
      </SheetTrigger>
      <SheetContent className="bg-[#202020] text-yellow-300 border-0">
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>
        {ROUTES.map((route) => (
          <div key={route.path}>
            <Button className="">
              <Link
                href={route.path}
             
              >
               {route.name}
              </Link>
            </Button>
          </div>
        ))}
        <SheetFooter>
          <Button type="submit">Save changes</Button>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
