'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, Clock, UserCheck, UserX, Check } from 'lucide-react';
import {
  sendFriendRequestAction,
  cancelFriendRequestAction,
  acceptFriendRequestAction,
  rejectFriendRequestAction,
  removeFriendAction,
} from '@/lib/actions/friend.actions';
import type { FriendStatus } from '@/lib/actions/friend.actions';

interface Props {
  targetUserId:  string;
  initialStatus: FriendStatus;
  compact?: boolean;
}

export function FriendButton({ targetUserId, initialStatus, compact = false }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const run = (action: () => Promise<{ success: boolean; message: string }>) => {
    startTransition(async () => {
      await action();
      router.refresh();
    });
  };

  if (initialStatus.status === 'NONE') {
    return (
      <button
        disabled={isPending}
        onClick={() => run(() => sendFriendRequestAction(targetUserId))}
        className={
          compact
            ? 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 bg-[#FFC300] text-black hover:bg-[#e6b000] active:scale-95'
            : 'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 bg-[#FFC300] text-black hover:bg-[#e6b000] active:scale-95'
        }
        title="Send friend request"
      >
        <UserPlus className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        <span>{isPending ? 'Sending…' : 'Send Request'}</span>
      </button>
    );
  }

  if (initialStatus.status === 'PENDING_SENT') {
    return (
      <button
        disabled={isPending}
        onClick={() => run(() => cancelFriendRequestAction(initialStatus.friendshipId))}
        className={btn('gray', compact)}
        title="Cancel request"
      >
        <Clock className={icon(compact)} />
        {!compact && <span>{isPending ? 'Cancelling…' : 'Request Sent'}</span>}
      </button>
    );
  }

  if (initialStatus.status === 'PENDING_RECEIVED') {
    return (
      <div className={compact ? 'flex gap-1' : 'flex gap-2'}>
        <button
          disabled={isPending}
          onClick={() => run(() => acceptFriendRequestAction(initialStatus.friendshipId))}
          className={btn('yellow', compact)}
          title="Accept request"
        >
          <Check className={icon(compact)} />
          {!compact && <span>{isPending ? 'Accepting…' : 'Accept'}</span>}
        </button>
        <button
          disabled={isPending}
          onClick={() => run(() => rejectFriendRequestAction(initialStatus.friendshipId))}
          className={btn('red', compact)}
          title="Decline request"
        >
          <UserX className={icon(compact)} />
          {!compact && <span>Decline</span>}
        </button>
      </div>
    );
  }


  return (
    <button
      disabled={isPending}
      onClick={() => run(() => removeFriendAction(initialStatus.friendshipId))}
      className={btn('green', compact)}
      title="Remove friend"
    >
      <UserCheck className={icon(compact)} />
      {!compact && <span>{isPending ? 'Removing…' : 'Friends'}</span>}
    </button>
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
    gray:   'bg-[#2a2a2a] text-white/70 border border-[#333] hover:text-white hover:border-[#444]',
    red:    'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20',
    green:  'bg-[#FFC300]/10 text-[#FFC300] border border-[#FFC300]/20 hover:bg-[#FFC300]/20',
  };

  return `${base} ${colors[variant]}`;
}
