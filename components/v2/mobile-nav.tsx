'use client';

import { type KeyboardEvent, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { v2PrimaryNavItems } from '@/lib/v2/navigation';
import logoImage from '@/public/logo3.png';

type V2MobileNavProps = {
  isAdmin?: boolean;
};

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC300]/40 focus-visible:ring-offset-1 focus-visible:ring-offset-[#181818]';

export function V2MobileNav({ isAdmin = false }: V2MobileNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const isAdminActive = pathname.startsWith('/admin');

  const closeDrawer = () => {
    setOpen(false);
    requestAnimationFrame(() => openButtonRef.current?.focus());
  };

  useEffect(() => {
    if (open) {
      closeButtonRef.current?.focus();
    }
  }, [open]);

  const handleDrawerKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeDrawer();
      return;
    }

    if (event.key !== 'Tab' || !drawerRef.current) {
      return;
    }

    const focusableElements = Array.from(
      drawerRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (!firstElement || !lastElement) {
      event.preventDefault();
      return;
    }

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
      return;
    }

    if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between border-b border-[#2a2a2a] bg-[#181818]/95 px-4 backdrop-blur md:hidden">
        <Link href="/home" className={cn('flex items-center rounded-xl', focusRing)}>
          <Image src={logoImage} alt="Beehive Books" height={32} width={120} priority />
        </Link>
        <button
          ref={openButtonRef}
          type="button"
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="v2-mobile-drawer"
          onClick={() => setOpen(true)}
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-xl text-[#FFC300] hover:bg-white/5 hover:text-white',
            focusRing,
          )}
        >
          <Menu aria-hidden="true" className="h-6 w-6" />
        </button>
      </header>

      {open && (
        <>
          <div
            aria-hidden="true"
            onClick={closeDrawer}
            className="fixed inset-0 z-60 bg-black/60 backdrop-blur-[2px] md:hidden"
          />

          <div
            ref={drawerRef}
            id="v2-mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            onKeyDown={handleDrawerKeyDown}
            className="fixed right-0 top-0 z-70 flex h-full w-76 max-w-[86vw] flex-col border-l border-[#2a2a2a] bg-[#181818] paper-grit shadow-2xl md:hidden"
          >
            <div className="flex items-center justify-between border-b border-[#2a2a2a] px-4 py-4">
              <Image src={logoImage} alt="Beehive Books" height={32} width={120} />
              <button
                ref={closeButtonRef}
                type="button"
                aria-label="Close menu"
                onClick={closeDrawer}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl text-[#FFC300] hover:bg-white/5 hover:text-white',
                  focusRing,
                )}
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>

            <nav aria-label="Main navigation" className="flex-1 px-3 py-4">
              <ul className="space-y-2">
                {v2PrimaryNavItems.map(({ href, label, icon: Icon, match }) => {
                  const active = match(pathname);
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        onClick={closeDrawer}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all',
                          focusRing,
                          active
                            ? 'bg-[#FFC300] text-black paper-stack'
                            : 'text-white/85 hover:bg-white/5 hover:text-white',
                        )}
                      >
                        <Icon aria-hidden="true" className="h-5 w-5" />
                        {label}
                      </Link>
                    </li>
                  );
                })}
                {isAdmin && (
                  <li>
                    <Link
                      href="/admin"
                      onClick={closeDrawer}
                      aria-current={isAdminActive ? 'page' : undefined}
                      className={cn(
                        'flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all',
                        focusRing,
                        isAdminActive
                          ? 'bg-[#FFC300] text-black paper-stack'
                          : 'text-white/85 hover:bg-white/5 hover:text-white',
                      )}
                    >
                      Admin
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
