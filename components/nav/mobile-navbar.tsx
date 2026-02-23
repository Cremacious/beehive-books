'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Compass,
  Library,
  PenLine,
  Users,
} from 'lucide-react';

const mobileNavItems = [
  { href: '/explore', label: 'Explore', icon: Compass  },
  { href: '/library', label: 'Library', icon: Library  },
  { href: '/home',    label: 'Feed',    icon: Home     },
  { href: '/write',   label: 'Write',   icon: PenLine  },
  { href: '/clubs',   label: 'Clubs',   icon: Users    },
] as const;

export function MobileNavbar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#252525] border-t border-[#2a2a2a] shadow-[0_-8px_32px_rgba(0,0,0,0.6)]">
      <div className="flex items-center justify-around h-16 px-1">
        {mobileNavItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full rounded-lg mx-0.5 transition-colors duration-200 ${
                active ? 'text-[#FFC300]' : 'text-white/35 active:text-white/70'
              }`}
            >
              <Icon
                className="w-5 h-5"
                strokeWidth={active ? 2.5 : 1.75}
              />
              <span className={`text-[10px] ${active ? 'font-semibold' : 'font-medium'}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
