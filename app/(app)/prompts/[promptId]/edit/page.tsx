import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import BackButton from '@/components/shared/back-button';
import { PromptForm } from '@/components/prompts/prompt-form';
import { getPromptAction } from '@/lib/actions/prompt.actions';
import { getMyFriendsDataAction } from '@/lib/actions/friend.actions';

export const metadata: Metadata = { title: 'Edit Prompt · Beehive Books' };

type Props = { params: Promise<{ promptId: string }> };

export default async function EditPromptPage({ params }: Props) {
  const { promptId } = await params;
  const { userId }   = await auth();
  if (!userId) redirect('/sign-in');

  let prompt;
  try {
    prompt = await getPromptAction(promptId);
  } catch {
    notFound();
  }


  if (userId !== prompt.creator.clerkId) redirect(`/prompts/${promptId}`);

  const { friends } = await getMyFriendsDataAction();

  return (
    <div className="px-4 py-6 md:px-8 max-w-3xl mx-auto">
      <BackButton href={`/prompts/${promptId}`} label="Back to Prompt" />

      <div className="mt-6 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Edit Challenge</h1>
        <p className="mt-1 text-sm text-white/70">Update the details of your prompt.</p>
      </div>

   
      {prompt.entryCount > 0 && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
          <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-400/80">
            This prompt already has {prompt.entryCount} entr{prompt.entryCount !== 1 ? 'ies' : 'y'}.
            Changing the deadline or removing participants may affect the competition.
          </p>
        </div>
      )}

      <PromptForm
        mode="edit"
        prompt={prompt}
        friends={friends.map((f) => f.user)}
      />
    </div>
  );
}
