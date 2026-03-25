'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  TrendingUp,
  Trophy,
  Timer,
  BookMarked,
  Check,
  CheckCheck,
  BookOpen,
  MessageCircle,
  Zap,
  RefreshCw,
  ListTree,
  Target,
  Sparkles,
  UserPlus,
  Upload,
} from 'lucide-react';
import { getHiveActivityAction } from '@/lib/actions/hive-activity.actions';
import type { ActivityEvent, ActivityEventType } from '@/lib/types/hive.types';

interface HiveActivityFeedProps {
  hiveId: string;
  initialEvents: ActivityEvent[];
}

function timeAgo(date: Date): string {
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  });
}

function dayLabel(date: Date): string {
  const now = new Date();
  const d = new Date(date);
  const diffDays = Math.floor(
    (now.setHours(0, 0, 0, 0) - d.setHours(0, 0, 0, 0)) / 86_400_000,
  );
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return new Date(date).toLocaleDateString([], {
    month: 'long',
    day: 'numeric',
  });
}

const EVENT_CONFIG: Record<
  ActivityEventType,
  {
    icon: React.ElementType;
    color: string;
    bg: string;
    describe: (meta: Record<string, string | number>, name: string) => string;
  }
> = {
  WORD_LOG: {
    icon: TrendingUp,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    describe: (meta, name) =>
      `${name} logged ${Number(meta.words).toLocaleString()} words`,
  },
  MILESTONE: {
    icon: Trophy,
    color: 'text-[#FFC300]',
    bg: 'bg-[#FFC300]/10',
    describe: (meta, name) => `${name} earned "${meta.label}"`,
  },
  SPRINT_STARTED: {
    icon: Zap,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    describe: (meta, name) =>
      `${name} started a ${meta.durationMinutes}-minute sprint`,
  },
  SPRINT_ENDED: {
    icon: Timer,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    describe: (meta, name) =>
      `${name}'s ${meta.durationMinutes}-minute sprint ended`,
  },
  CHAPTER_CLAIMED: {
    icon: BookMarked,
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    describe: (meta, name) => `${name} claimed "${meta.chapterTitle}"`,
  },
  CHAPTER_COMPLETED: {
    icon: Check,
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    describe: (meta, name) => `${name} completed "${meta.chapterTitle}"`,
  },
  WIKI_ENTRY: {
    icon: BookOpen,
    color: 'text-sky-400',
    bg: 'bg-sky-400/10',
    describe: (meta, name) =>
      `${name} added "${meta.title}" to the ${String(meta.category).toLowerCase()} wiki`,
  },
  INLINE_COMMENT: {
    icon: MessageCircle,
    color: 'text-pink-400',
    bg: 'bg-pink-400/10',
    describe: (meta, name) =>
      `${name} left a ${String(meta.layer).toLowerCase()} annotation`,
  },
  OUTLINE_ITEM: {
    icon: ListTree,
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
    describe: (meta, name) => `${name} added "${meta.title}" to the outline`,
  },
  WORD_GOAL: {
    icon: Target,
    color: 'text-rose-400',
    bg: 'bg-rose-400/10',
    describe: (meta, name) => {
      const label = String(meta.goalType).charAt(0) + String(meta.goalType).slice(1).toLowerCase();
      return `${name} set a ${label} word goal — ${Number(meta.targetWords).toLocaleString()} words`;
    },
  },
  BUZZ_ITEM: {
    icon: Sparkles,
    color: 'text-violet-400',
    bg: 'bg-violet-400/10',
    describe: (meta, name) =>
      `${name} posted a ${String(meta.buzzType).toLowerCase()} to the Buzz Board`,
  },
  MEMBER_JOINED: {
    icon: UserPlus,
    color: 'text-teal-400',
    bg: 'bg-teal-400/10',
    describe: (meta, name) =>
      `${name} joined the hive as a ${String(meta.role).charAt(0) + String(meta.role).slice(1).toLowerCase()}`,
  },
  CHAPTER_SUBMITTED: {
    icon: Upload,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    describe: (meta, name) => `${name} submitted a chapter — "${meta.title}"`,
  },
  CHAPTER_SUBMISSION_APPROVED: {
    icon: CheckCheck,
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    describe: (meta, name) => `${name}'s chapter submission was approved — "${meta.title}"`,
  },
};

function EventRow({ event }: { event: ActivityEvent }) {
  const cfg = EVENT_CONFIG[event.type];
  const Icon = cfg.icon;
  const name = event.user.username ?? 'Someone';

  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className="relative shrink-0">
        {event.user.username ? (
          <Link href={`/u/${event.user.username}`} className="hover:opacity-80 transition-opacity block">
            {event.user.image ? (
              <Image
                src={event.user.image}
                alt={name}
                width={28}
                height={28}
                className="rounded-full"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#FFC300]/20" />
            )}
          </Link>
        ) : event.user.image ? (
          <Image
            src={event.user.image}
            alt=""
            width={28}
            height={28}
            className="rounded-full"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-[#FFC300]/20" />
        )}
        <div
          className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center ${cfg.bg} ring-2 ring-[#1e1e1e]`}
        >
          <Icon className={`w-2.5 h-2.5 ${cfg.color}`} />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-white/80 leading-snug">
          {event.type === 'MILESTONE' && (
            <span className="mr-1">{event.meta.icon}</span>
          )}
          {cfg.describe(event.meta, name)}
        </p>
      </div>

      <span className="text-xs text-white/80 shrink-0 mt-0.5">
        {timeAgo(event.timestamp)}
      </span>
    </div>
  );
}

export default function HiveActivityFeed({
  hiveId,
  initialEvents,
}: HiveActivityFeedProps) {
  const [events, setEvents] = useState<ActivityEvent[]>(initialEvents);
  const [refreshing, startTransition] = useTransition();

  const refresh = () => {
    startTransition(async () => {
      const fresh = await getHiveActivityAction(hiveId);
      setEvents(fresh);
    });
  };

  const groups: { label: string; events: ActivityEvent[] }[] = [];
  for (const ev of events) {
    const label = dayLabel(ev.timestamp);
    const last = groups[groups.length - 1];
    if (last && last.label === label) {
      last.events.push(ev);
    } else {
      groups.push({ label, events: [ev] });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-white/80">
          {events.length} event{events.length !== 1 ? 's' : ''} in the last 30
          days
        </p>
        <button
          onClick={refresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 text-xs text-white/80 hover:text-white/80 transition-colors"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`}
          />
          Refresh
        </button>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center gap-3">
          <div className="text-4xl">🐝</div>
          <p className="text-sm text-white/80">No activity yet.</p>
          <p className="text-xs text-white/80 max-w-xs">
            Events like word logs, milestones, sprints, and chapter claims will
            appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="text-xs font-semibold text-white/80 uppercase tracking-wider mb-2">
                {group.label}
              </p>
              <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] px-4 divide-y divide-[#2a2a2a]">
                {group.events.map((ev) => (
                  <EventRow key={ev.id} event={ev} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
