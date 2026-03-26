import Link from 'next/link';
import Image from 'next/image';
import { Trophy, Clock, FileText, PenLine } from 'lucide-react';
import { ExpandableDescription } from '@/components/shared/expandable-description';
import { EndPromptButton } from '@/components/prompts/end-prompt-button';
import { DeletePromptButton } from '@/components/prompts/delete-prompt-button';
import type { PromptDetail, PromptEntry, PromptUser } from '@/lib/types/prompt.types';

function formatCountdown(date: Date): string {
  const diff = new Date(date).getTime() - Date.now();
  if (diff <= 0) return '0h 0m';
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${mins}m left`;
  return `${mins}m left`;
}

function formatVotingCountdown(date: Date): string {
  const diff = new Date(date).getTime() - Date.now();
  if (diff <= 0) return '0h 0m';
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

function UserAvatar({ user }: { user: PromptUser }) {
  const name = user.username || '?';
  return (
    <div className="w-6 h-6 rounded-full overflow-hidden bg-[#2a2000] flex items-center justify-center shrink-0">
      {user.image ? (
        <Image src={user.image} alt={name} width={24} height={24} className="w-full h-full object-cover" />
      ) : (
        <span className="text-[10px] font-bold text-yellow-500">{(name[0] || '?').toUpperCase()}</span>
      )}
    </div>
  );
}

interface Props {
  prompt: PromptDetail;
  entries: PromptEntry[];
  isCreator: boolean;
  promptId: string;
  canSubmit: boolean;
}

export function PromptHeader({ prompt, entries, isCreator, promptId, canSubmit }: Props) {
  const status = prompt.status;

  const communityWinner = prompt.communityWinnerId
    ? entries.find((e) => e.id === prompt.communityWinnerId) ?? null
    : null;
  const authorChoice = prompt.authorChoiceId
    ? entries.find((e) => e.id === prompt.authorChoiceId) ?? null
    : null;
  const leader = entries[0] ?? null; // entries already sorted by likeCount desc

  const statePill =
    status === 'ACTIVE'
      ? <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-white">Active</span>
      : status === 'VOTING'
        ? <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#FFC300]/10 border border-[#FFC300]/20 text-yellow-500">Voting Open</span>
        : <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/10 text-white/80">Ended</span>;

  const accentBar = status === 'ENDED' ? 'bg-white/10' : 'bg-[#FFC300]';

  return (
    <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] shadow-xl overflow-hidden">
      <div className={`h-1.5 w-full ${accentBar}`} />
      <div className="p-6 md:p-8">

        {/* Top row — state pill + creator controls */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-2 flex-wrap">
            {statePill}
            <span className="text-xs text-white/80 uppercase tracking-wider font-medium">
              {prompt.privacy === 'PUBLIC' ? 'Public' : prompt.privacy === 'FRIENDS' ? 'Friends' : 'Private'}
            </span>
          </div>
          {isCreator && (
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/prompts/${promptId}/edit`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-white/5 text-white/80 border border-[#2a2a2a] hover:text-white hover:border-[#FFC300]/40 transition-all"
              >
                <PenLine className="w-3.5 h-3.5" />
                Edit
              </Link>
              {status === 'ACTIVE' && <EndPromptButton promptId={promptId} />}
              <DeletePromptButton promptId={promptId} />
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight mainFont">
          {prompt.title}{status === 'ENDED' ? ' — Ended' : ''}
        </h1>

        {/* Description */}
        <div className="text-white/80 text-sm leading-relaxed mb-5">
          <ExpandableDescription text={prompt.description} />
        </div>

        {/* State-specific body */}
        {status === 'ACTIVE' && (
          <div className="space-y-4">
            {/* Countdown */}
            <div>
              <p className="text-xs text-white/80 uppercase tracking-wider mb-1">Time remaining</p>
              <p className="text-3xl font-bold text-yellow-500">{formatCountdown(prompt.endDate)}</p>
            </div>

            {/* Stats + CTA */}
            <div className="flex flex-wrap items-center gap-5 border-t border-[#2a2a2a] pt-4">
              <div className="flex items-center gap-2 text-sm text-white">
                <UserAvatar user={prompt.creator} />
                <span>{prompt.creator.username ?? 'Unknown'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-white">
                <FileText className="w-4 h-4" />
                {prompt.entryCount} {prompt.entryCount === 1 ? 'entry' : 'entries'}
              </div>
              {canSubmit && (
                <Link
                  href={`/prompts/${promptId}/create`}
                  className="ml-auto shrink-0 flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#FFC300] text-black text-sm font-bold hover:bg-[#FFD040] transition-colors"
                >
                  <PenLine className="w-4 h-4" />
                  Write Entry
                </Link>
              )}
            </div>
          </div>
        )}

        {status === 'VOTING' && (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-white">Voting is open — vote for your favourite entry</p>

            {prompt.votingEndsAt && (
              <div>
                <p className="text-xs text-white/80 mb-1">Voting closes in</p>
                <p className="text-xl font-bold text-yellow-500">{formatVotingCountdown(prompt.votingEndsAt)}</p>
              </div>
            )}

            {leader && (
              <div className="flex items-center gap-2 text-sm text-white/80 bg-[#1e1e1e] rounded-xl px-4 py-2.5 border border-[#2a2a2a]">
                <span className="text-white/80">Current leader:</span>
                <span className="text-white font-medium">{leader.user.username ?? 'Anonymous'}</span>
                <span className="text-white/80">with {leader.likeCount} {leader.likeCount === 1 ? 'vote' : 'votes'}</span>
              </div>
            )}

            <div className="flex items-center gap-5 border-t border-[#2a2a2a] pt-4 text-sm text-white">
              <div className="flex items-center gap-2">
                <UserAvatar user={prompt.creator} />
                <span>{prompt.creator.username ?? 'Unknown'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                {prompt.entryCount} {prompt.entryCount === 1 ? 'entry' : 'entries'}
              </div>
            </div>
          </div>
        )}

        {status === 'ENDED' && (
          <div className="space-y-3">
            {communityWinner && (
              <div className="bg-[#1e1e1e] border border-[#FFC300]/20 rounded-2xl p-4 flex items-start gap-3">
                <Trophy className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="inline-block bg-[#FFC300] text-black text-xs font-bold px-2 py-0.5 rounded-full mb-1.5">
                    Community Pick
                  </span>
                  {communityWinner.title && (
                    <p className="text-sm font-semibold text-white truncate">{communityWinner.title}</p>
                  )}
                  <p className="text-xs text-white/80">{communityWinner.user.username ?? 'Anonymous'} · {communityWinner.likeCount} votes</p>
                </div>
              </div>
            )}

            {authorChoice && (
              <div className="bg-[#1e1e1e] border border-[#FFC300]/20 rounded-2xl p-4 flex items-start gap-3">
                <Trophy className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="inline-block bg-white/10 border border-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full mb-1.5">
                    Author&apos;s Pick
                  </span>
                  {authorChoice.title && (
                    <p className="text-sm font-semibold text-white truncate">{authorChoice.title}</p>
                  )}
                  <p className="text-xs text-white/80">{authorChoice.user.username ?? 'Anonymous'}</p>
                </div>
              </div>
            )}

            {!communityWinner && !authorChoice && (
              <p className="text-sm text-white/80">No winners have been announced yet.</p>
            )}

            <p className="text-xs text-white/80 pt-1">View all entries below</p>

            <div className="flex items-center gap-5 border-t border-[#2a2a2a] pt-4 text-sm text-white">
              <div className="flex items-center gap-2">
                <UserAvatar user={prompt.creator} />
                <span>{prompt.creator.username ?? 'Unknown'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                {prompt.entryCount} {prompt.entryCount === 1 ? 'entry' : 'entries'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
