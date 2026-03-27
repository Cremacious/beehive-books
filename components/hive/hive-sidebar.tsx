'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ListTree,
  BookOpen,
  Users,
  Sparkles,
  Settings,
  MessageCircle,
  MessageSquare,
  Target,
  Trophy,
  ChevronLeft,
  Upload,
  Pencil,
} from 'lucide-react';
import type { HiveWithMembership, HiveUser } from '@/lib/types/hive.types';

const NAV_ITEMS = [
  { href: '', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/outline', label: 'Outline', icon: ListTree },
  { href: '/wiki', label: 'Wiki', icon: BookOpen },
  { href: '/comments', label: 'Annotations', icon: MessageCircle },
  { href: '/word-goals', label: 'Word Goals', icon: Target },
  { href: '/buzz', label: 'Buzz Board', icon: Sparkles },
  { href: '/milestones', label: 'Milestones', icon: Trophy },
  { href: '/members', label: 'Members', icon: Users },
  { href: '/submissions', label: 'Submissions', icon: Upload },
  { href: '/suggest', label: 'Suggest', icon: Pencil },
  { href: '/forum', label: 'Forum', icon: MessageSquare },
] as const;

interface HiveSidebarProps {
  hiveId: string;
  isOwner: boolean;
  hive: HiveWithMembership;
  topMembers: HiveUser[];
  onNavClick?: () => void;
  pendingSubmissionCount?: number;
  pendingSuggestionCount?: number;
}

export default function HiveSidebar({
  hiveId,
  isOwner,
  hive,
  topMembers,
  onNavClick,
  pendingSubmissionCount = 0,
  pendingSuggestionCount = 0,
}: HiveSidebarProps) {
  const pathname = usePathname();
  const base = `/hive/${hiveId}`;

  const isActive = (suffix: string) => {
    const full = base + suffix;
    if (suffix === '') return pathname === base;
    return pathname.startsWith(full);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Back to Hives */}
      <Link
        href="/hive"
        onClick={onNavClick}
        className="flex items-center gap-1.5 px-3 py-2 mb-2 text-sm text-white hover:text-white transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Hives
      </Link>

      {/* Hive name + genre */}
      <div className="mb-6">
        <h2 className="text-white font-semibold text-base leading-snug mb-2">{hive.name}</h2>
        {hive.genre && (
          <span className="inline-block text-xs text-white/80 bg-white/10 rounded-full px-2.5 py-0.5">
            {hive.genre}
          </span>
        )}
      </div>

      {/* Member avatar stack + count */}
      {topMembers.length > 0 && (
        <div className="mb-6">
          <div className="flex -space-x-2 mb-1.5">
            {topMembers.slice(0, 5).map((m) => (
              <div
                key={m.id}
                className="w-6 h-6 rounded-full ring-2 ring-[#1a1a1a] overflow-hidden bg-[#252525] shrink-0"
              >
                {m.image ? (
                  <Image
                    src={m.image}
                    alt={m.username ?? 'member'}
                    width={24}
                    height={24}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] font-medium text-white/80">
                    {(m.username ?? '?')[0].toUpperCase()}
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-white/80">
            {hive.memberCount} member{hive.memberCount !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Nav links */}
      <nav className="flex flex-col gap-0.5 flex-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          const showBadge =
            (href === '/submissions' && pendingSubmissionCount > 0) ||
            (href === '/suggest' && pendingSuggestionCount > 0);
          const badgeCount = href === '/submissions' ? pendingSubmissionCount : pendingSuggestionCount;
          return (
            <Link
              key={href}
              href={`${base}${href}`}
              onClick={onNavClick}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-yellow-500/15 text-yellow-500'
                  : 'text-white hover:text-white/80 hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
              {showBadge && (
                <span className="ml-auto text-xs font-bold bg-yellow-500 text-black rounded-full px-1.5 py-0.5 leading-none">
                  {badgeCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Settings pinned to bottom for owner */}
      {isOwner && (
        <div className="mt-4 pt-4 border-t border-[#2a2a2a]">
          <Link
            href={`${base}/settings`}
            onClick={onNavClick}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/settings')
                ? 'bg-yellow-500/15 text-yellow-500'
                : 'text-white/80 hover:text-white hover:bg-white/5'
            }`}
          >
            <Settings className="w-4 h-4 shrink-0" />
            Settings
          </Link>
        </div>
      )}
    </div>
  );
}
