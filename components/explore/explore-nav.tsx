'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Users, Hexagon, Lightbulb, List, Compass } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Discover', href: '/explore', icon: Compass, exact: true },
  { label: 'Books', href: '/explore/books', icon: BookOpen, exact: false },
  { label: 'Clubs', href: '/explore/clubs', icon: Users, exact: false },
  { label: 'Hives', href: '/explore/hives', icon: Hexagon, exact: false },
  { label: 'Prompts', href: '/explore/prompts', icon: Lightbulb, exact: false },
  { label: 'Reading Lists', href: '/explore/reading-lists', icon: List, exact: false },
];

export function ExploreNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-[#2a2a2a] bg-[#1a1a1a] sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {NAV_ITEMS.map(({ label, href, icon: Icon, exact }) => {
            const isActive = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? 'border-[#FFC300] text-[#FFC300]'
                    : 'border-transparent text-white/80 hover:text-white hover:border-white/20'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
