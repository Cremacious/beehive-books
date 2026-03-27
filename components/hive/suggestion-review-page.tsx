'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Check, Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from '@/components/editor/rich-text-editor';
import {
  acceptSuggestionAction,
  rejectSuggestionAction,
} from '@/lib/actions/hive-suggestions.actions';
import type { HiveChapterSuggestion } from '@/lib/types/hive.types';

function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function SuggestionReviewPage({
  hiveId,
  suggestion,
}: {
  hiveId: string;
  suggestion: HiveChapterSuggestion;
}) {
  const router = useRouter();
  const [rejectNote, setRejectNote] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const backHref = `/hive/${hiveId}/suggest`;

  const handleAccept = () => {
    setError('');
    startTransition(async () => {
      const result = await acceptSuggestionAction(suggestion.id);
      if (!result.success) { setError(result.message); return; }
      router.push(backHref);
    });
  };

  const handleReject = () => {
    setError('');
    startTransition(async () => {
      const result = await rejectSuggestionAction(suggestion.id, rejectNote);
      if (!result.success) { setError(result.message); return; }
      router.push(backHref);
    });
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="mb-6 space-y-1">
        <button
          onClick={() => router.push(backHref)}
          className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to suggestions
        </button>
        <h1 className="text-xl font-bold text-white">Review Suggestion</h1>
        <div className="flex items-center gap-2">
          {suggestion.author.image ? (
            <Image
              src={suggestion.author.image}
              alt={suggestion.author.username ?? ''}
              width={20}
              height={20}
              className="rounded-full"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-[#FFC300]/15 flex items-center justify-center text-[#FFC300] text-[10px] font-bold shrink-0">
              {(suggestion.author.username ?? 'U')[0]?.toUpperCase()}
            </div>
          )}
          <p className="text-sm text-white/60">
            by {suggestion.author.username ?? 'Member'}&nbsp;&middot;&nbsp;
            {suggestion.chapter.title}&nbsp;&middot;&nbsp;
            {timeAgo(suggestion.createdAt)}
          </p>
        </div>
      </div>

      {/* Summary callout */}
      {suggestion.summary && (
        <div className="mb-5 rounded-2xl bg-[#FFC300]/5 border border-[#FFC300]/20 px-4 py-3">
          <p className="text-sm text-white/80 italic">{suggestion.summary}</p>
        </div>
      )}

      {/* Two-column diff */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] p-6 overflow-y-auto max-h-[70vh]">
          <p className="text-xs font-semibold text-white/60 mb-3 uppercase tracking-wide">
            Current Version
          </p>
          <RichTextEditor content={suggestion.originalContent} editable={false} />
        </div>
        <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] p-6 overflow-y-auto max-h-[70vh]">
          <p className="text-xs font-semibold text-yellow-500 mb-3 uppercase tracking-wide">
            Suggested Version
          </p>
          <RichTextEditor content={suggestion.suggestedContent} editable={false} />
        </div>
      </div>

      {/* Sticky footer */}
      <div className="sticky bottom-0 mt-6 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] px-5 py-4">
        {error && <p className="text-xs text-red-400 mb-3">{error}</p>}

        {showRejectInput ? (
          <div className="space-y-3">
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="Optional note for the author…"
              maxLength={500}
              rows={2}
              className="w-full rounded-xl bg-[#252525] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFC300]/40 transition-all resize-none"
            />
            <div className="flex items-center gap-2">
              <Button size="sm" variant="destructive" onClick={handleReject} disabled={isPending}>
                {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm Reject
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowRejectInput(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleAccept} disabled={isPending}>
              {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              Accept
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setShowRejectInput(true)}
              disabled={isPending}
            >
              <XCircle className="w-3.5 h-3.5" />
              Reject
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
