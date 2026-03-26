'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  BookText,
  MessageSquare,
  Lightbulb,
  // Bell,
  Layers,
  ChevronLeft,
  Megaphone,
  MessageSquarePlus,
  Hexagon,
  Flag,
  ScrollText,
} from 'lucide-react';

type NavLink = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  exact?: boolean;
  badge?: number;
};

const links: NavLink[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/books', label: 'Books', icon: BookOpen },
  { href: '/admin/chapters', label: 'Chapters', icon: BookText },
  { href: '/admin/clubs', label: 'Clubs', icon: Layers },
  { href: '/admin/hives', label: 'Hives', icon: Hexagon },
  { href: '/admin/discussions', label: 'Discussions', icon: MessageSquare },
  { href: '/admin/prompts', label: 'Prompts', icon: Lightbulb },
  { href: '/admin/reports', label: 'Reports', icon: Flag },
  { href: '/admin/audit-log', label: 'Audit Log', icon: ScrollText },
  { href: '/admin/announcements', label: 'Announcements', icon: Megaphone },
  { href: '/admin/feedback', label: 'Feedback', icon: MessageSquarePlus },
  // { href: '/admin/notifications', label: 'Notifications', icon: Bell },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/');

  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 h-screen sticky top-0 bg-[#1a1a1a] border-r border-[#2a2a2a]">
      <div className="px-4 py-5 border-b border-[#2a2a2a]">
        <h2 className="text-base font-bold text-white">Admin Panel</h2>
      </div>

      <nav className="flex-1 px-2 py-4 overflow-y-auto">
        <ul className="space-y-0.5">
          {links.map(({ href, label, icon: Icon, exact, badge }) => {
            const active = isActive(href, exact);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-[#FFC300]/10 text-[#FFC300]'
                      : 'text-white hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" strokeWidth={active ? 2.5 : 1.75} />
                  <span className="flex-1">{label}</span>
                  {badge != null && badge > 0 && (
                    <span className="ml-auto min-w-[18px] h-[18px] px-1 rounded-full bg-yellow-500/20 text-yellow-500 text-[10px] font-bold flex items-center justify-center">
                      {badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-2 pb-4">
        <Link
          href="/home"
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-yellow-500 hover:text-white hover:bg-white/5 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to app
        </Link>
      </div>
    </aside>
  );
}
