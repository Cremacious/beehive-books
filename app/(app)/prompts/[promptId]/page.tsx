import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { Clock, Trophy, Users, FileText, PenLine, Lock } from 'lucide-react';
import BackButton from '@/components/shared/back-button';
import { ExpandableDescription } from '@/components/shared/expandable-description';
import { EntryList } from '@/components/prompts/entry-list';
import { InviteActions } from '@/components/prompts/invite-actions';
import { DeletePromptButton } from '@/components/prompts/delete-prompt-button';
import { EndPromptButton } from '@/components/prompts/end-prompt-button';
import {
  getPromptAction,
  getPromptEntriesAction,
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

function formatCountdown(endDate: Date): string {
  const diff = new Date(endDate).getTime() - Date.now();
  if (diff <= 0) return 'Ended';
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hours}h left`;
  return `${hours}h left`;
}

function UserAvatar({ user, size = 8 }: { user: PromptUser; size?: number }) {
  const name = user.username || '?';
  const cls = `w-${size} h-${size} rounded-full overflow-hidden bg-[#2a2000] flex items-center justify-center shrink-0`;
  return (
    <div className={cls}>
      {user.image ? (
        <Image
          src={user.image}
          alt={name}
          width={32}
          height={32}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-xs font-bold text-[#FFC300]">
          {(name[0] || '?').toUpperCase()}
        </span>
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
  const isEnded =
    prompt.status === 'ENDED' || new Date(prompt.endDate) < new Date();
  const myInvite = prompt.myInviteStatus;
  const hasEntry = !!prompt.myEntryId;
  const canSubmit =
    !isEnded &&
    !hasEntry &&
    (isCreator || myInvite === 'ACCEPTED' || prompt.privacy !== 'PRIVATE');

  const entries = await getPromptEntriesAction(promptId);

  const creatorName = prompt.creator.username || 'Unknown';

  const acceptedParticipants = prompt.invites.filter(
    (i) => i.status === 'ACCEPTED',
  );

  return (
    <div className="px-4 py-6 md:px-8 max-w-4xl mx-auto">
      <BackButton href="/prompts" label="Prompts" className="mb-6" />

      
      <div className="mt-6 rounded-2xl bg-[#252525] border border-[#2a2a2a] shadow-xl overflow-hidden">
        <div
          className={`h-1.5 w-full ${isEnded ? 'bg-white/10' : 'bg-[#FFC300]'}`}
        />
        <div className="p-6 md:p-8">
   
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                  isEnded
                    ? 'bg-white/10 text-white/80'
                    : 'bg-[#FFC300]/10 text-[#FFC300]'
                }`}
              >
                {isEnded ? 'Ended' : 'Active'}
              </span>
              <span className="text-xs text-white/80 uppercase tracking-wider font-medium">
                {prompt.privacy === 'PUBLIC' ? 'Public' : prompt.privacy === 'FRIENDS' ? 'Friends' : 'Private'}
              </span>
            </div>

         
            {isCreator && (
              <div className="flex items-center gap-2">
                <Link
                  href={`/prompts/${promptId}/edit`}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-white/5 text-white/80 border border-[#333] hover:text-white hover:border-[#FFC300]/40 transition-all"
                >
                  <PenLine className="w-3.5 h-3.5" />
                  Edit
                </Link>
                {!isEnded && <EndPromptButton promptId={promptId} />}
                <DeletePromptButton promptId={promptId} />
              </div>
            )}
          </div>

 
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight mainFont">
            {prompt.title}
          </h1>

     
          <div className="text-white/80 text-sm leading-relaxed mb-5">
            <ExpandableDescription text={prompt.description} />
          </div>

      
          <div className="flex flex-wrap items-center gap-5 text-sm text-white border-t border-[#2a2a2a] pt-5">
            <div className="flex items-center gap-2">
              <UserAvatar user={prompt.creator} size={6} />
              <span>{creatorName}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              {prompt.entryCount} entr{prompt.entryCount !== 1 ? 'ies' : 'y'}
            </div>
            <div
              className={`flex items-center gap-1.5 ${isEnded ? '' : 'text-[#FFC300]/80'}`}
            >
              {isEnded ? (
                <Trophy className="w-4 h-4" />
              ) : (
                <Clock className="w-4 h-4" />
              )}
              {isEnded
                ? `Ended ${formatDate(prompt.endDate)}`
                : formatCountdown(prompt.endDate)}
            </div>
          </div>
        </div>
      </div>

   
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
                <p className="text-sm font-medium text-white">
                  {creatorName}
                </p>
                <p className="text-xs text-yellow-500">Creator</p>
              </div>
            </div>
            {acceptedParticipants.map((inv) => {
              const name = inv.user.username || 'Unknown';
              return (
                <div key={inv.id} className="flex items-center gap-2">
                  <UserAvatar user={inv.user} size={7} />
                  <p className="text-xs font-medium text-white/70">{name}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {myInvite === 'PENDING' && !isCreator && (
        <div className="mt-6 p-4 rounded-2xl bg-[#FFC300]/5 border border-[#FFC300]/20 flex items-center justify-between gap-4">
          <p className="text-sm text-[#FFC300]">
            You have been invited to this challenge!
          </p>
          <InviteActions promptId={promptId} />
        </div>
      )}


      {canSubmit && (
        <div className="mt-6 p-5 rounded-2xl bg-[#1e1e1e] border border-[#FFC300]/20 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-white">
              Ready to participate?
            </p>
            <p className="text-sm text-white/70 mt-0.5">
              Write and submit your entry before the deadline.
            </p>
          </div>
          <Link
            href={`/prompts/${promptId}/create`}
            className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FFC300] text-black text-sm font-semibold hover:bg-[#FFD54F] transition-colors"
          >
            <PenLine className="w-4 h-4" />
            Write Entry
          </Link>
        </div>
      )}

      {hasEntry && !isEnded && !isCreator && (
        <div className="mt-6 p-4 rounded-2xl bg-white/3 border border-[#2a2a2a] flex items-center gap-3">
          <Lock className="w-4 h-4 text-white shrink-0" />
          <p className="text-sm text-white">
            Your entry is locked until {formatDate(prompt.endDate)}.
          </p>
          {prompt.myEntryId && (
            <Link
              href={`/prompts/${promptId}/${prompt.myEntryId}`}
              className="ml-auto text-xs text-[#FFC300] hover:underline shrink-0"
            >
              Preview →
            </Link>
          )}
        </div>
      )}

      {isEnded && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 mainFont">
          
            Entries ({entries.length})
          </h2>
          <EntryList
            entries={entries}
            promptId={promptId}
            currentUserId={userId ?? null}
          />
        </div>
      )}

   
      {!isEnded && (
        <div className="mt-8 rounded-xl border border-dashed border-[#2a2a2a] py-8 text-center">
          <Clock className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
          <p className="text-sm text-white">
            {prompt.entryCount} entr{prompt.entryCount !== 1 ? 'ies' : 'y'}{' '}
            submitted so far.
          </p>
          <p className="text-xs text-white/90 mt-1">
            All entries will be revealed when the challenge ends.
          </p>
        </div>
      )}
    </div>
  );
}
