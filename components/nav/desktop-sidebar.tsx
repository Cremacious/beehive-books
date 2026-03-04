'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import { useCurrentUserImage } from '@/hooks/use-current-user-image';
import {
  Home,
  Compass,
  Library,
  Users,
  Users2,
  Lightbulb,
  BookMarked,
  User,
  Settings,
  LogOut,
  Hexagon,
} from 'lucide-react';
import { NotificationBell } from '@/components/notifications/notification-bell';
const navItems = [
  { href: '/home',          label: 'Feed',          icon: Home },
  { href: '/explore',       label: 'Explore',       icon: Compass },
  { href: '/library',       label: 'Library',       icon: Library },
  { href: '/hive',          label: 'Hives',          icon: Hexagon },
  { href: '/clubs',         label: 'Clubs',         icon: Users },
  { href: '/prompts',       label: 'Prompts',       icon: Lightbulb },
  { href: '/reading-lists', label: 'Reading Lists', icon: BookMarked },
  { href: '/friends',       label: 'Friends',       icon: Users2 },
] as const;
import logoImage from '@/public/logo.png'

export function DesktopSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { signOut } = useClerk();
  const dbUsername = user?.publicMetadata?.username as string | undefined;
  const avatarUrl = useCurrentUserImage();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  return (
    <aside className="hidden md:flex flex-col md:w-20 lg:w-64 xl:w-72 2xl:w-80 h-screen sticky top-0 bg-[#252525] border-r border-[#2a2a2a] z-40 shrink-0">
      <div className="flex flex-col h-full w-full xl:max-w-65 xl:ml-auto 2xl:max-w-70">

    
        <div className="flex items-center md:justify-center lg:justify-start px-4 xl:px-5 py-5">
          <Image
            src={logoImage}
            alt="Beehive Books"
            height={50}
            width={150200}
            className="hidden lg:block"
            priority
          />
        </div>

  
        <div className="px-2 xl:px-3 py-3">
          <NotificationBell
            panelPosition="right"
            className="w-full flex items-center justify-center py-2 rounded-2xl bg-yellow-500/10 border-2 border-yellow-500/30 text-[#FFC300] hover:bg-yellow-500/15 transition-colors cursor-pointer"
          />
        </div>

     
        <nav className="flex-1 px-2 xl:px-3 py-4 overflow-y-auto">
          <ul className="space-y-0.5 flex flex-col md:items-center lg:items-stretch">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`flex items-center md:justify-center lg:justify-start gap-4 md:p-3 lg:px-4 lg:py-3 rounded-2xl text-[15px] font-semibold transition-all duration-150 ${
                      active
                        ? 'text-[#FFC300]'
                        : 'text-white/90 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon
                      className="w-5.5 h-5.5 shrink-0"
                      strokeWidth={active ? 2.5 : 1.75}
                    />
                    <span className="hidden lg:block">{label}</span>
                  </Link>
                </li>
              );
            })}

            {user && (
              <li>
                <Link
                  href={`/u/${(user.publicMetadata?.username as string | undefined) ?? user.id}`}
                  className={`flex items-center md:justify-center lg:justify-start gap-4 md:p-3 lg:px-4 lg:py-3 rounded-2xl text-[15px] font-semibold transition-all duration-150 ${
                    isActive('/u')
                      ? 'text-[#FFC300]'
                      : 'text-white/90 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <User
                    className="w-5.5 h-5.5 shrink-0"
                    strokeWidth={isActive('/u') ? 2.5 : 1.75}
                  />
                  <span className="hidden lg:block">Profile</span>
                </Link>
              </li>
            )}
          </ul>
        </nav>

  
        <div className="px-2 xl:px-3 pb-4 pt-3 border-t border-[#2a2a2a]">
          <div className="flex items-center md:justify-center lg:justify-start gap-3 px-2 py-2 rounded-2xl hover:bg-white/5 transition-all">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={dbUsername ?? 'User'}
                width={38}
                height={38}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-[#FFC300]/20 shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#FFC300]/15 flex items-center justify-center ring-2 ring-[#FFC300]/20 shrink-0">
                <span className="text-[#FFC300] text-sm font-bold">
                  {dbUsername?.[0]?.toUpperCase() ?? '?'}
                </span>
              </div>
            )}

            <div className="hidden lg:block flex-1 min-w-0">
              <p className="text-white font-semibold truncate leading-tight">
                {dbUsername ?? 'User'}
              </p>
            </div>

            <div className="hidden lg:flex items-center gap-0.5 shrink-0">
              <Link
                href="/settings/profile"
                title="Settings"
                className="p-1.5 rounded-lg text-white hover:text-[#FFC300] hover:bg-[#FFC300]/10 transition-all"
              >
                <Settings className="w-5 h-5" />
              </Link>
              <button
                onClick={() => signOut({ redirectUrl: '/' })}
                title="Sign out"
                className="p-1.5 rounded-lg text-white hover:text-red-400 hover:bg-red-400/10 transition-all"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </aside>
  );
}
