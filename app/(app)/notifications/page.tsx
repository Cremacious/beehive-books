import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import type { Metadata } from 'next';
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
  Info,
} from 'lucide-react';
import {
  getNotificationsPageAction,
  pruneOldNotificationsAction,
} from '@/lib/actions/notification.actions';
import { NotificationsPagination } from '@/components/notifications/notifications-pagination';
import type { NotificationItem, NotificationType } from '@/lib/types/notification.types';

export const metadata: Metadata = {
  title: 'Notifications',
  description: 'Your notifications — likes, comments, friend requests, and more.',
};

const PER_PAGE = 25;



function timeAgo(date: Date): string {
  const diff  = Date.now() - new Date(date).getTime();
  const mins  = Math.floor(diff / 60_000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30)  return `${days}d ago`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function messageBody(type: NotificationType, metadata?: Record<string, string>): string {
  switch (type) {
    case 'FRIEND_REQUEST':      return 'sent you a friend request';
    case 'FRIEND_ACCEPTED':     return 'accepted your friend request';
    case 'CHAPTER_COMMENT':     return 'commented on your chapter';
    case 'COMMENT_REPLY':       return 'replied to your comment';
    case 'COMMENT_LIKE':        return 'liked your comment';
    case 'PROMPT_INVITE':       return 'invited you to a writing prompt';
    case 'PROMPT_ENTRY':        return 'submitted an entry to your prompt';
    case 'PROMPT_ENDED':        return 'A prompt you joined has ended';
    case 'ENTRY_COMMENT':       return 'commented on your entry';
    case 'ENTRY_COMMENT_LIKE':  return 'liked your entry comment';
    case 'CLUB_INVITE':         return 'invited you to a book club';
    case 'CLUB_JOIN_REQUEST':   return 'wants to join your book club';
    case 'CLUB_DISCUSSION':     return 'posted a new discussion in your club';
    case 'CLUB_REPLY':          return 'replied to your discussion';
    case 'HIVE_INVITE':         return 'invited you to a hive';
    case 'HIVE_INVITE_PENDING': return 'invited you to join a hive';
    case 'HIVE_CHAPTER_CLAIMED':return 'claimed a chapter in the hive';
    case 'HIVE_SPRINT_STARTED': return 'started a writing sprint';
    case 'HIVE_MILESTONE':      return 'earned a hive milestone';
    case 'HIVE_COMMENT':        return 'commented in the hive';
    case 'HIVE_POLL':           return 'created a new poll';
    case 'HIVE_BETA_REVIEW':    return 'marked a chapter ready for review';
    case 'HIVE_ACTIVITY':       return `has submitted updates to ${metadata?.hiveName ?? 'the hive'}`;
    case 'HIVE_JOIN_REQUEST':   return 'wants to join your hive';
  }
}

type IconCfg = { Icon: React.ElementType; bg: string; fg: string };

function getTypeIcon(type: NotificationType): IconCfg {
  switch (type) {
    case 'FRIEND_REQUEST':      return { Icon: UserPlus,        bg: 'bg-violet-500/20', fg: 'text-violet-400' };
    case 'FRIEND_ACCEPTED':     return { Icon: UserCheck,       bg: 'bg-green-500/20',  fg: 'text-green-400'  };
    case 'CHAPTER_COMMENT':     return { Icon: MessageCircle,   bg: 'bg-blue-500/20',   fg: 'text-blue-400'   };
    case 'COMMENT_REPLY':       return { Icon: CornerDownRight, bg: 'bg-blue-500/20',   fg: 'text-blue-400'   };
    case 'COMMENT_LIKE':        return { Icon: Heart,           bg: 'bg-rose-500/20',   fg: 'text-rose-400'   };
    case 'PROMPT_INVITE':       return { Icon: Lightbulb,       bg: 'bg-yellow-500/20', fg: 'text-[#FFC300]'  };
    case 'PROMPT_ENTRY':        return { Icon: FileText,        bg: 'bg-orange-500/20', fg: 'text-orange-400' };
    case 'PROMPT_ENDED':        return { Icon: Clock,           bg: 'bg-white/10',      fg: 'text-white/60'   };
    case 'ENTRY_COMMENT':       return { Icon: MessageCircle,   bg: 'bg-blue-500/20',   fg: 'text-blue-400'   };
    case 'ENTRY_COMMENT_LIKE':  return { Icon: Heart,           bg: 'bg-rose-500/20',   fg: 'text-rose-400'   };
    case 'CLUB_INVITE':         return { Icon: Users,           bg: 'bg-teal-500/20',   fg: 'text-teal-400'   };
    case 'CLUB_JOIN_REQUEST':   return { Icon: UserPlus,        bg: 'bg-teal-500/20',   fg: 'text-teal-400'   };
    case 'CLUB_DISCUSSION':     return { Icon: BookOpen,        bg: 'bg-amber-500/20',  fg: 'text-amber-400'  };
    case 'CLUB_REPLY':          return { Icon: CornerDownRight, bg: 'bg-teal-500/20',   fg: 'text-teal-400'   };
    case 'HIVE_INVITE':         return { Icon: Hexagon,         bg: 'bg-yellow-500/20', fg: 'text-[#FFC300]'  };
    case 'HIVE_INVITE_PENDING': return { Icon: Hexagon,         bg: 'bg-yellow-500/20', fg: 'text-[#FFC300]'  };
    case 'HIVE_ACTIVITY':       return { Icon: Hexagon,         bg: 'bg-yellow-500/20', fg: 'text-[#FFC300]'  };
    case 'HIVE_CHAPTER_CLAIMED':return { Icon: Hexagon,         bg: 'bg-yellow-500/20', fg: 'text-[#FFC300]'  };
    case 'HIVE_SPRINT_STARTED': return { Icon: Timer,           bg: 'bg-orange-500/20', fg: 'text-orange-400' };
    case 'HIVE_MILESTONE':      return { Icon: Trophy,          bg: 'bg-yellow-500/20', fg: 'text-[#FFC300]'  };
    case 'HIVE_COMMENT':        return { Icon: MessageCircle,   bg: 'bg-yellow-500/20', fg: 'text-[#FFC300]'  };
    case 'HIVE_POLL':           return { Icon: VoteIcon,        bg: 'bg-purple-500/20', fg: 'text-purple-400' };
    case 'HIVE_BETA_REVIEW':    return { Icon: BookOpen,        bg: 'bg-blue-500/20',   fg: 'text-blue-400'   };
    case 'HIVE_JOIN_REQUEST':   return { Icon: UserPlus,        bg: 'bg-yellow-500/20', fg: 'text-[#FFC300]'  };
  }
}


function NotificationRow({ n }: { n: NotificationItem }) {
  const isSystem      = n.type === 'PROMPT_ENDED';
  const actorUsername = n.actor?.username ?? n.metadata.actorUsername ?? null;
  const { Icon, bg, fg } = getTypeIcon(n.type);

  return (
    <Link
      href={n.link}
      className={`flex items-start gap-4 px-5 py-4 hover:bg-[#FFC300]/5 transition-colors ${
        !n.isRead ? 'bg-white/3' : ''
      }`}
    >
      <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center shrink-0 mt-0.5`}>
        <Icon className={`w-5 h-5 ${fg}`} />
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug ${n.isRead ? 'text-white/70' : 'text-white'}`}>
          {!isSystem && actorUsername ? (
            <>
              <span className="font-semibold text-[#FFC300]">{actorUsername}</span>
              {' '}
            </>
          ) : null}
          {messageBody(n.type, n.metadata)}
        </p>
        <p className="text-xs text-white/35 mt-1">{timeAgo(n.createdAt)}</p>
      </div>

      {!n.isRead && (
        <div className="w-2 h-2 rounded-full bg-[#FFC300] shrink-0 mt-2" />
      )}
    </Link>
  );
}


export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');


  void pruneOldNotificationsAction();

  const { page: pageStr } = await searchParams;
  const page = Math.max(1, Number(pageStr) || 1);

  const { notifications: items, total } = await getNotificationsPageAction(page, PER_PAGE);
  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div className="px-4 py-6 md:px-8 max-w-2xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <Bell className="w-5 h-5 text-[#FFC300]" />
        <h1 className="text-2xl font-bold text-white mainFont">Notifications</h1>
      </div>


      <div className="flex items-start gap-3 px-4 py-3 mb-5 rounded-xl bg-white/4 border border-white/8">
        <Info className="w-4 h-4 text-white/30 shrink-0 mt-0.5" />
        <p className="text-xs text-white/40 leading-relaxed">
          Notifications older than 30 days are automatically deleted.
        </p>
      </div>


      <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] overflow-hidden">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Bell className="w-8 h-8 text-white/15" />
            <p className="text-sm text-white/35">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-[#2a2a2a]">
            {items.map((n) => (
              <NotificationRow key={n.id} n={n} />
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <NotificationsPagination page={page} totalPages={totalPages} />
      )}
    </div>
  );
}
