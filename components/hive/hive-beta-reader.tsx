'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  FileText,
  Clock,
  CheckCircle2,
  Eye,
  BookOpen,
  Loader2,
} from 'lucide-react';
import { updateBetaStatusAction } from '@/lib/actions/hive-beta.actions';
import type {
  BetaChapterWithStatus,
  BetaChapterStatus,
} from '@/lib/types/hive.types';

interface HiveBetaReaderProps {
  hiveId: string;
  bookId: string | null;
  bookTitle: string | null;
  initialChapters: BetaChapterWithStatus[];
}

const STATUS_ORDER: BetaChapterStatus[] = [
  'DRAFT',
  'READY_FOR_REVIEW',
  'IN_REVIEW',
  'REVIEWED',
];

const STATUS_CONFIG: Record<
  BetaChapterStatus,
  {
    label: string;
    short: string;
    color: string;
    bg: string;
    Icon: React.ElementType;
  }
> = {
  DRAFT: {
    label: 'Draft',
    short: 'Draft',
    color: 'text-white/40',
    bg: 'bg-white/5 border-white/10',
    Icon: FileText,
  },
  READY_FOR_REVIEW: {
    label: 'Ready for Review',
    short: 'Ready',
    color: 'text-[#FFC300]',
    bg: 'bg-[#FFC300]/10 border-[#FFC300]/20',
    Icon: Eye,
  },
  IN_REVIEW: {
    label: 'In Review',
    short: 'In Review',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10 border-blue-400/20',
    Icon: Clock,
  },
  REVIEWED: {
    label: 'Reviewed',
    short: 'Reviewed',
    color: 'text-green-400',
    bg: 'bg-green-400/10 border-green-400/20',
    Icon: CheckCircle2,
  },
};

function ChapterRow({
  chapter,
  hiveId,
  onUpdate,
}: {
  chapter: BetaChapterWithStatus;
  hiveId: string;
  onUpdate: (chapterId: string, status: BetaChapterStatus) => void;
}) {
  const [loading, setLoading] = useState(false);

  const currentStatus = chapter.betaStatus?.status ?? 'DRAFT';
  const currentIdx = STATUS_ORDER.indexOf(currentStatus);
  const nextStatus = STATUS_ORDER[(currentIdx + 1) % STATUS_ORDER.length];
  const prevStatus: BetaChapterStatus | null =
    currentIdx > 0 ? STATUS_ORDER[currentIdx - 1] : null;
  const conf = STATUS_CONFIG[currentStatus];
  const StatusIcon = conf.Icon;

  const advance = async () => {
    if (loading) return;
    setLoading(true);
    await updateBetaStatusAction(hiveId, chapter.id, nextStatus);
    onUpdate(chapter.id, nextStatus);
    setLoading(false);
  };

  const regress = async () => {
    if (!prevStatus || loading) return;
    setLoading(true);
    await updateBetaStatusAction(hiveId, chapter.id, prevStatus);
    onUpdate(chapter.id, prevStatus);
    setLoading(false);
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${
        currentStatus === 'REVIEWED'
          ? 'bg-green-400/5 border-green-400/10'
          : 'bg-[#252525] border-[#2a2a2a]'
      }`}
    >
      <span className="text-xs text-white/30 font-mono w-8 shrink-0 text-right">
        {String(chapter.order + 1).padStart(2, '0')}
      </span>

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium truncate ${
            currentStatus === 'REVIEWED' ? 'text-white/50' : 'text-white'
          }`}
        >
          {chapter.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {chapter.wordCount > 0 && (
            <span className="text-xs text-white/30">
              {chapter.wordCount.toLocaleString()} words
            </span>
          )}
          {chapter.betaStatus?.updatedBy && (
            <span className="flex items-center gap-1 text-[10px] text-white/25">
              <span>·</span>
              {chapter.betaStatus.updatedBy.imageUrl ? (
                <Image
                  src={chapter.betaStatus.updatedBy.imageUrl}
                  alt=""
                  width={12}
                  height={12}
                  className="rounded-full"
                />
              ) : null}
              {chapter.betaStatus.updatedBy.username ??
                chapter.betaStatus.updatedBy.firstName}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {prevStatus && (
          <button
            onClick={regress}
            disabled={loading}
            className="text-xs text-white/20 hover:text-white/50 transition-colors px-1"
            title={`Back to ${STATUS_CONFIG[prevStatus].label}`}
          >
            ‹
          </button>
        )}

        <button
          onClick={advance}
          disabled={loading}
          className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-all hover:brightness-110 ${conf.bg} ${conf.color}`}
          title={`Click to advance to ${STATUS_CONFIG[nextStatus].label}`}
        >
          {loading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <StatusIcon className="w-3 h-3" />
          )}
          {conf.short}
        </button>
      </div>
    </div>
  );
}

export default function HiveBetaReader({
  hiveId,
  bookId,
  bookTitle,
  initialChapters,
}: HiveBetaReaderProps) {
  const [chapters, setChapters] =
    useState<BetaChapterWithStatus[]>(initialChapters);
  // const [, startTransition] = useTransition();
  const [activeFilter, setActiveFilter] = useState<BetaChapterStatus | 'ALL'>(
    'ALL',
  );

  // const refresh = () => {
  //   startTransition(async () => {
  //     const fresh = await getBetaChaptersAction(hiveId);
  //     setChapters(fresh);
  //   });
  // };

  const handleUpdate = (chapterId: string, status: BetaChapterStatus) => {
    setChapters((prev) =>
      prev.map((ch) =>
        ch.id === chapterId
          ? {
              ...ch,
              betaStatus: ch.betaStatus
                ? { ...ch.betaStatus, status }
                : {
                    id: '',
                    status,
                    updatedById: null,
                    updatedBy: null,
                    updatedAt: new Date(),
                  },
            }
          : ch,
      ),
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
          Link a book to this hive in Settings to use the beta reading workflow.
        </p>
      </div>
    );
  }

  if (chapters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#252525] flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-[#FFC300]/40" />
        </div>
        <p className="text-sm text-white/40">No chapters in this book yet.</p>
      </div>
    );
  }

  const counts = STATUS_ORDER.reduce(
    (acc, s) => ({
      ...acc,
      [s]: chapters.filter((c) => (c.betaStatus?.status ?? 'DRAFT') === s)
        .length,
    }),
    {} as Record<BetaChapterStatus, number>,
  );
  const reviewed = counts.REVIEWED;
  const total = chapters.length;

  const filtered =
    activeFilter === 'ALL'
      ? chapters
      : chapters.filter(
          (c) => (c.betaStatus?.status ?? 'DRAFT') === activeFilter,
        );

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          {bookTitle && (
            <p className="text-xs font-medium text-[#FFC300] flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              {bookTitle}
            </p>
          )}
          <p className="text-xs text-white/40">
            Click a status badge to advance · {reviewed} of {total} reviewed
          </p>
        </div>

        <div className="flex-1 min-w-30 max-w-50">
          <div className="h-1.5 rounded-full bg-[#1e1e1e] overflow-hidden">
            <div
              className="h-full rounded-full bg-green-400/40 transition-all"
              style={{ width: `${total > 0 ? (reviewed / total) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setActiveFilter('ALL')}
          className={`text-xs px-3 py-1 rounded-full transition-all ${
            activeFilter === 'ALL'
              ? 'bg-[#FFC300]/15 text-[#FFC300]'
              : 'text-white/40 hover:text-white/60'
          }`}
        >
          All ({total})
        </button>
        {STATUS_ORDER.map((s) => {
          const c = STATUS_CONFIG[s];
          return (
            <button
              key={s}
              onClick={() => setActiveFilter(s)}
              className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full transition-all ${
                activeFilter === s
                  ? `${c.bg} ${c.color}`
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              <c.Icon className="w-3 h-3" />
              {c.short} ({counts[s] ?? 0})
            </button>
          );
        })}
      </div>

      <div className="space-y-2">
        {filtered.map((chapter) => (
          <ChapterRow
            key={chapter.id}
            chapter={chapter}
            hiveId={hiveId}
            onUpdate={handleUpdate}
          />
        ))}
      </div>
    </div>
  );
}
