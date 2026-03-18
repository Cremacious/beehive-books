'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  BookText,
  MessageSquare,
  Lightbulb,
  Bell,
  Layers,
  Megaphone,
  Flag,
} from 'lucide-react';

const links = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/books', label: 'Books', icon: BookOpen },
  { href: '/admin/chapters', label: 'Chapters', icon: BookText },
  { href: '/admin/clubs', label: 'Clubs', icon: Layers },
  { href: '/admin/discussions', label: 'Discussions', icon: MessageSquare },
  { href: '/admin/prompts', label: 'Prompts', icon: Lightbulb },
  { href: '/admin/announcements', label: 'Announcements', icon: Megaphone },
  { href: '/admin/feature-flags', label: 'Feature Flags', icon: Flag },
  { href: '/admin/notifications', label: 'Notifications', icon: Bell },
];

export default function AdminMobileNav() {
  const pathname = usePathname();
  const router = useRouter();

  const current =
    links.find(({ href, exact }) =>
      exact ? pathname === href : pathname === href || pathname.startsWith(href + '/'),
    ) ?? links[0];

  const CurrentIcon = current.icon;

  return (
    <div className="md:hidden px-4 py-3 border-b border-[#2a2a2a] bg-[#1a1a1a] sticky top-0 z-10">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#FFC300]/60">
          Admin Panel
        </span>
      </div>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
          <CurrentIcon className="w-4 h-4 text-[#FFC300]" />
        </div>
        <select
          value={current.href}
          onChange={(e) => router.push(e.target.value)}
          className="w-full appearance-none pl-9 pr-8 py-2.5 rounded-xl bg-[#252525] border border-[#2a2a2a] text-sm font-medium text-white focus:outline-none focus:border-[#FFC300]/40 cursor-pointer"
        >
          {links.map(({ href, label }) => (
            <option key={href} value={href} className="bg-[#252525]">
              {label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
