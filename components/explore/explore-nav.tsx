'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, Users, Hexagon, Lightbulb, List, Compass, ChevronDown, Check } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Discover', href: '/explore', icon: Compass, exact: true },
  { label: 'Books', href: '/explore/books', icon: BookOpen, exact: false },
  { label: 'Clubs', href: '/explore/clubs', icon: Users, exact: false },
  { label: 'Hives', href: '/explore/hives', icon: Hexagon, exact: false },
  { label: 'Sparks', href: '/explore/sparks', icon: Lightbulb, exact: false },
  { label: 'Reading Lists', href: '/explore/reading-lists', icon: List, exact: false },
];

function isItemActive(pathname: string, href: string, exact: boolean) {
  // Strip locale prefix so /en/explore/books matches /explore/books
  const stripped = pathname.replace(/^\/(en|es|fr|de|pt)(?=\/|$)/, '') || '/';
  return exact ? stripped === href : stripped.startsWith(href);
}

export function ExploreNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const active = NAV_ITEMS.find(({ href, exact }) => isItemActive(pathname, href, exact)) ?? NAV_ITEMS[0];
  const ActiveIcon = active.icon;

  return (
    <nav className="border-b border-[#2a2a2a] bg-[#1a1a1a] sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 md:px-8">

        {/* ── Mobile dropdown ── */}
        <div className="md:hidden py-2 relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-[#252525] border border-[#2a2a2a] text-white text-sm font-medium"
          >
            <span className="flex items-center gap-2">
              <ActiveIcon className="w-4 h-4 text-[#FFC300]" />
              {active.label}
            </span>
            <ChevronDown className={`w-4 h-4 text-white/50 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
          </button>

          {open && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setOpen(false)}
              />
              {/* Dropdown panel */}
              <div className="absolute left-0 right-0 z-20 mt-1.5 rounded-xl bg-[#252525] border border-[#2a2a2a] shadow-2xl overflow-hidden">
                {NAV_ITEMS.map(({ label, href, icon: Icon, exact }) => {
                  const itemActive = isItemActive(pathname, href, exact);
                  return (
                    <button
                      key={href}
                      onClick={() => {
                        router.push(href);
                        setOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors ${
                        itemActive
                          ? 'text-[#FFC300] bg-[#FFC300]/8'
                          : 'text-white/80 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="w-4 h-4 shrink-0" />
                        {label}
                      </span>
                      {itemActive && <Check className="w-4 h-4 text-[#FFC300]" />}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* ── Desktop tab row ── */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(({ label, href, icon: Icon, exact }) => {
            const itemActive = isItemActive(pathname, href, exact);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  itemActive
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
