import Link from 'next/link';
import type { Metadata } from 'next';
import { Plus, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PromptGrid } from '@/components/prompts/prompt-grid';
import { InviteActions } from '@/components/prompts/invite-actions';
import { getMyPromptsAction } from '@/lib/actions/prompt.actions';

export const metadata: Metadata = { title: 'Prompts · Beehive Books' };

export default async function PromptsPage() {
  const prompts = await getMyPromptsAction();

  const pendingInvites = prompts.filter((p) => p.myInviteStatus === 'PENDING');

  return (
    <div className="px-4 py-6 md:px-8 max-w-6xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Prompts</h1>
          <p className="mt-1 text-base text-white/70">
            Creative challenges and writing competitions
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/prompts/create">
            <Plus />
            New Challenge
          </Link>
        </Button>
      </div>


      {pendingInvites.length > 0 && (
        <div className="mb-8 rounded-2xl bg-[#FFC300]/5 border border-[#FFC300]/20 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#FFC300]" />
            <span className="text-sm font-semibold text-[#FFC300]">
              {pendingInvites.length} pending invite{pendingInvites.length !== 1 ? 's' : ''}
            </span>
          </div>
          {pendingInvites.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-4 py-2 border-t border-[#FFC300]/10"
            >
              <div className="min-w-0">
                <Link
                  href={`/prompts/${p.id}`}
                  className="text-sm font-medium text-white hover:text-[#FFC300] transition-colors truncate block"
                >
                  {p.title}
                </Link>
                <p className="text-xs text-white/70 mt-0.5">
                  by {p.creator.username || 'Unknown'}
                </p>
              </div>
              <InviteActions promptId={p.id} />
            </div>
          ))}
        </div>
      )}


      <PromptGrid prompts={prompts} />
    </div>
  );
}
