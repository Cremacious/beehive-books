'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { BookOpen, CheckCircle2, Circle, Clock, Loader2, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getChaptersWithClaimsAction,
  claimChapterAction,
  updateClaimStatusAction,
  unclaimChapterAction,
} from '@/lib/actions/hive-claiming.actions';
import type { ChapterWithClaim, ClaimStatus, HiveRole } from '@/lib/types/hive.types';

interface HiveChapterClaimsProps {
  hiveId: string;
  bookId: string | null;
  bookTitle: string | null;
  initialChapters: ChapterWithClaim[];
  currentUserId: string;
  myRole: HiveRole;
}

const STATUS_CONFIG: Record<
  ClaimStatus,
  { label: string; color: string; bg: string; Icon: React.ElementType }
> = {
  CLAIMED: {
    label: 'Claimed',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10 border-blue-400/20',
    Icon: Circle,
  },
  IN_PROGRESS: {
    label: 'In Progress',
    color: 'text-[#FFC300]',
    bg: 'bg-[#FFC300]/10 border-[#FFC300]/20',
    Icon: Clock,
  },
  COMPLETED: {
    label: 'Completed',
    color: 'text-green-400',
    bg: 'bg-green-400/10 border-green-400/20',
    Icon: CheckCircle2,
  },
};

function StatusCycle({
  currentStatus,
  onUpdate,
  disabled,
}: {
  currentStatus: ClaimStatus;
  onUpdate: (status: ClaimStatus) => Promise<void>;
  disabled: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const order: ClaimStatus[] = ['CLAIMED', 'IN_PROGRESS', 'COMPLETED'];
  const nextStatus = order[(order.indexOf(currentStatus) + 1) % order.length];
  const conf = STATUS_CONFIG[currentStatus];
  const Icon = conf.Icon;

  const handleClick = async () => {
    setLoading(true);
    await onUpdate(nextStatus);
    setLoading(false);
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-all hover:brightness-110 ${conf.bg} ${conf.color}`}
      title={`Click to advance to ${STATUS_CONFIG[nextStatus].label}`}
    >
      {loading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <Icon className="w-3 h-3" />
      )}
      {conf.label}
    </button>
  );
}

function ChapterRow({
  chapter,
  currentUserId,
  myRole,
  onClaim,
  onUpdateStatus,
  onUnclaim,
}: {
  chapter: ChapterWithClaim;
  currentUserId: string;
  myRole: HiveRole;
  onClaim: (chapterId: string) => Promise<void>;
  onUpdateStatus: (chapterId: string, status: ClaimStatus) => Promise<void>;
  onUnclaim: (chapterId: string) => Promise<void>;
}) {
  const [claiming, setClaiming] = useState(false);
  const [unclaiming, setUnclaiming] = useState(false);

  const { claim } = chapter;
  const isMyClaim = claim?.userId === currentUserId;
  const canManage =
    isMyClaim || myRole === 'OWNER' || myRole === 'MODERATOR';

  const handleClaim = async () => {
    setClaiming(true);
    await onClaim(chapter.id);
    setClaiming(false);
  };

  const handleUnclaim = async () => {
    if (!confirm('Unclaim this chapter?')) return;
    setUnclaiming(true);
    await onUnclaim(chapter.id);
    setUnclaiming(false);
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${
      claim?.status === 'COMPLETED'
        ? 'bg-green-400/5 border-green-400/10'
        : claim
        ? 'bg-[#252525] border-[#2a2a2a]'
        : 'bg-[#1e1e1e] border-[#2a2a2a]'
    }`}>
      {/* Chapter number */}
      <span className="text-xs text-white/30 font-mono w-8 shrink-0 text-right">
        {String(chapter.order + 1).padStart(2, '0')}
      </span>

      {/* Title + word count */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${
          claim?.status === 'COMPLETED' ? 'text-white/50 line-through' : 'text-white'
        }`}>
          {chapter.title}
        </p>
        {chapter.wordCount > 0 && (
          <p className="text-xs text-white/30">
            {chapter.wordCount.toLocaleString()} words
          </p>
        )}
      </div>

      {/* Claim info / actions */}
      {claim ? (
        <div className="flex items-center gap-2 shrink-0">
          {/* Claimer avatar */}
          <div className="flex items-center gap-1.5">
            {claim.claimer.imageUrl ? (
              <Image
                src={claim.claimer.imageUrl}
                alt={claim.claimer.username ?? 'User'}
                width={20}
                height={20}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-[#FFC300]/15 flex items-center justify-center text-[#FFC300] font-bold text-[9px]">
                {(claim.claimer.username ?? claim.claimer.firstName ?? 'U')[0]?.toUpperCase()}
              </div>
            )}
            <span className="text-xs text-white/40 hidden sm:block">
              {claim.claimer.username ?? claim.claimer.firstName ?? 'User'}
            </span>
          </div>

          {/* Status badge (clickable to cycle if can manage) */}
          {canManage ? (
            <StatusCycle
              currentStatus={claim.status}
              onUpdate={(status) => onUpdateStatus(chapter.id, status)}
              disabled={false}
            />
          ) : (
            <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_CONFIG[claim.status].bg} ${STATUS_CONFIG[claim.status].color}`}>
              <span>{STATUS_CONFIG[claim.status].label}</span>
            </span>
          )}

          {/* Unclaim */}
          {canManage && (
            <button
              onClick={handleUnclaim}
              disabled={unclaiming}
              className="text-xs text-white/25 hover:text-red-400 transition-colors px-1"
              title="Unclaim"
            >
              {unclaiming ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : '×'}
            </button>
          )}
        </div>
      ) : (
        <Button
          size="sm"
          variant="outline"
          onClick={handleClaim}
          disabled={claiming}
        >
          {claiming ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
          Claim
        </Button>
      )}
    </div>
  );
}

export default function HiveChapterClaims({
  hiveId,
  bookId,
  bookTitle,
  initialChapters,
  currentUserId,
  myRole,
}: HiveChapterClaimsProps) {
  const [chapters, setChapters] = useState<ChapterWithClaim[]>(initialChapters);
  const [, startTransition] = useTransition();

  const refresh = () => {
    startTransition(async () => {
      const fresh = await getChaptersWithClaimsAction(hiveId);
      setChapters(fresh);
    });
  };

  const handleClaim = async (chapterId: string) => {
    await claimChapterAction(hiveId, chapterId);
    refresh();
  };

  const handleUpdateStatus = async (chapterId: string, status: ClaimStatus) => {
    await updateClaimStatusAction(hiveId, chapterId, status);
    setChapters((prev) =>
      prev.map((ch) =>
        ch.id === chapterId && ch.claim
          ? {
              ...ch,
              claim: {
                ...ch.claim,
                status,
                completedAt: status === 'COMPLETED' ? new Date() : null,
              },
            }
          : ch,
      ),
    );
  };

  const handleUnclaim = async (chapterId: string) => {
    await unclaimChapterAction(hiveId, chapterId);
    setChapters((prev) =>
      prev.map((ch) => (ch.id === chapterId ? { ...ch, claim: null } : ch)),
    );
  };

  if (!bookId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#252525] flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-[#FFC300]/40" />
        </div>
        <p className="text-sm font-medium text-white/60">No book linked</p>
        <p className="text-xs text-white/30 max-w-xs">
          Link a book to this hive in Settings before you can claim chapters.
        </p>
        {(myRole === 'OWNER') && (
          <Button size="sm" variant="outline" asChild>
            <a href={`/hive/${hiveId}/settings`}>
              Go to Settings
            </a>
          </Button>
        )}
      </div>
    );
  }

  if (chapters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#252525] flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-[#FFC300]/40" />
        </div>
        <p className="text-sm text-white/40">
          No chapters in this book yet.
        </p>
      </div>
    );
  }

  const claimedCount = chapters.filter((c) => c.claim).length;
  const completedCount = chapters.filter((c) => c.claim?.status === 'COMPLETED').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="space-y-0.5">
          {bookTitle && (
            <div className="flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-[#FFC300]" />
              <span className="text-xs font-medium text-[#FFC300]">{bookTitle}</span>
            </div>
          )}
          <p className="text-xs text-white/40">
            {claimedCount} of {chapters.length} claimed
            {completedCount > 0 && ` · ${completedCount} completed`}
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex-1 min-w-[120px] max-w-[240px]">
          <div className="h-1.5 rounded-full bg-[#1e1e1e] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#FFC300]/40 transition-all"
              style={{ width: `${chapters.length > 0 ? (claimedCount / chapters.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Chapter list */}
      <div className="space-y-2">
        {chapters.map((chapter) => (
          <ChapterRow
            key={chapter.id}
            chapter={chapter}
            currentUserId={currentUserId}
            myRole={myRole}
            onClaim={handleClaim}
            onUpdateStatus={handleUpdateStatus}
            onUnclaim={handleUnclaim}
          />
        ))}
      </div>
    </div>
  );
}
