'use client';
import { useTransition } from 'react';
import { ThumbsUp, Loader2 } from 'lucide-react';
import { voteForEntryAction } from '@/lib/actions/prompt.actions';

export function VoteButton({ entryId, promptId, voteCount, hasVoted, isDisabled }: {
  entryId: string; promptId: string; voteCount: number;
  hasVoted: boolean; isDisabled: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isDisabled || isPending}
      onClick={() => { if (!hasVoted) startTransition(async () => { await voteForEntryAction(entryId, promptId); }); }}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-medium transition-all ${
        hasVoted
          ? 'bg-[#FFC300]/10 border-[#FFC300]/30 text-yellow-500'
          : isDisabled
          ? 'bg-transparent border-[#2a2a2a] text-white/30 cursor-not-allowed'
          : 'bg-white/5 border-[#2a2a2a] text-white/80 hover:border-[#FFC300]/30 hover:text-white'
      }`}
    >
      {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ThumbsUp className="w-3.5 h-3.5" />}
      {voteCount} {hasVoted ? 'Voted' : 'Vote'}
    </button>
  );
}
