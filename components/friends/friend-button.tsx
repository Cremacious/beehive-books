'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, UserCheck, UserX, Check } from 'lucide-react';
import {
  sendFriendRequestAction,
  cancelFriendRequestAction,
  acceptFriendRequestAction,
  rejectFriendRequestAction,
  removeFriendAction,
} from '@/lib/actions/friend.actions';
import type { FriendStatus } from '@/lib/actions/friend.actions';
import Popup from '@/components/ui/popup';

interface Props {
  targetUserId: string;
  initialStatus: FriendStatus;
  compact?: boolean;
}

export function FriendButton({
  targetUserId,
  initialStatus,
  compact = false,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<FriendStatus>(initialStatus);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const router = useRouter();

  if (status.status === 'NONE') {
    return (
      <button
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const result = await sendFriendRequestAction(targetUserId);
            if (result.success && result.friendshipId) {
              setStatus({
                status: 'PENDING_SENT',
                friendshipId: result.friendshipId,
              });
            }
            router.refresh();
          })
        }
        className={
          compact
            ? 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 bg-[#FFC300] text-black hover:bg-[#e6b000] active:scale-95'
            : 'inline-flex items-center gap-1 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 bg-[#FFC300] text-black hover:bg-[#e6b000] active:scale-95'
        }
        title="Send friend request"
      >

        <span>{isPending ? 'Sending…' : 'Send Request'}</span>
      </button>
    );
  }

  if (status.status === 'PENDING_SENT') {
    return (
      <button
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await cancelFriendRequestAction(status.friendshipId);
            setStatus({ status: 'NONE' });
            router.refresh();
          })
        }
        className={btn('gray', compact)}
        title="Cancel request"
      >
        Cancel 
   
        {!compact && <span>{isPending ? 'Cancelling…' : 'Request Sent'}</span>}
      </button>
    );
  }

  if (status.status === 'PENDING_RECEIVED') {
    return (
      <div className={compact ? 'flex gap-1' : 'flex gap-2'}>
        <button
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await acceptFriendRequestAction(status.friendshipId);
              setStatus({
                status: 'FRIENDS',
                friendshipId: status.friendshipId,
              });
              router.refresh();
            })
          }
          className={btn('yellow', compact)}
          title="Accept request"
        >
          <Check className={icon(compact)} />
          {!compact && <span>{isPending ? 'Accepting…' : 'Accept'}</span>}
        </button>
        <button
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await rejectFriendRequestAction(status.friendshipId);
              setStatus({ status: 'NONE' });
              router.refresh();
            })
          }
          className={btn('red', compact)}
          title="Decline request"
        >
          <UserX className={icon(compact)} />
          {!compact && <span>Decline</span>}
        </button>
      </div>
    );
  }

  const friendshipId = status.status === 'FRIENDS' ? status.friendshipId : '';

  return (
    <>
      <button
        disabled={isPending}
        onClick={() => setConfirmOpen(true)}
        className={btn('green', compact)}
        title="Remove friend"
      >
        <UserCheck className={icon(compact)} />
        {!compact && <span>{isPending ? 'Removing…' : 'Friends'}</span>}
      </button>

      <Popup
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Remove friend"
        maxWidth="sm"
      >
        <p className="text-sm text-white/80 mb-5">
          Are you sure you want to remove this person as a friend?
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setConfirmOpen(false)}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white/80 bg-[#2a2a2a] hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await removeFriendAction(friendshipId);
                setStatus({ status: 'NONE' });
                setConfirmOpen(false);
                router.refresh();
              })
            }
            className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Removing…' : 'Remove friend'}
          </button>
        </div>
      </Popup>
    </>
  );
}

function icon(compact: boolean) {
  return compact ? 'w-3.5 h-3.5' : 'w-4 h-4';
}

function btn(variant: 'yellow' | 'gray' | 'red' | 'green', compact: boolean) {
  const base = compact
    ? 'inline-flex items-center justify-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all disabled:opacity-50'
    : 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50';

  const colors: Record<string, string> = {
    yellow: 'bg-[#FFC300] text-black hover:bg-[#e6b000]',
    gray: 'bg-[#2a2a2a] text-white/80 border border-[#2a2a2a] hover:text-white hover:border-[#444]',
    red: 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20',
    green:
      'bg-[#FFC300]/10 text-[#FFC300] border border-[#FFC300]/20 hover:bg-[#FFC300]/20',
  };

  return `${base} ${colors[variant]}`;
}
