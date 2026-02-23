'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import {
  Home,
  Compass,
  Library,
  PenLine,
  Users,
  Lightbulb,
  BookMarked,
  Bell,
  User,
  Settings,
  LogOut,
} from 'lucide-react';

const navItems = [
  { href: '/home',          label: 'Feed',          icon: Home      },
  { href: '/explore',       label: 'Explore',       icon: Compass   },
  { href: '/library',       label: 'Library',       icon: Library   },
  // { href: '/write',         label: 'Write',         icon: PenLine   },
  { href: '/clubs',         label: 'Clubs',         icon: Users     },
  { href: '/prompts',       label: 'Prompts',       icon: Lightbulb },
  { href: '/reading-lists', label: 'Reading Lists', icon: BookMarked},
  { href: '/notifications', label: 'Notifications', icon: Bell      },
] as const;

export function DesktopSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { signOut } = useClerk();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 h-screen sticky top-0 bg-[#252525] border-r border-[#2a2a2a] shadow-2xl z-40 shrink-0">

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-[#2a2a2a]">
        <span className="text-[22px] leading-none">🐝</span>
        <span className="text-white font-bold text-lg tracking-tight mainFont">
          Beehive<span className="text-[#FFC300]">Books</span>
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-[#FFC300]/10 text-[#FFC300]'
                      : 'text-white/55 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.75 h-5 bg-[#FFC300] rounded-r-full" />
                  )}
                  <Icon
                    className="w-4.5 h-4.5 shrink-0"
                    strokeWidth={active ? 2.5 : 1.75}
                  />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}

          {/* Profile — links to /u/[username] */}
          {user && (
            <li>
              <Link
                href={`/u/${(user.publicMetadata?.username as string | undefined) ?? user.id}`}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive('/u')
                    ? 'bg-[#FFC300]/10 text-[#FFC300]'
                    : 'text-white/55 hover:text-white hover:bg-white/5'
                }`}
              >
                {isActive('/u') && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.75 h-5 bg-[#FFC300] rounded-r-full" />
                )}
                <User
                  className="w-4.5 h-4.5 shrink-0"
                  strokeWidth={isActive('/u') ? 2.5 : 1.75}
                />
                <span>Profile</span>
              </Link>
            </li>
          )}
        </ul>
      </nav>

      {/* User section */}
      <div className="px-3 pb-4 border-t border-[#FFC300]/10 pt-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl">
          {/* Avatar */}
          {user?.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={user.firstName ?? 'User'}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-[#FFC300]/20 shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#FFC300]/15 flex items-center justify-center ring-2 ring-[#FFC300]/20 shrink-0">
              <span className="text-[#FFC300] text-sm font-bold">
                {user?.firstName?.[0]?.toUpperCase() ?? '?'}
              </span>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate leading-tight">
              {user?.fullName ?? user?.firstName ?? 'User'}
            </p>
            <p className="text-white/35 text-xs truncate leading-tight mt-0.5">
              Beehive Books
            </p>
          </div>

          <div className="flex items-center gap-1">
            <Link
              href="/settings/profile"
              title="Settings"
              className="p-1.5 rounded-lg text-white/35 hover:text-[#FFC300] hover:bg-[#FFC300]/10 transition-all duration-200"
            >
              <Settings className="w-4 h-4" />
            </Link>
            <button
              onClick={() => signOut({ redirectUrl: '/' })}
              title="Sign out"
              className="p-1.5 rounded-lg text-white/35 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </aside>
  );
}
