'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useTransition } from 'react';
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
  TrendingUp,
  Target,
  UserPlus,
  RefreshCw,
  Activity,
  Zap,
  GitBranch,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHiveStore } from '@/lib/stores/hive-store';
import { getHiveActivityAction } from '@/lib/actions/hive-activity.actions';
import type {
  HiveWithMembership,
  ActivityEvent,
  ActivityEventType,
} from '@/lib/types/hive.types';

type LinkedBook = {
  id: string;
  title: string;
  author: string;
  coverUrl: string | null;
  privacy: string;
} | null;

interface HiveDashboardProps {
  hive: HiveWithMembership;
  initialActivity: ActivityEvent[];
  currentUserId: string | null;
  linkedBook: LinkedBook;
  joinRequestStatus?: 'pending' | 'none';
  pendingRequests?: { id: string; user: { clerkId: string; username: string | null; imageUrl: string | null }; createdAt: Date }[];
}

function relativeTime(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
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

function displayName(user: ActivityEvent['user']): string {
  return user.username ?? user.firstName ?? 'Someone';
}

const EVENT_CONFIG: Record<
  ActivityEventType,
  { icon: React.ReactNode; color: string; bg: string }
> = {
  WORD_LOG: {
    icon: <TrendingUp className="w-4 h-4" />,
    color: 'text-[#FFC300]',
    bg: 'bg-[#FFC300]/10',
  },
  MILESTONE: {
    icon: <Trophy className="w-4 h-4" />,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
  },
  SPRINT_STARTED: {
    icon: <Zap className="w-4 h-4" />,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
  },
  SPRINT_ENDED: {
    icon: <Timer className="w-4 h-4" />,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
  },
  CHAPTER_CLAIMED: {
    icon: <BookOpen className="w-4 h-4" />,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
  },
  CHAPTER_COMPLETED: {
    icon: <CheckCircle2 className="w-4 h-4" />,
    color: 'text-green-400',
    bg: 'bg-green-400/10',
  },
  WIKI_ENTRY: {
    icon: <BookOpen className="w-4 h-4" />,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
  },
  INLINE_COMMENT: {
    icon: <MessageSquare className="w-4 h-4" />,
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
  },
  OUTLINE_ITEM: {
    icon: <ListTree className="w-4 h-4" />,
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
  },
  WORD_GOAL: {
    icon: <Target className="w-4 h-4" />,
    color: 'text-rose-400',
    bg: 'bg-rose-400/10',
  },
  BUZZ_ITEM: {
    icon: <Sparkles className="w-4 h-4" />,
    color: 'text-pink-400',
    bg: 'bg-pink-400/10',
  },
  MEMBER_JOINED: {
    icon: <UserPlus className="w-4 h-4" />,
    color: 'text-teal-400',
    bg: 'bg-teal-400/10',
  },
};

function eventDescription(event: ActivityEvent): React.ReactNode {
  const name = (
    <span className="font-semibold text-white">{displayName(event.user)}</span>
  );
  const m = event.meta;

  switch (event.type) {
    case 'WORD_LOG':
      return (
        <>
          {name} logged{' '}
          <span className="font-semibold text-[#FFC300]">
            {Number(m.words).toLocaleString()} words
          </span>
        </>
      );
    case 'MILESTONE':
      return (
        <>
          {name} unlocked the{' '}
          <span className="font-semibold text-amber-400">
            {String(m.icon)} {String(m.label)}
          </span>{' '}
          milestone
        </>
      );
    case 'SPRINT_STARTED':
      return (
        <>
          {name} started a{' '}
          <span className="font-semibold text-blue-400">
            {m.durationMinutes} min sprint
          </span>
        </>
      );
    case 'SPRINT_ENDED':
      return (
        <>
          {name}&apos;s{' '}
          <span className="font-semibold text-blue-400">
            {m.durationMinutes} min sprint
          </span>{' '}
          wrapped up
        </>
      );
    case 'CHAPTER_CLAIMED':
      return (
        <>
          {name} claimed{' '}
          <span className="font-semibold text-emerald-400">
            &ldquo;{String(m.chapterTitle)}&rdquo;
          </span>
        </>
      );
    case 'CHAPTER_COMPLETED':
      return (
        <>
          {name} completed{' '}
          <span className="font-semibold text-green-400">
            &ldquo;{String(m.chapterTitle)}&rdquo;
          </span>
        </>
      );
    case 'WIKI_ENTRY':
      return (
        <>
          {name} added a wiki entry{' '}
          <span className="font-semibold text-purple-400">
            &ldquo;{String(m.title)}&rdquo;
          </span>
        </>
      );
    case 'INLINE_COMMENT':
      return (
        <>
          {name} left a{' '}
          <span className="font-semibold text-orange-400">
            {String(m.layer).toLowerCase()}
          </span>{' '}
          annotation
        </>
      );
    case 'OUTLINE_ITEM':
      return (
        <>
          {name} added{' '}
          <span className="font-semibold text-cyan-400">
            &ldquo;{String(m.title)}&rdquo;
          </span>{' '}
          to the outline
        </>
      );
    case 'WORD_GOAL': {
      const goalLabel =
        m.goalType === 'DAILY'
          ? 'daily'
          : m.goalType === 'WEEKLY'
            ? 'weekly'
            : m.goalType === 'MONTHLY'
              ? 'monthly'
              : 'total';
      return (
        <>
          {name} set a{' '}
          <span className="font-semibold text-rose-400">
            {goalLabel} word goal
          </span>
          {' — '}
          <span className="font-semibold text-white">
            {Number(m.targetWords).toLocaleString()} words
          </span>
        </>
      );
    }
    case 'BUZZ_ITEM':
      return (
        <>
          {name} posted to the{' '}
          <span className="font-semibold text-pink-400">Buzz Board</span>
        </>
      );
    case 'MEMBER_JOINED':
      return (
        <>
          {name} joined the hive as a{' '}
          <span className="font-semibold text-teal-400">
            {String(m.role).charAt(0) + String(m.role).slice(1).toLowerCase()}
          </span>
        </>
      );
    default:
      return <>{name} did something</>;
  }
}

function ActivityFeedItem({ event }: { event: ActivityEvent }) {
  const cfg = EVENT_CONFIG[event.type];
  const user = event.user;

  return (
    <div className="flex items-start gap-4 py-4 border-b border-[#2a2a2a] last:border-0">
      <div className="relative shrink-0">
        {user.imageUrl ? (
          <Image
            src={user.imageUrl}
            alt={displayName(user)}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#2a2a2a] flex items-center justify-center">
            <span className="text-white/60 text-sm font-bold">
              {(user.username ?? user.firstName ?? '?')[0]?.toUpperCase()}
            </span>
          </div>
        )}
    
      </div>

      <div className="flex-1 min-w-0 pt-0.5">
        <p className="text-sm text-white/80 leading-relaxed">
          {eventDescription(event)}
        </p>
        <p className="text-xs text-white/80 mt-1">
          {relativeTime(event.timestamp)}
        </p>
      </div>
    </div>
  );
}

export default function HiveDashboard({
  hive,
  initialActivity,
  linkedBook,
  joinRequestStatus,
  pendingRequests,
}: HiveDashboardProps) {
  const store = useHiveStore();
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [requestSent, setRequestSent] = useState(joinRequestStatus === 'pending');
  const [activity, setActivity] = useState<ActivityEvent[]>(initialActivity);
  const [refreshing, startRefresh] = useTransition();
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [localPendingRequests, setLocalPendingRequests] = useState(pendingRequests ?? []);

  const isOwner = hive.myRole === 'OWNER';
  const isModOrOwner = hive.myRole === 'OWNER' || hive.myRole === 'MODERATOR';
  const isMember = hive.isMember;

  const handleRequestJoin = async () => {
    setRequesting(true);
    const result = await store.joinHive(hive.id);
    if (result.success) {
      setRequestSent(true);
    }
    setRequesting(false);
  };

  const handleApproveRequest = async (requestId: string) => {
    setApprovingId(requestId);
    const result = await store.approveJoinRequest(requestId);
    if (result.success) {
      setLocalPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
      router.refresh();
    }
    setApprovingId(null);
  };

  const handleRejectRequest = async (requestId: string) => {
    setRejectingId(requestId);
    const result = await store.rejectJoinRequest(requestId);
    if (result.success) {
      setLocalPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
    }
    setRejectingId(null);
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

  const handleRefreshActivity = () => {
    startRefresh(async () => {
      const fresh = await getHiveActivityAction(hive.id);
      setActivity(fresh);
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-white mainFont">
                {hive.name}
              </h1>

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
              <p className="text-sm text-[#FFC300] mt-1">{hive.genre}</p>
            )}
            {hive.description && (
              <p className="text-sm text-white/80 mt-2 max-w-2xl leading-relaxed">
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
              requestSent ? (
                <Button size="sm" variant="outline" disabled className="text-white/60 border-white/20">
                  Request Pending
                </Button>
              ) : (
                <Button onClick={handleRequestJoin} size="sm" disabled={requesting}>
                  {requesting ? 'Requesting…' : 'Request to Join'}
                </Button>
              )
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
            <Users className="w-4 h-4 text-yellow-500" />
            <span className="text-white font-semibold">{hive.memberCount}</span>
            <span className="text-white">
              member{hive.memberCount !== 1 ? 's' : ''}
            </span>
          </div>
  
        </div>
      </div>

      {isModOrOwner && localPendingRequests.length > 0 && (
        <div className="rounded-2xl bg-[#252525] border border-[#FFC300]/20 p-5">
          <h2 className="text-base font-semibold text-white flex items-center gap-2 mainFont mb-4">
            <UserPlus className="w-4 h-4 text-[#FFC300]" />
            Join Requests
            <span className="ml-1 bg-[#FFC300] text-black text-xs font-bold px-1.5 py-0.5 rounded-full leading-none">
              {localPendingRequests.length}
            </span>
          </h2>
          <div className="space-y-3">
            {localPendingRequests.map((req) => (
              <div key={req.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {req.user.imageUrl ? (
                    <Image
                      src={req.user.imageUrl}
                      alt={req.user.username ?? 'User'}
                      width={36}
                      height={36}
                      className="w-9 h-9 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#2a2a2a] flex items-center justify-center shrink-0">
                      <span className="text-white/60 text-sm font-bold">
                        {(req.user.username ?? '?')[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                  <Link
                    href={`/u/${req.user.username}`}
                    className="text-sm font-medium text-white hover:text-[#FFC300] truncate"
                  >
                    {req.user.username ?? 'Unknown'}
                  </Link>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    onClick={() => handleApproveRequest(req.id)}
                    disabled={approvingId === req.id || rejectingId === req.id}
                    className="h-7 px-3 text-xs"
                  >
                    {approvingId === req.id ? 'Approving…' : 'Approve'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRejectRequest(req.id)}
                    disabled={approvingId === req.id || rejectingId === req.id}
                    className="h-7 px-3 text-xs text-red-400 border-red-400/30 hover:bg-red-400/10"
                  >
                    {rejectingId === req.id ? '…' : 'Decline'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {hive.bookId ? (
        <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-white flex items-center gap-2 mainFont">
              <BookOpen className="w-4 h-4 text-[#FFC300]" />
              The Book
            </h2>
            {linkedBook && linkedBook.privacy !== 'PRIVATE' && (
              <Link
                href={`/books/${hive.bookId}`}
                className="text-sm text-[#FFC300] hover:underline"
              >
                Open Book →
              </Link>
            )}
          </div>
          <div className="flex gap-4">
            {linkedBook?.coverUrl ? (
              <Image
                src={linkedBook.coverUrl}
                alt={linkedBook.title}
                width={80}
                height={120}
                className="rounded-lg object-cover shrink-0"
              />
            ) : (
              <div className="w-20 shrink-0 aspect-2/3 rounded-lg bg-[#1e1e1e] border border-[#3a3a3a] flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white/20" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-white mb-1 mainFont">
                {linkedBook?.title ?? 'Untitled'}
              </h3>
              {linkedBook?.author && (
                <p className="text-sm text-white/80 mb-2">
                  by {linkedBook.author}
                </p>
              )}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
          
                  <span className="text-white font-semibold">
                    {hive.chapterCount}
                  </span>
                  <span className="text-white">
                    chapter{hive.chapterCount !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-white font-semibold">
                    {hive.totalWordCount.toLocaleString()}
                  </span>
                  <span className="text-white">words</span>
                </div>
              </div>
            </div>
          </div>
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
        <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold text-white flex items-center gap-2 mainFont">
              <Activity className="w-4 h-4 text-[#FFC300]" />
              Recent Activity
            </h2>
            <button
              onClick={handleRefreshActivity}
              disabled={refreshing}
              className="flex items-center gap-1.5 text-xs text-white hover:text-white/70 transition-colors disabled:opacity-40"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`}
              />
              Refresh
            </button>
          </div>

          <p className="text-sm text-white/80 mb-4">
            Last 30 days of hive activity
          </p>

          {activity.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-[#1e1e1e] flex items-center justify-center">
                <GitBranch className="w-7 h-7 text-white" />
              </div>
              <p className="text-sm font-medium text-white/40">
                No activity yet
              </p>
              <p className="text-xs text-white/80 max-w-xs">
                Activity will appear here as your hive writes, creates goals,
                adds wiki entries, and more.
              </p>
            </div>
          ) : (
            <div>
              {activity.map((event) => (
                <ActivityFeedItem key={event.id} event={event} />
              ))}
              <p className="text-xs text-white/80 text-center pt-4">
                Showing {activity.length} event
                {activity.length !== 1 ? 's' : ''} from the last 30 days
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
