import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { Users, Lock } from 'lucide-react';
import BackButton from '@/components/shared/back-button';
import { EntryList } from '@/components/prompts/entry-list';
import { InviteActions } from '@/components/prompts/invite-actions';
import { PromptInvitePanel } from '@/components/prompts/prompt-invite-panel';
import { PromptHeader } from '@/components/prompts/prompt-header';
import {
  getPromptAction,
  getPromptEntriesAction,
  getPromptFriendsForInviteAction,
  getPromptPendingInvitedFriendsAction,
  setAuthorChoiceAction,
} from '@/lib/actions/prompt.actions';
import type { PromptUser } from '@/lib/types/prompt.types';

type Props = { params: Promise<{ promptId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { promptId } = await params;
  try {
    const prompt = await getPromptAction(promptId);
    return {
      title: prompt.title,
      description: prompt.description
        ? prompt.description.slice(0, 155)
        : `A writing challenge on Beehive Books.`,
    };
  } catch {
    return { title: 'Challenge' };
  }
}

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function UserAvatar({ user, size = 8 }: { user: PromptUser; size?: number }) {
  const name = user.username || '?';
  const cls = `w-${size} h-${size} rounded-full overflow-hidden bg-[#2a2000] flex items-center justify-center shrink-0`;
  return (
    <div className={cls}>
      {user.image ? (
        <Image src={user.image} alt={name} width={32} height={32} className="w-full h-full object-cover" />
      ) : (
        <span className="text-xs font-bold text-yellow-500">{(name[0] || '?').toUpperCase()}</span>
      )}
    </div>
  );
}

export default async function PromptDetailPage({ params }: Props) {
  const { promptId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id ?? null;

  let prompt;
  try {
    prompt = await getPromptAction(promptId);
  } catch {
    notFound();
  }

  const isCreator = userId === prompt.creator.id;
  const isActive = prompt.status === 'ACTIVE';
  const isVoting = prompt.status === 'VOTING';
  const isEnded = prompt.status === 'ENDED';
  const isRevealable = isVoting || isEnded;

  const myInvite = prompt.myInviteStatus;
  const hasEntry = !!prompt.myEntryId;
  const canSubmit =
    isActive &&
    !hasEntry &&
    (isCreator || myInvite === 'ACCEPTED' || prompt.privacy !== 'PRIVATE');

  const [entries, invitableFriends, pendingInvitedFriends] = await Promise.all([
    getPromptEntriesAction(promptId),
    isCreator && isActive ? getPromptFriendsForInviteAction(promptId) : Promise.resolve([]),
    isCreator && isActive ? getPromptPendingInvitedFriendsAction(promptId) : Promise.resolve([]),
  ]);

  const acceptedParticipants = prompt.invites.filter((i) => i.status === 'ACCEPTED');

  return (
    <div className="px-4 py-6 md:px-8 max-w-4xl mx-auto">
      <BackButton href="/prompts" label="Prompts" className="mb-6" />

      <PromptHeader
        prompt={prompt}
        entries={entries}
        isCreator={isCreator}
        promptId={promptId}
        canSubmit={canSubmit}
      />

      {/* Participants */}
      {(acceptedParticipants.length > 0 || isCreator) && (
        <div className="mt-6 p-5 rounded-2xl bg-[#1e1e1e] border border-[#2a2a2a]">
          <h2 className="text-xs font-semibold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
            <Users className="w-3.5 h-3.5" />
            Participants ({acceptedParticipants.length + 1})
          </h2>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <UserAvatar user={prompt.creator} size={7} />
              <div>
                <p className="text-sm font-medium text-white">{prompt.creator.username ?? 'Unknown'}</p>
                <p className="text-xs text-yellow-500">Creator</p>
              </div>
            </div>
            {acceptedParticipants.map((inv) => (
              <div key={inv.id} className="flex items-center gap-2">
                <UserAvatar user={inv.user} size={7} />
                <p className="text-xs font-medium text-white/80">{inv.user.username ?? 'Unknown'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite panel */}
      {isCreator && isActive && (invitableFriends.length > 0 || pendingInvitedFriends.length > 0) && (
        <PromptInvitePanel promptId={promptId} friends={invitableFriends} pendingFriends={pendingInvitedFriends} />
      )}

      {/* Pending invite banner */}
      {myInvite === 'PENDING' && !isCreator && (
        <div className="mt-6 p-4 rounded-2xl bg-[#FFC300]/5 border border-[#FFC300]/20 flex items-center justify-between gap-4">
          <p className="text-sm text-yellow-500">You have been invited to this challenge!</p>
          <InviteActions promptId={promptId} />
        </div>
      )}

      {/* Locked entry notice */}
      {hasEntry && isActive && !isCreator && (
        <div className="mt-6 p-4 rounded-2xl bg-white/3 border border-[#2a2a2a] flex items-center gap-3">
          <Lock className="w-4 h-4 text-white shrink-0" />
          <p className="text-sm text-white">
            Your entry is locked until {formatDate(prompt.endDate)}.
          </p>
          {prompt.myEntryId && (
            <Link
              href={`/prompts/${promptId}/${prompt.myEntryId}`}
              className="ml-auto text-xs text-yellow-500 hover:underline shrink-0"
            >
              Preview →
            </Link>
          )}
        </div>
      )}

      {/* Entries — shown during VOTING and ENDED */}
      {isRevealable && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 mainFont">
            Entries
            <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[10px] font-bold bg-[#FFC300] text-black">
              {entries.length}
            </span>
          </h2>
          <EntryList
            entries={entries}
            promptId={promptId}
            currentUserId={userId}
            promptStatus={prompt.status}
            isCreator={isCreator}
            authorChoiceId={prompt.authorChoiceId}
          />
        </div>
      )}

      {/* Hidden entries notice — ACTIVE only */}
      {isActive && (
        <div className="mt-8 rounded-xl border border-dashed border-[#2a2a2a] py-8 text-center">
          <p className="text-sm text-white">
            {prompt.entryCount} {prompt.entryCount === 1 ? 'entry' : 'entries'} submitted so far.
          </p>
          <p className="text-xs text-white/80 mt-1">
            All entries will be revealed when the challenge ends.
          </p>
        </div>
      )}
    </div>
  );
}
