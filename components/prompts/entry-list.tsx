'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { Button } from '../ui/button';
import { setAuthorChoiceAction } from '@/lib/actions/prompt.actions';
import type { PromptEntry, PromptUser, PromptStatus } from '@/lib/types/prompt.types';

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

interface Props {
  entries: PromptEntry[];
  promptId: string;
  currentUserId: string | null;
  promptStatus: PromptStatus;
  isCreator: boolean;
  authorChoiceId: string | null;
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
      <span className="text-xs text-white/80 italic">Author&apos;s Pick set</span>
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
      Set as Author&apos;s Pick
    </button>
  );
}

export function EntryList({
  entries,
  promptId,
  promptStatus,
  isCreator,
  authorChoiceId,
}: Props) {
  const isLeaderboard = promptStatus === 'VOTING' || promptStatus === 'ENDED';

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
                  Author&apos;s Pick
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

                {/* Vote count — prominent during VOTING/ENDED */}
                {isLeaderboard && (
                  <span className="flex items-center gap-1 text-sm text-white/80 ml-auto mr-2">
                    <Heart className="w-3.5 h-3.5 text-yellow-500" />
                    {entry.likeCount}
                  </span>
                )}

                <Button asChild size="sm" className={isLeaderboard ? '' : 'ml-auto'}>
                  <Link href={`/prompts/${promptId}/${entry.id}`} className="text-sm">
                    {promptStatus === 'VOTING' ? 'Vote →' : 'Read entry →'}
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

              {/* Author's choice picker — creator only, VOTING or ENDED */}
              {isCreator && (promptStatus === 'VOTING' || promptStatus === 'ENDED') && (
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
