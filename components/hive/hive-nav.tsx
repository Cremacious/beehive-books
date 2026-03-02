'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ListTree,
  BookOpen,
  Users,
  Trophy,
  Sparkles,
  Settings,
  MessageCircle,
  Target,
  Lightbulb,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/outline', label: 'Outline', icon: ListTree },
  { href: '/wiki', label: 'Wiki', icon: BookOpen },
  // { href: '/chapters', label: 'Chapters', icon: BookMarked },
  // { href: '/beta', label: 'Beta', icon: FlaskConical },
  { href: '/comments', label: 'Annotations', icon: MessageCircle },
  // { href: '/history', label: 'History', icon: History },
  // { href: '/style-guide', label: 'Style Guide', icon: FileText },
  { href: '/word-goals', label: 'Word Goals', icon: Target },
  { href: '/milestones', label: 'Milestones', icon: Trophy },
  // { href: '/sprint', label: 'Sprint', icon: Timer },
  // { href: '/polls', label: 'Polls', icon: VoteIcon },
  // { href: '/chat', label: 'Chat', icon: MessageSquare },
  { href: '/buzz', label: 'Buzz Board', icon: Sparkles },
  { href: '/members', label: 'Members', icon: Users },
  // { href: '/activity', label: 'Activity', icon: Activity },
  // { href: '/timeline', label: 'Timeline', icon: Clock },
  // { href: '/character-map', label: 'Characters', icon: Network },
  { href: '/prompts', label: 'Prompts', icon: Lightbulb },
] as const;

interface HiveNavProps {
  hiveId: string;
  isOwner: boolean;
}

export default function HiveNav({ hiveId, isOwner }: HiveNavProps) {
  const pathname = usePathname();
  const base = `/hive/${hiveId}`;

  const isActive = (suffix: string) => {
    const full = base + suffix;
    if (suffix === '') return pathname === base;
    return pathname.startsWith(full);
  };

  return (
    <nav className="flex gap-1 flex-wrap border-b border-[#2a2a2a] pb-3 mb-6">
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
    </nav>
  );
}
