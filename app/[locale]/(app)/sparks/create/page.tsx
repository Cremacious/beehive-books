import type { Metadata } from 'next';
import BackButton from '@/components/shared/back-button';
import { PromptForm } from '@/components/prompts/prompt-form';
import { getMyFriendsDataAction } from '@/lib/actions/friend.actions';

export const metadata: Metadata = {
  title: 'New Challenge',
  description: 'Create a new writing challenge and invite friends to participate.',
};

export default async function CreatePromptPage() {
  const { friends } = await getMyFriendsDataAction();

  return (
    <div className="px-4 py-6 md:px-8 max-w-3xl mx-auto overflow-x-hidden">
      <BackButton href="/prompts" label="Prompts" />

      <div className="mt-6 mb-8">

      </div>

      <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] p-6">
        <PromptForm mode="create" friends={friends.map((f) => f.user)} />
      </div>
    </div>
  );
}
