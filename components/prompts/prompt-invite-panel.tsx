'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FriendInvitePicker } from '@/components/shared/friend-invite-picker';
import { inviteFriendsToPromptAction } from '@/lib/actions/prompt.actions';
import type { InvitableFriend } from '@/lib/actions/prompt.actions';

interface PromptInvitePanelProps {
  promptId: string;
  friends: InvitableFriend[];
}

export function PromptInvitePanel({ promptId, friends }: PromptInvitePanelProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  async function handleSend() {
    if (selectedIds.length === 0) return;
    setLoading(true);
    setMessage(null);
    const result = await inviteFriendsToPromptAction(promptId, selectedIds);
    setLoading(false);
    setMessage({ text: result.message, error: !result.success });
    if (result.success) setSelectedIds([]);
  }

  if (friends.length === 0) return null;

  return (
    <div className="mt-6 rounded-2xl bg-[#1e1e1e] border border-[#2a2a2a] p-5">
      <h2 className="text-xs font-semibold text-white/80 uppercase tracking-wider mb-4">
        Invite Friends
      </h2>

      <FriendInvitePicker
        friends={friends}
        selectedIds={selectedIds}
        onChange={setSelectedIds}
      />

      {message && (
        <p
          className={`mt-3 text-sm rounded-xl px-4 py-2.5 ${
            message.error
              ? 'text-red-400 bg-red-400/10'
              : 'text-green-400 bg-green-400/10'
          }`}
        >
          {message.text}
        </p>
      )}

      <div className="mt-4">
        <Button
          onClick={handleSend}
          disabled={selectedIds.length === 0 || loading}
          size="sm"
        >
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {loading ? 'Sending…' : `Send ${selectedIds.length > 0 ? `${selectedIds.length} ` : ''}Invite${selectedIds.length !== 1 ? 's' : ''}`}
        </Button>
      </div>
    </div>
  );
}
