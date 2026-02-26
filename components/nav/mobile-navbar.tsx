'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import {
  Home,
  Compass,
  Library,
  Users,
  Users2,
  Lightbulb,
  BookMarked,
  User,
  Menu,
  X,
  Settings,
  LogOut,
} from 'lucide-react';
import { NotificationBell } from '@/components/notifications/notification-bell';

const navItems = [
  { href: '/home',          label: 'Feed',          icon: Home },
  { href: '/explore',       label: 'Explore',       icon: Compass },
  { href: '/library',       label: 'Library',       icon: Library },
  { href: '/friends',       label: 'Friends',       icon: Users2 },
  { href: '/clubs',         label: 'Clubs',         icon: Users },
  { href: '/prompts',       label: 'Prompts',       icon: Lightbulb },
  { href: '/reading-lists', label: 'Reading Lists', icon: BookMarked },
] as const;

export function MobileNavbar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  const closeDrawer = () => setDrawerOpen(false);

  const dbUsername = user?.publicMetadata?.username as string | undefined;
  const avatarHref = `/u/${dbUsername ?? user?.id ?? ''}`;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 md:hidden h-14 bg-[#252525]/95 backdrop-blur-md border-b border-[#2a2a2a] flex items-center justify-between px-4 shadow-lg">
        <Link href="/home" className="flex items-center gap-2 shrink-0">
         
          <span className="text-white font-bold text-base tracking-tight mainFont">
            Beehive<span className="text-[#FFC300]">Books</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <NotificationBell
            panelPosition="below"
            className="p-2 rounded-full text-yellow-500 hover:text-white hover:bg-white/8 active:bg-white/10 transition-all flex items-center justify-center"
          />

          <Link href={avatarHref} className="p-1">
            {user?.imageUrl ? (
              <Image
                src={user.imageUrl}
                alt={dbUsername ?? 'User'}
                width={30}
                height={30}
                className="w-7.5 h-7.5 rounded-full object-cover ring-2 ring-[#FFC300]/25"
              />
            ) : (
              <div className="w-7.5 h-7.5 rounded-full bg-[#FFC300]/15 flex items-center justify-center ring-2 ring-[#FFC300]/25">
                <span className="text-[#FFC300] text-xs font-bold">
                  {dbUsername?.[0]?.toUpperCase() ?? '?'}
                </span>
              </div>
            )}
          </Link>

          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-full text-yellow-500 hover:text-white hover:bg-white/8 active:bg-white/10 transition-all"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-60 bg-black/60 backdrop-blur-[2px] md:hidden transition-opacity duration-300 ${
          drawerOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeDrawer}
      />

      <div
        className={`fixed top-0 right-0 z-70 h-full w-72 bg-[#252525] border-l border-[#2a2a2a] shadow-2xl flex flex-col md:hidden transition-transform duration-300 ease-out ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-base tracking-tight mainFont">
              Beehive<span className="text-[#FFC300]">Books</span>
            </span>
          </div>
          <button
            onClick={closeDrawer}
            className="p-1.5 rounded-full text-yellow-500 hover:text-white hover:bg-white/8 transition-all"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {user && (
          <Link
            href={avatarHref}
            onClick={closeDrawer}
            className="flex items-center gap-3 px-4 py-3 border-b border-[#2a2a2a] hover:bg-white/5 transition-all"
          >
            {user.imageUrl ? (
              <Image
                src={user.imageUrl}
                alt={dbUsername ?? 'User'}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-[#FFC300]/20 shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#FFC300]/15 flex items-center justify-center ring-2 ring-[#FFC300]/20 shrink-0">
                <span className="text-[#FFC300] text-sm font-bold">
                  {dbUsername?.[0]?.toUpperCase() ?? '?'}
                </span>
              </div>
            )}
            <div className="min-w-0">
              <p className="text-white font-semibold truncate leading-tight">
                {dbUsername ?? 'User'}
              </p>
             
            </div>
          </Link>
        )}

        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <ul className="space-y-0.5">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={closeDrawer}
                    className={`flex items-center gap-4 px-4 py-3 rounded-2xl text-[15px] font-semibold transition-all ${
                      active
                        ? 'text-[#FFC300]'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon
                      className="w-5.5 h-5.5 shrink-0"
                      strokeWidth={active ? 2.5 : 1.75}
                    />
                    {label}
                  </Link>
                </li>
              );
            })}

            {user && (
              <li>
                <Link
                  href={avatarHref}
                  onClick={closeDrawer}
                  className={`flex items-center gap-4 px-4 py-3 rounded-2xl text-[15px] font-semibold transition-all ${
                    isActive('/u')
                      ? 'text-[#FFC300]'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <User
                    className="w-5.5 h-5.5 shrink-0"
                    strokeWidth={isActive('/u') ? 2.5 : 1.75}
                  />
                  Profile
                </Link>
              </li>
            )}
          </ul>
        </nav>

        <div className="px-3 pb-8 pt-3 border-t border-[#2a2a2a]">
          <div className="flex gap-2">
            <Link
              href="/settings/profile"
              onClick={closeDrawer}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white hover:text-white hover:bg-white/75 border border-[#2a2a2a] hover:border-white/70 transition-all"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
            <button
              onClick={() => {
                signOut({ redirectUrl: '/' });
                closeDrawer();
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white hover:text-red-400 hover:bg-red-400/10 border border-[#2a2a2a] hover:border-red-400/20 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
