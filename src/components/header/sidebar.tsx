'use client';
import { Button } from '@/components/ui/button';

import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { ROUTES } from '@/lib/constants';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function Sidebar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleButtonClick = (path: string) => {
    setIsOpen(!isOpen);
    router.push(path);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="bg-[#181818] text-yellow-300 font-bold rounded-xl border-b-4 border-t-2 border-r-2 border-l-2 border-b-yellow-500 border-t-yellow-400 border-r-yellow-400  border-l-yellow-400 hover:bg-[#121212] hover:border-b-yellow-500 hover:text-yellow-400 transition-all duration-300 hover:-translate-y-0.5 p-1 hover:cursor-pointer caveatBrush text-xl">
          <Menu className="h-6 w-8" />
        </button>
      </SheetTrigger>
      <SheetContent className="bg-[#202020] text-yellow-300 border-0">
        <SheetHeader>
          <SheetTitle className="text-xl font-extrabold tracking-tight text-yellow-300 playwright">
            Beehive Books
          </SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mx-2 mt-6">
          {ROUTES.map((route) => (
            <Button
              key={route.name}
              variant="ghost"
              onClick={() => handleButtonClick(route.path)}
              className="text-xl font-bold w-full text-center px-4 py-6 text-yellow-300  relative overflow-hidden rounded-lg transition-all duration-300 group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/20 opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>

              <div className="absolute inset-0 backdrop-blur-sm border border-white/20 group-hover:border-white/40 rounded-lg transition-all duration-300"></div>

              <span className="relative z-10">{route.name}</span>
            </Button>
          ))}
        </div>
        <SheetFooter>
          <Button type="submit">Sign Out</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
