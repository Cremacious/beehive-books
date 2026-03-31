'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { resolveClubBookSuggestionAction } from '@/lib/actions/club.actions';

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

  const handleResolve = async (id: string, action: 'APPROVE' | 'REJECT') => {
    setLoading(id);
    await resolveClubBookSuggestionAction(id, clubId, action);
    setLoading(null);
    router.refresh();
  };

  return (
    <div className="max-w-xl mb-4">
      <p className="text-xs font-semibold text-white/80 uppercase tracking-wider mb-2">
        Suggestions
      </p>
      <div className="rounded-xl bg-[#1c1c1c] border border-[#2a2a2a] px-4">
        {suggestions.map((s) => (
          <div
            key={s.id}
            className="flex items-center gap-3 py-2.5 border-b border-[#2a2a2a] last:border-b-0"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">
                <span className="font-medium">{s.title}</span>
                <span className="text-white/80"> by {s.author}</span>
                {s.suggestedBy && (
                  <span className="text-white/80"> — {s.suggestedBy}</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {loading === s.id ? (
                <Loader2 className="w-4 h-4 text-white/80 animate-spin" />
              ) : (
                <>
                  <button
                    onClick={() => handleResolve(s.id, 'APPROVE')}
                    className="text-xs px-3 py-1.5 rounded-lg bg-[#FFC300] text-black font-medium hover:bg-[#FFD040] transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleResolve(s.id, 'REJECT')}
                    className="text-xs px-3 py-1.5 rounded-lg bg-[#2a2a2a] text-white/80 hover:bg-[#333] transition-colors"
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
