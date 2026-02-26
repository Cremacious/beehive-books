'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  UserPlus,
  UserCheck,
  MessageCircle,
  Heart,
  Lightbulb,
  FileText,
  Clock,
  CornerDownRight,
} from 'lucide-react';
import { markAllReadAction } from '@/lib/actions/notification.actions';
import type { NotificationItem, NotificationType } from '@/lib/types/notification.types';

function timeAgo(date: Date): string {
  const diff  = Date.now() - new Date(date).getTime();
  const mins  = Math.floor(diff / 60000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function messageBody(type: NotificationType): string {
  switch (type) {
    case 'FRIEND_REQUEST':    return 'sent you a friend request';
    case 'FRIEND_ACCEPTED':   return 'accepted your friend request';
    case 'CHAPTER_COMMENT':   return 'commented on your chapter';
    case 'COMMENT_REPLY':     return 'replied to your comment';
    case 'COMMENT_LIKE':      return 'liked your comment';
    case 'PROMPT_INVITE':     return 'invited you to a writing prompt';
    case 'PROMPT_ENTRY':      return 'submitted an entry to your prompt';
    case 'PROMPT_ENDED':      return 'A prompt you joined has ended';
    case 'ENTRY_COMMENT':     return 'commented on your entry';
    case 'ENTRY_COMMENT_LIKE':return 'liked your comment';
  }
}

type IconCfg = { Icon: React.ElementType; bg: string; fg: string };

function getTypeIcon(type: NotificationType): IconCfg {
  switch (type) {
    case 'FRIEND_REQUEST':     return { Icon: UserPlus,        bg: 'bg-violet-500/20', fg: 'text-violet-400' };
    case 'FRIEND_ACCEPTED':    return { Icon: UserCheck,       bg: 'bg-green-500/20',  fg: 'text-green-400'  };
    case 'CHAPTER_COMMENT':    return { Icon: MessageCircle,   bg: 'bg-blue-500/20',   fg: 'text-blue-400'   };
    case 'COMMENT_REPLY':      return { Icon: CornerDownRight, bg: 'bg-blue-500/20',   fg: 'text-blue-400'   };
    case 'COMMENT_LIKE':       return { Icon: Heart,           bg: 'bg-rose-500/20',   fg: 'text-rose-400'   };
    case 'PROMPT_INVITE':      return { Icon: Lightbulb,       bg: 'bg-yellow-500/20', fg: 'text-[#FFC300]'  };
    case 'PROMPT_ENTRY':       return { Icon: FileText,        bg: 'bg-orange-500/20', fg: 'text-orange-400' };
    case 'PROMPT_ENDED':       return { Icon: Clock,           bg: 'bg-white/10',      fg: 'text-white/40'   };
    case 'ENTRY_COMMENT':      return { Icon: MessageCircle,   bg: 'bg-blue-500/20',   fg: 'text-blue-400'   };
    case 'ENTRY_COMMENT_LIKE': return { Icon: Heart,           bg: 'bg-rose-500/20',   fg: 'text-rose-400'   };
  }
}

function NotificationRow({
  notification,
  onClose,
}: {
  notification: NotificationItem;
  onClose:      () => void;
}) {
  const { type, actor, metadata, link, isRead, createdAt } = notification;
  const isSystem      = type === 'PROMPT_ENDED';
  const actorUsername = actor?.username ?? metadata.actorUsername ?? null;
  const { Icon, bg, fg } = getTypeIcon(type);

  return (
    <Link
      href={link}
      onClick={onClose}
      className={`flex items-start gap-3 px-4 py-3.5 hover:bg-[#FFC300]/5 transition-colors ${
        !isRead ? 'bg-white/3' : ''
      }`}
    >
     
      <div className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center shrink-0 mt-0.5`}>
        <Icon className={`w-4 h-4 ${fg}`} />
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug ${isRead ? 'text-white/50' : 'text-white'}`}>
          {!isSystem && actorUsername ? (
            <>
              <Link
                href={`/u/${actorUsername}`}
                onClick={(e) => e.stopPropagation()}
                className="font-semibold text-[#FFC300] hover:underline"
              >
                {actorUsername}
              </Link>
              {' '}
            </>
          ) : null}
          {messageBody(type)}
        </p>
        <p className="text-xs text-white/40 mt-1">{timeAgo(createdAt)}</p>
      </div>

      {!isRead && (
        <div className="w-1.5 h-1.5 rounded-full bg-[#FFC300] shrink-0 mt-2" />
      )}
    </Link>
  );
}

interface Props {
  notifications: NotificationItem[];
  onClose:       () => void;
}

export function NotificationPanel({ notifications, onClose }: Props) {
  const router = useRouter();
  const unread = notifications.filter((n) => !n.isRead).length;

  async function handleMarkAllRead() {
    await markAllReadAction();
    router.refresh();
    onClose();
  }

  return (
    <div className="w-80 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl shadow-2xl overflow-hidden">

      <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#FFC300]" />
          <h3 className="text-sm font-semibold text-white">Notifications</h3>
          {unread > 0 && (
            <span className="bg-[#FFC300] text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
              {unread}
            </span>
          )}
        </div>
        {unread > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs text-[#FFC300] hover:underline transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>


      <div className="max-h-100 overflow-y-auto divide-y divide-[#2a2a2a]">
        {notifications.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <Bell className="w-8 h-8 text-white/90 mx-auto mb-2" />
            <p className="text-sm text-white/90">No notifications yet</p>
          </div>
        ) : (
          notifications.map((n) => (
            <NotificationRow key={n.id} notification={n} onClose={onClose} />
          ))
        )}
      </div>


      {notifications.length > 0 && (
        <div className="border-t border-[#2a2a2a] px-4 py-2.5">
          <button
            onClick={() => { router.push('/notifications'); onClose(); }}
            className="w-full text-center text-sm text-white/80 hover:text-[#FFC300] py-1 transition-colors"
          >
            View all notifications
          </button>
        </div>
      )}

    </div>
  );
}
