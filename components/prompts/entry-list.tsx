'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, FileText } from 'lucide-react';
import { usePromptStore } from '@/lib/stores/prompt-store';
import type { PromptEntry, PromptUser } from '@/lib/types/prompt.types';

function UserAvatar({ user }: { user: PromptUser }) {
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || '?';
  return (
    <div className="w-8 h-8 rounded-full overflow-hidden bg-[#2a2000] flex items-center justify-center shrink-0">
      {user.imageUrl ? (
        <Image src={user.imageUrl} alt={name} width={32} height={32} className="w-full h-full object-cover" />
      ) : (
        <span className="text-xs font-bold text-[#FFC300]">{(name[0] || '?').toUpperCase()}</span>
      )}
    </div>
  );
}

function displayName(user: PromptUser): string {
  return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || 'Anonymous';
}

interface Props {
  entries:       PromptEntry[];
  promptId:      string;
  currentUserId: string | null;
}

export function EntryList({ entries, promptId, currentUserId }: Props) {
  const { optimisticLikes, toggleEntryLike } = usePromptStore();

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#2a2a2a] py-12 text-center">
        <p className="text-sm text-white/70">No entries yet — be the first to write!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => {
        const isLiked   = optimisticLikes[entry.id] ?? entry.likedByMe;
        const likeCount = entry.likeCount + ((optimisticLikes[entry.id] !== undefined)
          ? (optimisticLikes[entry.id] ? 1 : -1) - (entry.likedByMe ? 1 : -1)
          : 0
        );

        return (
          <div
            key={entry.id}
            className="flex items-start gap-4 p-4 rounded-2xl bg-[#1e1e1e] border border-[#2a2a2a] hover:border-[#FFC300]/20 transition-all"
          >
            <UserAvatar user={entry.user} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-white/85">{displayName(entry.user)}</span>
                {entry.user.username && (
                  <span className="text-xs text-white/70">@{entry.user.username}</span>
                )}
                <span className="ml-auto flex items-center gap-1 text-xs text-white/70">
                  <FileText className="w-3 h-3" />
                  {entry.wordCount} words
                </span>
              </div>

              {/* Preview of content (strip HTML) */}
              <p
                className="text-sm text-white/70 line-clamp-3 leading-relaxed mb-3"
                dangerouslySetInnerHTML={{
                  __html: entry.content.replace(/<[^>]*>/g, ' ').slice(0, 200),
                }}
              />

              <div className="flex items-center gap-4">
                {/* Like button */}
                <button
                  onClick={() => currentUserId && toggleEntryLike(entry.id, isLiked)}
                  disabled={!currentUserId}
                  className={`flex items-center gap-1.5 text-xs transition-colors ${
                    isLiked ? 'text-[#FFC300]' : 'text-white/70 hover:text-white/70'
                  } disabled:cursor-default`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                  {likeCount}
                </button>

                {/* Read full entry */}
                <Link
                  href={`/prompts/${promptId}/${entry.id}`}
                  className="text-xs text-white/70 hover:text-[#FFC300] transition-colors ml-auto"
                >
                  Read entry →
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
