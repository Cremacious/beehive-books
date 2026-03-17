import Image from 'next/image';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { FileText } from 'lucide-react';
import BackButton from '@/components/shared/back-button';
import { EntryContent } from '@/components/prompts/entry-content';
import { EntryCommentSection } from '@/components/prompts/entry-comment-section';
import { EntryLikeButton } from '@/components/prompts/entry-like-button';
import { getEntryAction } from '@/lib/actions/prompt.actions';
import type { PromptUser } from '@/lib/types/prompt.types';

type Props = { params: Promise<{ promptId: string; entryId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { promptId, entryId } = await params;
  try {
    const entry = await getEntryAction(promptId, entryId);
    const author = entry.user.username || 'Anonymous';
    return {
      title: `Entry by ${author}`,
      description: `Read ${author}'s entry on Beehive Books.`,
    };
  } catch {
    return { title: 'Entry' };
  }
}

function displayName(user: PromptUser): string {
  return user.username || 'Anonymous';
}

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function UserAvatar({ user }: { user: PromptUser }) {
  const name = user.username || '?';
  return (
    <div className="w-10 h-10 rounded-full overflow-hidden bg-[#2a2000] flex items-center justify-center shrink-0">
      {user.image ? (
        <Image
          src={user.image}
          alt={name}
          width={40}
          height={40}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-base font-bold text-[#FFC300]">
          {(name[0] || '?').toUpperCase()}
        </span>
      )}
    </div>
  );
}

export default async function EntryDetailPage({ params }: Props) {
  const { promptId, entryId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id ?? null;

  let entry;
  try {
    entry = await getEntryAction(promptId, entryId);
  } catch {
    notFound();
  }

  return (
    <div className="px-4 py-6 md:px-8 max-w-3xl mx-auto">
      <BackButton href={`/prompts/${promptId}`} label="Back to Prompt" />

      <div className="mt-6 mb-8 p-6 rounded-2xl bg-[#252525] border border-[#2a2a2a]">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <UserAvatar user={entry.user} />
            <div>
              <p className="text-lg font-semibold text-white">
                {displayName(entry.user)}
              </p>
            </div>
          </div>

          <EntryLikeButton
            entryId={entryId}
            likeCount={entry.likeCount}
            likedByMe={entry.likedByMe}
            currentUserId={userId ?? null}
          />
        </div>

        <div className="flex items-center gap-4 text-sm text-white">
          <span className="flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" />
            {entry.wordCount} words
          </span>
          <span>Submitted {formatDate(entry.createdAt)}</span>
        </div>
      </div>

      <div className="prose prose-invert max-w-none mb-4">
        <EntryContent content={entry.content} />
      </div>

      <EntryCommentSection
        entryId={entryId}
        comments={entry.comments}
        currentUserId={userId ?? null}
      />
    </div>
  );
}
