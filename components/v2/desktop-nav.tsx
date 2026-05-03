'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { signOut, useSession } from '@/lib/auth-client';
import { useCurrentUserImage } from '@/hooks/use-current-user-image';
import { cn } from '@/lib/utils';
import { v2PrimaryNavItems } from '@/lib/v2/navigation';
import logoImage from '@/public/logo3.png';

type V2DesktopNavProps = {
  isAdmin?: boolean;
};

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC300]/40 focus-visible:ring-offset-1 focus-visible:ring-offset-[#181818]';

export function V2DesktopNav({ isAdmin = false }: V2DesktopNavProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const avatarUrl = useCurrentUserImage();
  const username = session?.user?.username ?? undefined;
  const profileHref = `/u/${username ?? session?.user?.id ?? ''}`;
  const isAdminActive = pathname.startsWith('/admin');

  return (
    <aside className="hidden md:flex h-full w-20 lg:w-72 shrink-0 flex-col border-r border-[#2a2a2a] bg-[#181818] paper-grit">
      <div className="flex h-full flex-col px-3 py-4">
        <Link
          href="/home"
          className={cn(
            'mb-6 flex items-center justify-center rounded-xl lg:justify-start lg:px-2',
            focusRing,
          )}
        >
          <Image
            src={logoImage}
            alt="Beehive Books"
            height={42}
            width={168}
            priority
            className="hidden lg:block"
          />
          <span className="lg:hidden text-[#FFC300] mainFont text-xl font-bold">BB</span>
        </Link>

        <nav aria-label="Main navigation" className="flex-1">
          <ul className="space-y-2">
            {v2PrimaryNavItems.map(({ href, label, icon: Icon, match }) => {
              const active = match(pathname);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-label={label}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex min-h-11 items-center justify-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-all lg:justify-start',
                      focusRing,
                      active
                        ? 'bg-[#FFC300] text-black paper-stack'
                        : 'text-white/80 hover:bg-white/5 hover:text-white',
                    )}
                  >
                    <Icon aria-hidden="true" className="h-5 w-5 shrink-0" />
                    <span className="hidden lg:inline">{label}</span>
                  </Link>
                </li>
              );
            })}
            {isAdmin && (
              <li>
                <Link
                  href="/admin"
                  aria-label="Admin"
                  aria-current={isAdminActive ? 'page' : undefined}
                  className={cn(
                    'flex min-h-11 items-center justify-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-all lg:justify-start',
                    focusRing,
                    isAdminActive
                      ? 'bg-[#FFC300] text-black paper-stack'
                      : 'text-white/80 hover:bg-white/5 hover:text-white',
                  )}
                >
                  <span aria-hidden="true" className="h-2 w-2 rounded-full bg-current" />
                  <span className="hidden lg:inline">Admin</span>
                </Link>
              </li>
            )}
          </ul>
        </nav>

        <div className="border-t border-[#2a2a2a] pt-3">
          <Link
            href={profileHref}
            aria-label={username ? `View ${username}'s profile` : 'View profile'}
            className={cn(
              'mb-2 flex min-h-11 items-center justify-center gap-3 rounded-xl px-2 py-2 text-white/90 hover:bg-white/5 lg:justify-start',
              focusRing,
            )}
          >
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={username ?? 'User'}
                width={36}
                height={36}
                className="h-9 w-9 rounded-full object-cover ring-2 ring-[#FFC300]/20"
              />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFC300]/15 text-sm font-bold text-[#FFC300] ring-2 ring-[#FFC300]/20">
                {username?.[0]?.toUpperCase() ?? '?'}
              </span>
            )}
            <span className="hidden min-w-0 truncate text-sm font-semibold lg:inline">
              {username ?? 'Profile'}
            </span>
          </Link>
          <button
            type="button"
            aria-label="Sign out"
            onClick={() =>
              signOut({
                fetchOptions: {
                  onSuccess: () => {
                    window.location.href = '/';
                  },
                },
              })
            }
            className={cn(
              'flex min-h-11 w-full items-center justify-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-white/70 transition-all hover:bg-white/5 hover:text-white lg:justify-start',
              focusRing,
            )}
          >
            <LogOut aria-hidden="true" className="h-5 w-5" />
            <span className="hidden lg:inline">Sign out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
