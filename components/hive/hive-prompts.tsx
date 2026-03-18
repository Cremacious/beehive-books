'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Sparkles, PenLine, Clock, Users, RefreshCw } from 'lucide-react';
import { getHivePromptsAction } from '@/lib/actions/hive-prompts.actions';
import type { HivePromptCard } from '@/lib/types/hive.types';

interface HivePromptsProps {
  hiveId: string;
  initialPrompts: HivePromptCard[];
}

function daysLeft(endDate: Date): number {
  return Math.max(
    0,
    Math.ceil((new Date(endDate).getTime() - Date.now()) / 86_400_000),
  );
}

function PromptCard({ prompt }: { prompt: HivePromptCard }) {
  const days = daysLeft(prompt.endDate);
  const urgent = days <= 3;

  return (
    <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] p-4 flex flex-col gap-3 hover:border-[#2a2a2a] transition-all">
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-white leading-snug mb-1.5">
          {prompt.title}
        </h3>
        <p className="text-xs text-white/80 leading-relaxed line-clamp-3">
          {prompt.description}
        </p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <span className="flex items-center gap-1 text-xs text-white/80">
          <Users className="w-3 h-3" />
          {prompt.entryCount} {prompt.entryCount === 1 ? 'entry' : 'entries'}
        </span>
        <span
          className={`flex items-center gap-1 text-xs ${
            urgent ? 'text-red-400' : 'text-white/80'
          }`}
        >
          <Clock className="w-3 h-3" />
          {days === 0 ? 'Ends today' : `${days}d left`}
        </span>
      </div>

      <Link
        href={`/prompts/${prompt.id}`}
        className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-[#FFC300]/10 text-[#FFC300] text-xs font-medium hover:bg-[#FFC300]/20 transition-all"
      >
        <PenLine className="w-3.5 h-3.5" />
        Write from this prompt
      </Link>
    </div>
  );
}

export default function HivePrompts({ hiveId, initialPrompts }: HivePromptsProps) {
  const [prompts, setPrompts] = useState<HivePromptCard[]>(initialPrompts);
  const [refreshing, startTransition] = useTransition();

  const refresh = () => {
    startTransition(async () => {
      const fresh = await getHivePromptsAction(hiveId);
      setPrompts(fresh);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FFC300]" />
            Writing Prompts
          </h3>
          <p className="text-xs text-white/80 mt-0.5">
            Active public prompts from the community — spark your next scene.
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 text-xs text-white/80 hover:text-white/80 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {prompts.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[#252525] flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-[#FFC300]/40" />
          </div>
          <p className="text-sm text-white/80">No active prompts right now.</p>
          <p className="text-xs text-white/80 max-w-xs">
            Check back later, or{' '}
            <Link href="/prompts/create" className="text-[#FFC300]/60 hover:text-[#FFC300]">
              create a prompt
            </Link>{' '}
            for the community.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {prompts.map((p) => (
            <PromptCard key={p.id} prompt={p} />
          ))}
        </div>
      )}

      <div className="text-center pt-2">
        <Link
          href="/prompts"
          className="text-xs text-white/80 hover:text-white/80 transition-colors"
        >
          Browse all prompts →
        </Link>
      </div>
    </div>
  );
}
