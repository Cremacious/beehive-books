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
  Users,
  BookOpen,
  Hexagon,
  Trophy,
  Timer,
  VoteIcon,
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

function messageBody(type: NotificationType, metadata?: Record<string, string>): string {
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
    case 'CLUB_INVITE':            return 'invited you to a book club';
    case 'CLUB_JOIN_REQUEST':      return 'wants to join your book club';
    case 'CLUB_DISCUSSION':        return 'posted a new discussion in your club';
    case 'CLUB_REPLY':             return 'replied to your discussion';
    case 'HIVE_INVITE':            return 'accepted your hive invite';
    case 'HIVE_INVITE_PENDING':    return 'invited you to join a hive';
    case 'HIVE_CHAPTER_CLAIMED':   return 'claimed a chapter in the hive';
    case 'HIVE_SPRINT_STARTED':    return 'started a writing sprint';
    case 'HIVE_MILESTONE':         return 'earned a hive milestone';
    case 'HIVE_COMMENT':           return 'commented in the hive';
    case 'HIVE_POLL':              return 'created a new poll';
    case 'HIVE_BETA_REVIEW':       return 'marked a chapter ready for review';
    case 'HIVE_ACTIVITY':          return `has submitted updates to ${metadata?.hiveName ?? 'the hive'}`;
    case 'HIVE_JOIN_REQUEST':      return 'wants to join your hive';
    case 'BOOK_LIKE':              return 'liked your book';
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
    case 'PROMPT_ENDED':       return { Icon: Clock,           bg: 'bg-white/10',      fg: 'text-white/80'   };
    case 'ENTRY_COMMENT':      return { Icon: MessageCircle,   bg: 'bg-blue-500/20',   fg: 'text-blue-400'   };
    case 'ENTRY_COMMENT_LIKE': return { Icon: Heart,           bg: 'bg-rose-500/20',   fg: 'text-rose-400'   };
    case 'CLUB_INVITE':          return { Icon: Users,           bg: 'bg-teal-500/20',   fg: 'text-teal-400'   };
    case 'CLUB_JOIN_REQUEST':    return { Icon: UserPlus,        bg: 'bg-teal-500/20',   fg: 'text-teal-400'   };
    case 'CLUB_DISCUSSION':      return { Icon: BookOpen,        bg: 'bg-amber-500/20',  fg: 'text-amber-400'  };
    case 'CLUB_REPLY':           return { Icon: CornerDownRight, bg: 'bg-teal-500/20',   fg: 'text-teal-400'   };
    case 'HIVE_INVITE':          return { Icon: Hexagon,         bg: 'bg-yellow-500/20', fg: 'text-[#FFC300]'  };
    case 'HIVE_INVITE_PENDING':  return { Icon: Hexagon,         bg: 'bg-yellow-500/20', fg: 'text-[#FFC300]'  };
    case 'HIVE_ACTIVITY':        return { Icon: Hexagon,         bg: 'bg-yellow-500/20', fg: 'text-[#FFC300]'  };
    case 'HIVE_CHAPTER_CLAIMED': return { Icon: Hexagon,         bg: 'bg-yellow-500/20', fg: 'text-[#FFC300]'  };
    case 'HIVE_SPRINT_STARTED':  return { Icon: Timer,           bg: 'bg-orange-500/20', fg: 'text-orange-400' };
    case 'HIVE_MILESTONE':       return { Icon: Trophy,          bg: 'bg-yellow-500/20', fg: 'text-[#FFC300]'  };
    case 'HIVE_COMMENT':         return { Icon: MessageCircle,   bg: 'bg-yellow-500/20', fg: 'text-[#FFC300]'  };
    case 'HIVE_POLL':            return { Icon: VoteIcon,        bg: 'bg-purple-500/20', fg: 'text-purple-400' };
    case 'HIVE_BETA_REVIEW':     return { Icon: BookOpen,        bg: 'bg-blue-500/20',   fg: 'text-blue-400'   };
    case 'HIVE_JOIN_REQUEST':    return { Icon: UserPlus,        bg: 'bg-yellow-500/20', fg: 'text-[#FFC300]'  };
    case 'BOOK_LIKE':            return { Icon: Heart,           bg: 'bg-rose-500/20',   fg: 'text-rose-400'   };
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
    <div role="listitem">
      <Link
        href={link}
        onClick={onClose}
        aria-label={`${!isSystem && actorUsername ? actorUsername + ' ' : ''}${messageBody(type, metadata)}${!isRead ? ', unread' : ''}`}
        className={`flex items-start gap-3 px-4 py-3.5 hover:bg-[#FFC300]/5 transition-colors ${
          !isRead ? 'bg-[#FFC300]/5' : ''
        }`}
      >
        <div aria-hidden="true" className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center shrink-0 mt-0.5`}>
          <Icon className={`w-4 h-4 ${fg}`} />
        </div>

        <div className="flex-1 min-w-0" aria-hidden="true">
          <p className={`text-sm leading-snug ${isRead ? 'text-white/80' : 'text-white'}`}>
            {!isSystem && actorUsername ? (
              <>
                <span className="font-semibold text-[#FFC300]">{actorUsername}</span>
                {' '}
              </>
            ) : null}
            {messageBody(type, metadata)}
          </p>
          <p className="text-xs text-white/60 mt-1">{timeAgo(createdAt)}</p>
        </div>

        {!isRead && (
          <div aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-[#FFC300] shrink-0 mt-2" />
        )}
      </Link>
    </div>
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
    <section
      role="region"
      aria-label="Notifications"
      className="w-96 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl shadow-2xl overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-2">
          <Bell aria-hidden="true" className="w-4 h-4 text-[#FFC300]" />
          <h2 className="text-sm font-semibold text-white">Notifications</h2>
          {unread > 0 && (
            <span aria-hidden="true" className="bg-[#FFC300] text-black text-xs font-bold px-1.5 py-0.5 rounded-full leading-none">
              {unread}
            </span>
          )}
        </div>
        {unread > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="text-xs text-[#FFC300] hover:underline transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      <div role="list" aria-label="Notification list" className="max-h-100 overflow-y-auto divide-y divide-[#2a2a2a]">
        {notifications.length === 0 ? (
          <div role="status" className="px-4 py-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-[#1c1c1c] border border-[#2a2a2a] flex items-center justify-center mx-auto mb-3">
              <Bell aria-hidden="true" className="w-5 h-5 text-white/70" />
            </div>
            <p className="text-sm font-medium text-white/70">All caught up</p>
            <p className="text-xs text-white/70 mt-1">No new notifications</p>
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
            type="button"
            onClick={() => { router.push('/notifications'); onClose(); }}
            className="w-full text-center text-xs font-medium text-white/70 hover:text-[#FFC300] py-1.5 transition-colors"
          >
            View all notifications
          </button>
        </div>
      )}

    </section>
  );
}
