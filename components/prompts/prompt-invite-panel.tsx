'use client';

import { useState } from 'react';
import { Loader2, UserPlus, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FriendInvitePicker } from '@/components/shared/friend-invite-picker';
import { inviteFriendsToPromptAction } from '@/lib/actions/prompt.actions';
import type { InvitableFriend } from '@/lib/actions/prompt.actions';

interface PromptInvitePanelProps {
  promptId: string;
  friends: InvitableFriend[];
  pendingFriends?: InvitableFriend[];
}

export function PromptInvitePanel({ promptId, friends, pendingFriends = [] }: PromptInvitePanelProps) {
  const [open, setOpen] = useState(false);
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

  if (friends.length === 0 && pendingFriends.length === 0) return null;

  return (
    <div className="mt-6 rounded-2xl bg-[#1e1e1e] border border-[#2a2a2a] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-sm font-medium text-white hover:bg-white/5 transition-colors"
      >
        <span className="flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-[#FFC300]" />
          Invite Friends
        </span>
        <span className="flex items-center gap-2">
          {pendingFriends.length > 0 && (
            <span className="text-xs text-amber-400/80">
              {pendingFriends.length} pending
            </span>
          )}
          {friends.length > 0 && (
            <span className="text-xs text-white/80">
              {friends.length} available
            </span>
          )}
          <span className="text-xs text-white/80">
            {open ? 'click to close' : 'click to expand'}
          </span>
          {open
            ? <ChevronUp className="w-4 h-4 text-white/80" />
            : <ChevronDown className="w-4 h-4 text-white/80" />
          }
        </span>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-[#2a2a2a]">
          <div className="pt-4 space-y-4">
            <FriendInvitePicker
              friends={friends}
              pendingFriends={pendingFriends}
              selectedIds={selectedIds}
              onChange={setSelectedIds}
            />

            {message && (
              <p
                className={`text-sm rounded-xl px-4 py-2.5 ${
                  message.error
                    ? 'text-red-400 bg-red-400/10'
                    : 'text-green-400 bg-green-400/10'
                }`}
              >
                {message.text}
              </p>
            )}

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
      )}
    </div>
  );
}
