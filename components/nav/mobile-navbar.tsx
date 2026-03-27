'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from '@/lib/auth-client';
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
  Menu,
  X,
  Settings,
  LogOut,
  Hexagon,
  ShieldCheck,
  MessageSquarePlus,
  Search,
} from 'lucide-react';
import { NotificationBell } from '@/components/notifications/notification-bell';
import logoImage from '@/public/logo3.png';
import { useTranslations } from 'next-intl';

export function MobileNavbar({ isAdmin = false }: { isAdmin?: boolean }) {
  const t = useTranslations('nav');
  const tc = useTranslations('common');
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
  const username = session?.user?.username ?? undefined;

  const navItems = [
    { href: '/home', label: t('home'), icon: Home },
    { href: '/explore', label: t('explore'), icon: Compass },
    { href: '/library', label: t('library'), icon: Library },
    { href: '/hive', label: t('hives'), icon: Hexagon },
    { href: '/clubs', label: t('clubs'), icon: Users },
    { href: '/prompts', label: t('prompts'), icon: Lightbulb },
    { href: '/reading-lists', label: t('readingLists'), icon: BookMarked },
    { href: '/friends', label: t('friends'), icon: Users2 },
  ] as const;

  const [drawerOpen, setDrawerOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  const closeDrawer = () => setDrawerOpen(false);

  const avatarHref = `/u/${username ?? user?.id ?? ''}`;
  const avatarUrl = useCurrentUserImage();

  return (
    <>
      <header role="banner" className="fixed top-0 left-0 right-0 z-50 md:hidden h-14 bg-[#252525]/95 backdrop-blur-md border-b border-[#2a2a2a] flex items-center justify-between px-4 shadow-lg">
        <Link href="/home" className="flex items-center shrink-0">
          <Image
            src={logoImage}
            alt="Beehive Books"
            height={32}
            width={120}
            priority
          />
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/search"
            aria-label="Search"
            className="p-2 rounded-full text-yellow-500 hover:text-white hover:bg-white/8 active:bg-white/10 transition-all flex items-center justify-center"
          >
            <Search aria-hidden="true" className="w-5 h-5" />
          </Link>

          <NotificationBell
            panelPosition="below"
            className="p-2 rounded-full text-yellow-500 hover:text-white hover:bg-white/8 active:bg-white/10 transition-all flex items-center justify-center"
          />

          <Link href={avatarHref} aria-label={`${username ?? 'User'} profile`} className="p-1">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={username ?? 'User'}
                width={30}
                height={30}
                className="w-7.5 h-7.5 rounded-full object-cover ring-2 ring-[#FFC300]/25"
              />
            ) : (
              <div className="w-7.5 h-7.5 rounded-full bg-[#FFC300]/15 flex items-center justify-center ring-2 ring-[#FFC300]/25">
                <span className="text-[#FFC300] text-xs font-bold">
                  {username?.[0]?.toUpperCase() ?? ' '}
                </span>
              </div>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-full text-yellow-500 hover:text-white hover:bg-white/8 active:bg-white/10 transition-all"
            aria-label={tc('openMenu')}
            aria-expanded={drawerOpen}
            aria-controls="mobile-drawer"
          >
            <Menu aria-hidden="true" className="w-6 h-6" />
          </button>
        </div>
      </header>

      <div
        aria-hidden="true"
        className={`fixed inset-0 z-60 bg-black/60 backdrop-blur-[2px] md:hidden transition-opacity duration-300 ${
          drawerOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeDrawer}
      />

      <div
        id="mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-label={tc('siteNavigation')}
        className={`fixed top-0 right-0 z-70 h-full w-72 bg-[#252525] border-l border-[#2a2a2a] shadow-2xl flex flex-col md:hidden transition-transform duration-300 ease-out ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2a]">
          <Image src={logoImage} alt="Beehive Books" height={32} width={120} />
          <button
            type="button"
            onClick={closeDrawer}
            className="p-1.5 rounded-full text-yellow-500 hover:text-white hover:bg-white/8 transition-all"
            aria-label={tc('closeMenu')}
          >
            <X aria-hidden="true" className="w-5 h-5" />
          </button>
        </div>

        {user && (
          <Link
            href={avatarHref}
            onClick={closeDrawer}
            className="flex items-center gap-3 px-4 py-3  hover:bg-white/5 transition-all"
          >
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={username ?? 'User'}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-[#FFC300]/20 shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#FFC300]/15 flex items-center justify-center ring-2 ring-[#FFC300]/20 shrink-0">
                <span className="text-[#FFC300] text-sm font-bold">
                  {username?.[0]?.toUpperCase() ?? '?'}
                </span>
              </div>
            )}
            <div className="min-w-0">
              <p className="text-white font-semibold truncate leading-tight">
                {username ?? 'User'}
              </p>
            </div>
          </Link>
        )}

        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-1.5">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={closeDrawer}
                  aria-current={active ? 'page' : undefined}
                  className={`flex flex-col items-center justify-center gap-1.5 px-2 py-3 rounded-2xl text-xs font-semibold transition-all ${
                    active
                      ? 'text-[#FFC300] bg-[#FFC300]/8'
                      : 'text-white/80 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon
                    aria-hidden="true"
                    className="w-5 h-5 shrink-0"
                    strokeWidth={active ? 2.5 : 1.75}
                  />
                  {label}
                </Link>
              );
            })}

            {user && (
              <Link
                href={avatarHref}
                onClick={closeDrawer}
                className={`flex flex-col items-center justify-center gap-1.5 px-2 py-3.5 rounded-2xl text-xs font-semibold transition-all ${
                  isActive('/u')
                    ? 'text-[#FFC300] bg-[#FFC300]/8'
                    : 'text-white/80 hover:text-white hover:bg-white/5'
                }`}
              >
                <User
                  className="w-5 h-5 shrink-0"
                  strokeWidth={isActive('/u') ? 2.5 : 1.75}
                />
                {t('profile')}
              </Link>
            )}

            {isAdmin && (
              <Link
                href="/admin"
                onClick={closeDrawer}
                className={`flex flex-col items-center justify-center gap-1.5 px-2 py-3.5 rounded-2xl text-xs font-semibold transition-all ${
                  isActive('/admin')
                    ? 'text-[#FFC300] bg-[#FFC300]/8'
                    : 'text-white/80 hover:text-white hover:bg-white/5'
                }`}
              >
                <ShieldCheck
                  className="w-5 h-5 shrink-0"
                  strokeWidth={isActive('/admin') ? 2.5 : 1.75}
                />
                {t('admin')}
              </Link>
            )}
          </div>
        </nav>

        <div className="px-3 pb-1 pt-1">
          <Link
            href="/feedback"
            onClick={closeDrawer}
            className={`flex items-center gap-1 px-4 py-1 rounded-2xl text-xs font-semibold transition-all ${
              isActive('/feedback')
                ? 'text-[#FFC300] bg-[#FFC300]/8'
                : 'text-white/80 hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageSquarePlus
              className="w-3.5 h-3.55 shrink-0"
              strokeWidth={isActive('/feedback') ? 2.5 : 1.75}
            />
            Send Feedback
          </Link>
        </div>

        <div className="px-3 pb-8 pt-1 border-t border-[#2a2a2a]">
          <div className="flex gap-2">
            <Link
              href="/settings"
              onClick={closeDrawer}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white hover:text-[#FFC300] hover:bg-[#FFC300]/8 border border-[#2a2a2a] hover:border-[#FFC300]/30 transition-all"
            >
              <Settings className="w-4 h-4" />
              {t('settings')}
            </Link>
            <button
              onClick={() => {
                signOut({ fetchOptions: { onSuccess: () => { window.location.href = '/'; } } });
                closeDrawer();
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white hover:text-red-400 hover:bg-red-400/10 border border-[#2a2a2a] hover:border-red-400/20 transition-all"
            >
              <LogOut className="w-4 h-4" />
              {t('signOut')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
