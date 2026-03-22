'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef, useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ListTree,
  BookOpen,
  Users,
  Sparkles,
  Settings,
  Target,
  ChevronDown,
  Check,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/outline', label: 'Outline', icon: ListTree },
  { href: '/wiki', label: 'Wiki', icon: BookOpen },
  { href: '/word-goals', label: 'Word Goals', icon: Target },
  { href: '/buzz', label: 'Buzz Board', icon: Sparkles },
  { href: '/members', label: 'Members', icon: Users },
] as const;

interface HiveNavProps {
  hiveId: string;
  isOwner: boolean;
}

export default function HiveNav({ hiveId, isOwner }: HiveNavProps) {
  const pathname = usePathname();
  const base = `/hive/${hiveId}`;
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (suffix: string) => {
    const full = base + suffix;
    if (suffix === '') return pathname === base;
    return pathname.startsWith(full);
  };

  const allItems = [
    ...NAV_ITEMS,
    ...(isOwner ? [{ href: '/settings', label: 'Settings', icon: Settings } as const] : []),
  ];

  const currentItem =
    allItems.find((item) => isActive(item.href)) ?? allItems[0];

 
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <nav className="border-b border-[#2a2a2a] pb-3 mb-6">
    
      <div className="relative sm:hidden" ref={dropdownRef}>
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-[#252525] border border-[#2a2a2a] text-sm font-medium text-white"
        >
          <span className="flex items-center gap-2">
            <currentItem.icon className="w-4 h-4 text-[#FFC300]" />
            {currentItem.label}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-white/80 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </button>

        {open && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-xl bg-[#252525] border border-[#2a2a2a] shadow-xl overflow-hidden">
            {allItems.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={`${base}${href}`}
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between gap-3 px-4 py-3 text-sm font-medium transition-colors border-b border-[#2a2a2a] last:border-0 ${
                    active
                      ? 'text-[#FFC300] bg-[#FFC300]/8'
                      : 'text-white hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${active ? 'text-[#FFC300]' : 'text-white/80'}`} />
                    {label}
                  </span>
                  {active && <Check className="w-3.5 h-3.5 text-[#FFC300]" />}
                </Link>
              );
            })}
          </div>
        )}
      </div>

    
      <div className="hidden sm:flex gap-1 flex-wrap">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={`${base}${href}`}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                active
                  ? 'bg-[#FFC300]/15 text-[#FFC300]'
                  : 'border border-white/20 bg-transparent text-white hover:border-[#FFC300]/50 hover:text-[#FFC300] hover:bg-[#FFC300]/8 cursor-pointer'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </Link>
          );
        })}

        {isOwner && (
          <Link
            href={`${base}/settings`}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ml-auto ${
              pathname.startsWith(`${base}/settings`)
                ? 'bg-[#FFC300]/15 text-[#FFC300]'
                : 'border border-white/20 bg-transparent text-white hover:border-[#FFC300]/50 hover:text-[#FFC300] hover:bg-[#FFC300]/8 cursor-pointer'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            Settings
          </Link>
        )}
      </div>
    </nav>
  );
}
