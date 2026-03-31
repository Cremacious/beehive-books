'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { VoteButton } from './vote-button';
import { EntryLikeButton } from './entry-like-button';
import { setAuthorChoiceAction } from '@/lib/actions/prompt.actions';
import type { PromptEntry, PromptUser } from '@/lib/types/prompt.types';

function UserAvatar({ user }: { user: PromptUser }) {
  const name = user.username || '?';
  return (
    <div className="w-8 h-8 rounded-full overflow-hidden bg-[#2a2000] flex items-center justify-center shrink-0">
      {user.image ? (
        <Image src={user.image} alt={name} width={32} height={32} className="w-full h-full object-cover" />
      ) : (
        <span className="text-xs font-bold text-yellow-500">{(name[0] || '?').toUpperCase()}</span>
      )}
    </div>
  );
}

function displayName(user: PromptUser): string {
  return user.username || 'Anonymous';
}

interface EntryListProps {
  entries: PromptEntry[];
  promptId: string;
  currentUserId: string | null;
  promptState: 'ACTIVE' | 'VOTING' | 'ENDED';
  votedEntryId?: string | null;
  communityWinnerId?: string | null;
  authorChoiceId?: string | null;
  isCreator?: boolean;
}

function AuthorChoicePicker({
  promptId,
  entryId,
  isAlreadyPicked,
}: {
  promptId: string;
  entryId: string;
  isAlreadyPicked: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (isAlreadyPicked) {
    return (
      <span className="text-xs text-white/80 italic">Creator&apos;s Pick set</span>
    );
  }

  return (
    <button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await setAuthorChoiceAction(promptId, entryId);
          router.refresh();
        })
      }
      className="text-xs text-white/80 hover:text-white transition-colors disabled:opacity-40"
    >
      Set as Creator&apos;s Pick
    </button>
  );
}

export function EntryList({
  entries,
  promptId,
  currentUserId,
  promptState,
  votedEntryId,
  authorChoiceId,
  isCreator,
}: EntryListProps) {
  const isLeaderboard = promptState === 'VOTING' || promptState === 'ENDED';

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#2a2a2a] py-12 text-center">
        <p className="text-sm text-white/80">No entries yet — be the first to write!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry, index) => (
        <div key={entry.id} className="relative">
          {/* Winner badges above card */}
          {(entry.isCommunityWin || entry.isAuthorChoice) && (
            <div className="flex gap-2 mb-1.5">
              {entry.isCommunityWin && (
                <span className="bg-[#FFC300] text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Community Pick
                </span>
              )}
              {entry.isAuthorChoice && (
                <span className="bg-white/10 border border-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Creator&apos;s Pick
                </span>
              )}
            </div>
          )}

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#1e1e1e] border border-[#2a2a2a] hover:border-[#FFC300]/20 transition-all">
            {/* Rank */}
            {isLeaderboard && (
              <div className="shrink-0 w-6 text-center pt-1">
                <span className="text-sm font-bold text-white/80">#{index + 1}</span>
              </div>
            )}

            {/* Avatar */}
            {entry.user.username ? (
              <Link href={`/u/${entry.user.username}`} className="shrink-0 hover:opacity-80 transition-opacity">
                <UserAvatar user={entry.user} />
              </Link>
            ) : (
              <UserAvatar user={entry.user} />
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {entry.user.username ? (
                  <Link href={`/u/${entry.user.username}`} className="font-semibold text-white hover:text-yellow-500 transition-colors">
                    {displayName(entry.user)}
                  </Link>
                ) : (
                  <span className="font-semibold text-white">{displayName(entry.user)}</span>
                )}

                <Button asChild size="sm" className="ml-auto">
                  <Link href={`/prompts/${promptId}/${entry.id}`} className="text-sm">
                    Read entry →
                  </Link>
                </Button>
              </div>

              {entry.title && (
                <p className="text-sm font-medium text-white mb-1">{entry.title}</p>
              )}

              <p
                className="text-sm text-white/80 line-clamp-3 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: entry.content.replace(/<[^>]*>/g, ' ').slice(0, 200),
                }}
              />

              {/* Vote button — only shown during VOTING state */}
              {promptState === 'VOTING' && currentUserId && (
                <div className="mt-3 flex items-center justify-between">
                  <VoteButton
                    entryId={entry.id}
                    promptId={promptId}
                    voteCount={entry.likeCount}
                    hasVoted={votedEntryId === entry.id}
                    isDisabled={!!votedEntryId && votedEntryId !== entry.id}
                  />
                  {votedEntryId === entry.id && (
                    <span className="text-xs text-yellow-500 font-medium">Your vote</span>
                  )}
                </div>
              )}

              {/* Like count during ACTIVE */}
              {promptState === 'ACTIVE' && (
                <div className="mt-2">
                  <EntryLikeButton
                    entryId={entry.id}
                    likeCount={entry.likeCount}
                    likedByMe={entry.likedByMe ?? false}
                    currentUserId={currentUserId}
                  />
                </div>
              )}

              {/* Vote count during ENDED */}
              {promptState === 'ENDED' && (
                <span className="text-xs text-white/80 mt-2 block">{entry.likeCount} votes</span>
              )}

              {/* Creator's choice picker — creator only, VOTING or ENDED */}
              {isCreator && (promptState === 'VOTING' || promptState === 'ENDED') && (
                <div className="mt-2">
                  <AuthorChoicePicker
                    promptId={promptId}
                    entryId={entry.id}
                    isAlreadyPicked={authorChoiceId === entry.id}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
