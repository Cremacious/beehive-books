'use client';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { MenuIcon } from 'lucide-react';
import Link from 'next/link';

type Link = {
  name: string;
  href: string;
};

interface SidebarProps {
  links: Link[];
}

const Sidebar = ({ links }: SidebarProps) => {
  return (
    <>
      <Sheet>
        <SheetTrigger>
          <MenuIcon size={40} className="text-beeYellow" />
        </SheetTrigger>
        <SheetContent className="border-none bg-beeDark text-white">
          <SheetHeader>
            <SheetTitle>Beehive Books</SheetTitle>
            <SheetDescription>
              {links.map((link) => (
                <Link href={link.href} key={link.name}>
                  <h3 className="font-bold text-beeYellow">{link.name}</h3>
                </Link>
              ))}
            </SheetDescription>
          </SheetHeader>
          <SheetFooter>
            <Button className="w-full">Sign Out</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Sidebar;
