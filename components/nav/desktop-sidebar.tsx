'use client';

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
  Settings,
  LogOut,
  Hexagon,
  ShieldCheck,
  MessageSquarePlus,
  Search,
} from 'lucide-react';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { UserSkeleton } from '@/components/ui/skeleton';
import { useTranslations } from 'next-intl';
import logoImage from '@/public/logo3.png';

export function DesktopSidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const user = session?.user;
  const username = session?.user?.username ?? undefined;
  const avatarUrl = useCurrentUserImage();

  const navItems = [
    { href: '/home', label: t('home'), icon: Home },
    { href: '/explore', label: t('explore'), icon: Compass },
    { href: '/library', label: t('library'), icon: Library },
    { href: '/hive', label: t('hives'), icon: Hexagon },
    { href: '/clubs', label: t('clubs'), icon: Users },
    { href: '/sparks', label: t('prompts'), icon: Lightbulb },
    { href: '/reading-lists', label: t('readingLists'), icon: BookMarked },
    { href: '/friends', label: t('friends'), icon: Users2 },
  ] as const;

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  return (
    <aside aria-label={t('mainNavigation')} className="hidden md:flex flex-col md:w-20 lg:w-64 xl:w-72 2xl:w-80 h-full bg-[#252525] border-r border-[#2a2a2a] z-40 shrink-0 overflow-y-auto">
      <div className="flex flex-col min-h-full w-full xl:max-w-65 xl:ml-auto 2xl:max-w-70">
        <div className="flex items-center md:justify-center lg:justify-start px-4 xl:px-5 pt-3 pb-6">
          <Image
            src={logoImage}
            alt="Beehive Books"
            height={50}
            width={200}
            className="hidden lg:block"
            priority
          />
        </div>

        <div className="px-2 xl:px-3 py-1">
          <NotificationBell
            panelPosition="right"
            className="w-full flex items-center justify-center py-1.5 rounded-2xl bg-yellow-500/10 border-2 border-yellow-500/30 text-[#FFC300] hover:bg-yellow-500/15 transition-colors cursor-pointer"
          />
        </div>

        {/* <div className="px-2 xl:px-3 pb-1">
          <Link
            href="/search"
            aria-label="Search"
            aria-current={isActive('/search') ? 'page' : undefined}
            className={`flex items-center md:justify-center lg:justify-start gap-4 md:p-2 lg:px-4 lg:py-1.5 rounded-2xl text-[15px] font-semibold transition-all duration-150 ${
              isActive('/search')
                ? 'text-[#FFC300]'
                : 'text-white/90 hover:text-white hover:bg-white/5'
            }`}
          >
            <Search
              aria-hidden="true"
              className="w-5.5 h-5.5 shrink-0"
              strokeWidth={isActive('/search') ? 2.5 : 1.75}
            />
            <span className="hidden lg:block" aria-hidden="true">Search</span>
          </Link>
        </div> */}

        <nav className="flex-1 px-2 xl:px-3 py-1 min-h-0">
          <ul className="space-y-1 flex flex-col md:items-center lg:items-stretch">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-label={label}
                    aria-current={active ? 'page' : undefined}
                    className={`flex items-center md:justify-center lg:justify-start gap-4 md:p-2 lg:px-4 lg:py-1.5 rounded-2xl text-[15px] font-semibold transition-all duration-150 ${
                      active
                        ? 'text-[#FFC300]'
                        : 'text-white/90 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon
                      aria-hidden="true"
                      className="w-5.5 h-5.5 shrink-0"
                      strokeWidth={active ? 2.5 : 1.75}
                    />
                    <span className="hidden lg:block" aria-hidden="true">{label}</span>
                  </Link>
                </li>
              );
            })}

            {user && (
              <li>
                <Link
                  href={`/u/${username ?? user.id}`}
                  aria-label="Profile"
                  aria-current={isActive('/u') ? 'page' : undefined}
                  className={`flex items-center md:justify-center lg:justify-start gap-4 md:p-3 lg:px-4 lg:py-2 rounded-2xl text-[15px] font-semibold transition-all duration-150 ${
                    isActive('/u')
                      ? 'text-[#FFC300] bg-[#FFC300]/8'
                      : 'text-white/90 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <User
                    aria-hidden="true"
                    className="w-5.5 h-5.5 shrink-0"
                    strokeWidth={isActive('/u') ? 2.5 : 1.75}
                  />
                  <span className="hidden lg:block" aria-hidden="true">{t('profile')}</span>
                </Link>
              </li>
            )}

            {isAdmin && (
              <li>
                <Link
                  href="/admin"
                  aria-label="Admin"
                  aria-current={isActive('/admin') ? 'page' : undefined}
                  className={`flex items-center md:justify-center lg:justify-start gap-4 md:p-3 lg:px-4 lg:py-2 rounded-2xl text-[15px] font-semibold transition-all duration-150 ${
                    isActive('/admin')
                      ? 'text-[#FFC300] bg-[#FFC300]/8'
                      : 'text-white/90 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <ShieldCheck
                    aria-hidden="true"
                    className="w-5.5 h-5.5 shrink-0"
                    strokeWidth={isActive('/admin') ? 2.5 : 1.75}
                  />
                  <span className="hidden lg:block" aria-hidden="true">{t('admin')}</span>
                </Link>
              </li>
            )}
          </ul>
        </nav>

        <div className="px-2 xl:px-3 pb-2 pt-1">
          <Link
            href="/feedback"
            aria-label="Send Feedback"
            aria-current={isActive('/feedback') ? 'page' : undefined}
            className={`flex items-center md:justify-center lg:justify-start gap-2 md:p-3 lg:px-4 lg:py-2 rounded-2xl text-xs font-semibold transition-all duration-150 ${
              isActive('/feedback')
                ? 'text-[#FFC300]'
                : 'text-white/90 hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageSquarePlus
              aria-hidden="true"
              className="w-3.5 h-3.5 shrink-0"
              strokeWidth={isActive('/feedback') ? 2.5 : 1.75}
            />
            <span className="hidden lg:block mb-0.5" aria-hidden="true">Send Feedback</span>
          </Link>
        </div>

        <div className="px-2 xl:px-3 pb-3 pt-2 border-t border-[#2a2a2a]">
          {isPending ? (
            <UserSkeleton />
          ) : (
            <div className="flex items-center md:justify-center lg:justify-start gap-3 px-2 py-2 rounded-2xl hover:bg-white/5 transition-all">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={username ?? 'User'}
                  width={38}
                  height={38}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-[#FFC300]/20 shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#FFC300]/15 flex items-center justify-center ring-2 ring-[#FFC300]/20 shrink-0">
                  <span className="text-[#FFC300] text-sm font-bold">
                    {username?.[0]?.toUpperCase() ?? '?'}
                  </span>
                </div>
              )}

              <div className="hidden lg:block flex-1 min-w-0">
                <p className="text-white/90 font-semibold truncate leading-tight">
                  {username ?? 'User'}
                </p>
              </div>

              <div className="hidden lg:flex items-center gap-0.5 shrink-0">
                <Link
                  href="/settings"
                  aria-label={t('settings')}
                  className="p-1.5 rounded-lg text-white/90 hover:text-[#FFC300] hover:bg-[#FFC300]/10 transition-all"
                >
                  <Settings aria-hidden="true" className="w-5 h-5" />
                </Link>
                <button
                  type="button"
                  data-testid="sign-out-button"
                  onClick={() => signOut({ fetchOptions: { onSuccess: () => { window.location.href = '/'; } } })}
                  aria-label={t('signOut')}
                  className="p-1.5 rounded-lg text-white/90 hover:text-red-400 hover:bg-red-400/10 transition-all"
                >
                  <LogOut aria-hidden="true" className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
