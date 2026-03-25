'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import {
  approveClubBookSuggestionAction,
  dismissClubBookSuggestionAction,
} from '@/lib/actions/club.actions';

type Suggestion = {
  id: string;
  title: string;
  author: string;
  createdAt: Date;
  suggestedBy: string | null;
};

export function ClubSuggestionsPanel({
  suggestions,
  clubId,
}: {
  suggestions: Suggestion[];
  clubId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  if (suggestions.length === 0) return null;

  const handleApprove = async (id: string) => {
    setLoading(id);
    await approveClubBookSuggestionAction(id, clubId);
    setLoading(null);
    router.refresh();
  };

  const handleDismiss = async (id: string) => {
    setLoading(id);
    await dismissClubBookSuggestionAction(id, clubId);
    setLoading(null);
    router.refresh();
  };

  return (
    <div className="max-w-xl mb-4">
      <p className="text-xs font-medium text-white/80 mb-2">Suggestions</p>
      <div className="rounded-xl bg-[#1c1c1c] border border-[#2a2a2a] px-4">
        {suggestions.map((s, i) => (
          <div
            key={s.id}
            className={`flex items-center gap-3 py-3.5 ${
              i < suggestions.length - 1 ? 'border-b border-[#2a2a2a]' : ''
            }`}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{s.title}</p>
              <p className="text-xs text-white/80 truncate">
                {s.author}
                {s.suggestedBy ? ` · ${s.suggestedBy}` : ''}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {loading === s.id ? (
                <Loader2 className="w-4 h-4 text-white/80 animate-spin" />
              ) : (
                <>
                  <button
                    onClick={() => handleApprove(s.id)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-[#FFC300]/15 text-yellow-500 hover:bg-[#FFC300]/25 transition-colors font-medium"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleDismiss(s.id)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-[#2a2a2a] text-white/80 hover:bg-[#333] transition-colors"
                  >
                    Dismiss
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
