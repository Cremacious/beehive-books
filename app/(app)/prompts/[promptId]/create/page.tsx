import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';
import { Clock } from 'lucide-react';
import BackButton from '@/components/shared/back-button';
import { EntryForm } from '@/components/prompts/entry-form';
import { getPromptAction } from '@/lib/actions/prompt.actions';

export const metadata: Metadata = {
  title: 'Write Entry',
  description: 'Write and submit your entry for this challenge.',
};

type Props = { params: Promise<{ promptId: string }> };

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
}

export default async function CreateEntryPage({ params }: Props) {
  const { promptId } = await params;
  const { userId }   = await auth();
  if (!userId) redirect('/sign-in');

  let prompt;
  try {
    prompt = await getPromptAction(promptId);
  } catch {
    notFound();
  }

  if (prompt.status === 'ENDED' || new Date(prompt.endDate) < new Date()) {
    redirect(`/prompts/${promptId}`);
  }


  if (prompt.myEntryId) {
    redirect(`/prompts/${promptId}/${prompt.myEntryId}`);
  }

  const isCreator  = userId === prompt.creator.clerkId;
  const canSubmit  = isCreator || prompt.myInviteStatus === 'ACCEPTED' || prompt.isPublic;
  if (!canSubmit) redirect(`/prompts/${promptId}`);

  return (
    <div className="px-4 py-6 md:px-8 max-w-3xl mx-auto">
      <BackButton href={`/prompts/${promptId}`} label="Back to Prompt" />

      <div className="mt-6 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Write Your Entry</h1>
        <p className="mt-1 text-white">
          You can only submit one entry — make it count!
        </p>
      </div>


      <div className="mb-8 p-5 rounded-2xl bg-[#1e1e1e] border border-[#2a2a2a]">
        <h2 className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">The Challenge</h2>
        <h3 className="text-base font-semibold text-white mb-2">{prompt.title}</h3>
        <p className="text-sm text-white/80 leading-relaxed">{prompt.description}</p>
        <div className="flex items-center gap-1.5 mt-3 text-xs text-[#FFC300]/70">
          <Clock className="w-3.5 h-3.5" />
          Deadline: {formatDate(prompt.endDate)}
        </div>
      </div>

      <EntryForm promptId={promptId} />
    </div>
  );
}
