'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Globe,
  Lock,
  Users,
  Crown,
  Shield,
  Pencil,
  Eye,
  CheckCircle2,
  BookOpen,
  ListTree,
  Trophy,
  MessageSquare,
  Timer,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHiveStore } from '@/lib/stores/hive-store';
import type {
  HiveWithMembership,
  HiveMemberWithUser,
} from '@/lib/types/hive.types';

interface HiveDashboardProps {
  hive: HiveWithMembership;
  members: HiveMemberWithUser[];
  currentUserId: string | null;
}

const ROLE_LABELS = {
  OWNER: 'Owner',
  MODERATOR: 'Moderator',
  CONTRIBUTOR: 'Contributor',
  BETA_READER: 'Beta Reader',
} as const;

const QUICK_LINKS = [
  {
    href: '/outline',
    label: 'Outline Board',
    icon: ListTree,
    desc: 'Plan your story structure',
  },
  {
    href: '/wiki',
    label: 'World Wiki',
    icon: BookOpen,
    desc: 'Characters, places & lore',
  },
  {
    href: '/milestones',
    label: 'Milestones',
    icon: Trophy,
    desc: 'Track achievements',
  },
  {
    href: '/sprint',
    label: 'Sprint Mode',
    icon: Timer,
    desc: 'Timed writing sessions',
  },
  {
    href: '/chat',
    label: 'Hive Chat',
    icon: MessageSquare,
    desc: 'Discuss with your team',
  },
  {
    href: '/buzz',
    label: 'Buzz Board',
    icon: Sparkles,
    desc: 'Share inspiration',
  },
];

export default function HiveDashboard({
  hive,
  members,
}: HiveDashboardProps) {
  const store = useHiveStore();
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);

  const isOwner = hive.myRole === 'OWNER';
  const isMember = hive.isMember;

  const handleJoin = async () => {
    const result = await store.joinHive(hive.id);
    if (result.success) router.refresh();
  };

  const handleLeave = async () => {
    if (!confirm('Leave this hive?')) return;
    setLeaving(true);
    const result = await store.leaveHive(hive.id);
    if (result.success) {
      router.push('/hive');
    } else {
      setLeaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-3xl">🐝</span>
              <h1 className="text-2xl font-bold text-white">{hive.name}</h1>

              {hive.privacy === 'PUBLIC' ? (
                <span className="inline-flex items-center gap-1 text-xs text-green-400 bg-green-400/10 rounded-full px-2.5 py-1">
                  <Globe className="w-3 h-3" />
                  Public
                </span>
              ) : hive.privacy === 'FRIENDS' ? (
                <span className="inline-flex items-center gap-1 text-xs text-blue-400 bg-blue-400/10 rounded-full px-2.5 py-1">
                  <Users className="w-3 h-3" />
                  Friends
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-white/60 bg-white/10 rounded-full px-2.5 py-1">
                  <Lock className="w-3 h-3" />
                  Private
                </span>
              )}

              {hive.status === 'COMPLETED' && (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-400/10 rounded-full px-2.5 py-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Complete
                </span>
              )}

              {isMember && hive.myRole === 'OWNER' && (
                <span className="inline-flex items-center gap-1 text-xs text-[#FFC300] bg-[#FFC300]/10 rounded-full px-2.5 py-1">
                  <Crown className="w-3 h-3" />
                  Owner
                </span>
              )}
              {isMember && hive.myRole === 'MODERATOR' && (
                <span className="inline-flex items-center gap-1 text-xs text-blue-400 bg-blue-400/10 rounded-full px-2.5 py-1">
                  <Shield className="w-3 h-3" />
                  Moderator
                </span>
              )}
              {isMember && hive.myRole === 'CONTRIBUTOR' && (
                <span className="inline-flex items-center gap-1 text-xs text-amber-400 bg-amber-400/10 rounded-full px-2.5 py-1">
                  <Pencil className="w-3 h-3" />
                  Contributor
                </span>
              )}
              {isMember && hive.myRole === 'BETA_READER' && (
                <span className="inline-flex items-center gap-1 text-xs text-purple-400 bg-purple-400/10 rounded-full px-2.5 py-1">
                  <Eye className="w-3 h-3" />
                  Beta Reader
                </span>
              )}
            </div>

            {hive.genre && (
              <p className="text-sm text-[#FFC300]/60 mt-1">{hive.genre}</p>
            )}
            {hive.description && (
              <p className="text-sm text-white/60 mt-2 max-w-2xl leading-relaxed">
                {hive.description}
              </p>
            )}

            {hive.tags && hive.tags.length > 0 && (
              <div className="flex gap-1.5 flex-wrap mt-3">
                {hive.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs text-white/50 bg-[#2a2a2a] rounded-full px-2 py-0.5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!isMember && hive.privacy !== 'PRIVATE' && (
              <Button onClick={handleJoin} size="sm">
                Join Hive
              </Button>
            )}
            {isMember && !isOwner && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLeave}
                disabled={leaving}
                className="text-red-400 border-red-400/30 hover:bg-red-400/10"
              >
                <LogOut className="w-4 h-4" />
                Leave
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6 mt-5 pt-5 border-t border-[#2a2a2a] flex-wrap">
          <div className="flex items-center gap-1.5 text-sm">
            <Users className="w-4 h-4 text-white/40" />
            <span className="text-white font-semibold">{hive.memberCount}</span>
            <span className="text-white/50">
              member{hive.memberCount !== 1 ? 's' : ''}
            </span>
          </div>
          {hive.totalWordCount > 0 && (
            <div className="flex items-center gap-1.5 text-sm">
              <span className="text-[#FFC300] font-semibold">
                {hive.totalWordCount.toLocaleString()}
              </span>
              <span className="text-white/50">words written</span>
            </div>
          )}
          {hive.chapterCount > 0 && (
            <div className="flex items-center gap-1.5 text-sm">
              <BookOpen className="w-4 h-4 text-white/40" />
              <span className="text-white font-semibold">
                {hive.chapterCount}
              </span>
              <span className="text-white/50">
                chapter{hive.chapterCount !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {hive.bookId ? (
        <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#FFC300]" />
              The Book
            </h2>
            <Link
              href={`/library/${hive.bookId}`}
              className="text-xs text-[#FFC300] hover:underline"
            >
              Open in Library →
            </Link>
          </div>
          <p className="text-sm text-white/60">
            This hive is working on a book. Open it in your library to read and
            write chapters.
          </p>
        </div>
      ) : isMember ? (
        <div className="rounded-2xl bg-[#252525] border border-dashed border-[#2a2a2a] p-5 flex flex-col items-center text-center gap-2">
          <BookOpen className="w-8 h-8 text-white/30" />
          <p className="text-sm font-medium text-white/60">
            No book linked yet
          </p>
          <p className="text-xs text-white/40">
            {isOwner
              ? 'Go to Settings to link or create a book for this hive.'
              : 'The hive owner will link a book soon.'}
          </p>
          {isOwner && (
            <Button asChild size="sm" variant="outline" className="mt-1">
              <Link href={`/hive/${hive.id}/settings`}>Go to Settings</Link>
            </Button>
          )}
        </div>
      ) : null}

      {isMember && (
        <div>
          <h2 className="text-base font-semibold text-white mb-3">
            Hive Tools
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {QUICK_LINKS.map(({ href, label, icon: Icon, desc }) => (
              <Link
                key={href}
                href={`/hive/${hive.id}${href}`}
                className="group flex flex-col gap-2 p-4 rounded-xl bg-[#252525] border border-[#2a2a2a] hover:border-[#FFC300]/30 hover:bg-[#232323] transition-all"
              >
                <Icon className="w-5 h-5 text-[#FFC300]/70 group-hover:text-[#FFC300] transition-colors" />
                <div>
                  <p className="text-sm font-semibold text-white group-hover:text-[#FFC300] transition-colors">
                    {label}
                  </p>
                  <p className="text-xs text-white/40 mt-0.5">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-[#FFC300]" />
            Members
          </h2>
          {isMember && (
            <Link
              href={`/hive/${hive.id}/members`}
              className="text-xs text-[#FFC300] hover:underline"
            >
              View all →
            </Link>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {members.slice(0, 8).map((m) => (
            <Link
              key={m.id}
              href={`/u/${m.user.username ?? m.userId}`}
              title={`${m.user.username ?? 'User'} · ${ROLE_LABELS[m.role as keyof typeof ROLE_LABELS]}`}
              className="shrink-0"
            >
              {m.user.imageUrl ? (
                <Image
                  src={m.user.imageUrl}
                  alt={m.user.username ?? 'User'}
                  width={36}
                  height={36}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-[#1e1e1e] hover:ring-[#FFC300]/40 transition-all"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#FFC300]/15 flex items-center justify-center ring-2 ring-[#1e1e1e]">
                  <span className="text-[#FFC300] text-sm font-bold">
                    {(m.user.username ??
                      m.user.firstName ??
                      '?')[0]?.toUpperCase()}
                  </span>
                </div>
              )}
            </Link>
          ))}
          {members.length > 8 && (
            <div className="w-9 h-9 rounded-full bg-[#2a2a2a] flex items-center justify-center text-xs text-white/60 font-medium ring-2 ring-[#1e1e1e]">
              +{members.length - 8}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
