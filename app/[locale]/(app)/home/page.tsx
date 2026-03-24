import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  BookOpen,
  BookMarked,
  Users2,
  MessageSquare,
  PenLine,
  List,
  Hexagon,
  UserPlus,
  Compass,
  ArrowRight,
  Clock,
  Lightbulb,
  Bell,
} from 'lucide-react';
import { getFriendFeedAction } from '@/lib/actions/feed.actions';
import { getMyFriendsDataAction } from '@/lib/actions/friend.actions';
import { getAnnouncementsAction } from '@/lib/actions/admin.actions';
import { getRecentWritingAction } from '@/lib/actions/book.actions';
import { getContinueReadingAction } from '@/lib/actions/reading.actions';
import { getCurrentUserAction } from '@/lib/actions/user.actions';
import { AnnouncementsSection } from '@/components/announcements/announcements-section';
import type {
  FeedEvent,
  FeedEventType,
  FeedUser,
} from '@/lib/actions/feed.actions';

export const metadata: Metadata = {
  title: 'Home',
  description:
    'Your personalized feed — see what your friends and community are writing.',
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  });
}

function dayLabel(date: Date): string {
  const now = new Date();
  const d = new Date(date);
  const diffDays = Math.floor(
    (now.setHours(0, 0, 0, 0) - d.setHours(0, 0, 0, 0)) / 86_400_000,
  );
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return new Date(date).toLocaleDateString([], {
    month: 'long',
    day: 'numeric',
  });
}

type EventConfig = {
  icon: React.ElementType;
  color: string;
  bg: string;
  describe: (meta: Record<string, string | number>, username: string) => string;
};

const EVENT_CONFIG: Record<FeedEventType, EventConfig> = {
  NEW_BOOK: {
    icon: BookOpen,
    color: 'text-[#FFC300]',
    bg: 'bg-[#FFC300]/10',
    describe: (meta, name) => `${name} published a new book — "${meta.title}"`,
  },
  NEW_CHAPTER: {
    icon: BookMarked,
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    describe: (meta, name) =>
      `${name} added "${meta.chapterTitle}" to ${meta.bookTitle}`,
  },
  NEW_CLUB: {
    icon: Users2,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    describe: (meta, name) => `${name} created a new club — "${meta.clubName}"`,
  },
  CLUB_DISCUSSION: {
    icon: MessageSquare,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    describe: (meta, name) =>
      `${name} started a discussion "${meta.discussionTitle}" in ${meta.clubName}`,
  },
  NEW_PROMPT: {
    icon: PenLine,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    describe: (meta, name) =>
      `${name} created a new writing prompt — "${meta.title}"`,
  },
  NEW_READING_LIST: {
    icon: List,
    color: 'text-sky-400',
    bg: 'bg-sky-400/10',
    describe: (meta, name) =>
      `${name} created a reading list — "${meta.title}"`,
  },
  NEW_HIVE: {
    icon: Hexagon,
    color: 'text-teal-400',
    bg: 'bg-teal-400/10',
    describe: (meta, name) => `${name} started a new hive — "${meta.name}"`,
  },
};

function UserAvatar({ user, size = 7 }: { user: FeedUser; size?: number }) {
  const name = user.username ?? '?';
  return (
    <div
      className={`relative w-${size} h-${size} rounded-full overflow-hidden bg-[#2a2000] shrink-0`}
    >
      {user.image ? (
        <Image src={user.image} alt={name} fill className="object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-xs font-bold text-[#FFC300]">
            {(name[0] || '?').toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
}

function SectionHeader({
  title,
  href,
  icon,
}: {
  title: string;
  href?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-sm font-semibold text-yellow-500 flex items-center gap-1.5">
        {icon}
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className="text-sm text-white hover:text-[#FFC300] transition-colors flex items-center gap-1"
        >
          See all <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}

function NewUserWelcome() {
  const FEATURE_CARDS = [
    {
      href: '/library',
      icon: BookOpen,
      color: 'text-[#FFC300]',
      bg: 'bg-[#FFC300]/10',
      title: 'Write & Share',
      description:
        'Start your own book, organize chapters, and share your work with friends.',
      cta: 'Open Library',
    },
    {
      href: '/clubs',
      icon: Users2,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
      title: 'Book Clubs',
      description: 'Join or create a club to read and discuss books together.',
      cta: 'Browse Clubs',
    },
    {
      href: '/hive',
      icon: Hexagon,
      color: 'text-teal-400',
      bg: 'bg-teal-400/10',
      title: 'Hives',
      description:
        'Collaborate on a book with other writers — claim chapters, track progress.',
      cta: 'Explore Hives',
    },
    {
      href: '/prompts',
      icon: Lightbulb,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
      title: 'Writing Prompts',
      description:
        'Challenge yourself with writing prompts and see what others create.',
      cta: 'See Prompts',
    },
    {
      href: '/reading-lists',
      icon: List,
      color: 'text-sky-400',
      bg: 'bg-sky-400/10',
      title: 'Reading Lists',
      description: 'Build and share curated lists of books you want to read.',
      cta: 'Your Lists',
    },
    {
      href: '/explore',
      icon: Compass,
      color: 'text-pink-400',
      bg: 'bg-pink-400/10',
      title: 'Explore',
      description:
        'Discover books and writers from across the Beehive community.',
      cta: 'Start Exploring',
    },
  ] as const;

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-[#FFC300]/20 bg-[#FFC300]/5 p-6 text-center">
        <h2 className="text-xl font-bold text-white mainFont mb-1">
          Welcome to Beehive!
        </h2>
        <p className="text-sm text-white/80 max-w-md mx-auto">
          This is your home feed! Once you add friends, you&apos;ll see their
          latest books, chapters, clubs, and writing activity right here. For
          now, explore everything Beehive Books has to offer.
        </p>
      </div>

      <div>
        <p className="text-xs font-semibold text-white uppercase tracking-[0.15em] mb-3">
          Everything you can do
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FEATURE_CARDS.map(
            ({ href, icon: Icon, color, bg, title, description, cta }) => (
              <Link
                key={href}
                href={href}
                className="flex items-start gap-4 p-4 rounded-xl bg-[#1c1c1c] border border-[#2a2a2a] hover:border-[#FFC300]/25 hover:bg-[#252525] transition-all group"
              >
                <div
                  className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0 mt-0.5`}
                >
                  <Icon className={`w-5 h-5 ${color}`} aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white mb-0.5">
                    {title}
                  </p>
                  <p className="text-xs text-white leading-relaxed">
                    {description}
                  </p>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-medium mt-2 ${color} opacity-70 group-hover:opacity-100 transition-opacity`}
                  >
                    {cta}
                    <ArrowRight className="w-3 h-3" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            ),
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-[#2a2a2a] bg-[#1c1c1c] p-5 flex flex-col sm:flex-row items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-purple-400/10 flex items-center justify-center shrink-0">
          <UserPlus className="w-5 h-5 text-purple-400" aria-hidden="true" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <p className="text-sm font-semibold text-white">
            Find your writing community
          </p>
          <p className="text-xs text-white mt-0.5">
            Connect with friends to see their activity in this feed.
          </p>
        </div>
        <Link
          href="/friends?tab=find"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FFC300] text-black text-sm font-bold hover:bg-[#FFD040] transition-colors shrink-0"
        >
          <UserPlus className="w-4 h-4" aria-hidden="true" />
          Find People
        </Link>
      </div>
    </div>
  );
}

function EventRow({ event }: { event: FeedEvent }) {
  const cfg = EVENT_CONFIG[event.type];
  const Icon = cfg.icon;
  const name = event.user.username ?? 'Someone';

  return (
    <Link
      href={event.link}
      className="flex items-start gap-3 py-3 hover:bg-white/3 transition-colors -mx-4 px-4 rounded-lg group"
    >
      <div className="relative shrink-0 mt-0.5">
        <UserAvatar user={event.user} size={8} />
        <div
          className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center ${cfg.bg} ring-2 ring-[#1c1c1c]`}
        >
          <Icon className={`w-2.5 h-2.5 ${cfg.color}`} aria-hidden="true" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white/90 leading-snug transition-colors">
          {cfg.describe(event.meta, name)}
        </p>
      </div>
      <span className="text-xs text-white/80 shrink-0 mt-0.5 whitespace-nowrap">
        {timeAgo(event.timestamp)}
      </span>
    </Link>
  );
}

function DayGroup({ label, events }: { label: string; events: FeedEvent[] }) {
  return (
    <div>
      <p className="text-xs font-semibold text-white/80 uppercase tracking-wider mb-2">
        {label}
      </p>
      <div className="rounded-2xl bg-[#1c1c1c] border border-[#2a2a2a] px-4 divide-y divide-[#2a2a2a]">
        {events.map((ev) => (
          <EventRow key={ev.id} event={ev} />
        ))}
      </div>
    </div>
  );
}

function NoActivityEmpty() {
  return (
    <div className="rounded-2xl border border-dashed border-[#2a2a2a] bg-[#1a1a1a]/40 py-14 text-center mt-4">
      <p className="text-lg text-white font-medium">
        No recent activity from your friends.
      </p>
      <p className="text-sm text-white/80 max-w-xs mx-auto mt-1.5">
        New books, chapters, clubs, hives, and prompts will appear here as your
        friends create them.
      </p>
    </div>
  );
}

export default async function UserHomePage() {
  const [
    events,
    { friends },
    announcements,
    recentWriting,
    continueReading,
    currentUser,
  ] = await Promise.all([
    getFriendFeedAction(),
    getMyFriendsDataAction(),
    getAnnouncementsAction(),
    getRecentWritingAction(),
    getContinueReadingAction(),
    getCurrentUserAction(),
  ]);

  const username = currentUser?.username ?? null;
  const hasFriends = friends.length > 0;

  const groups: { label: string; events: FeedEvent[] }[] = [];
  for (const ev of events) {
    const label = dayLabel(ev.timestamp);
    const last = groups[groups.length - 1];
    if (last && last.label === label) {
      last.events.push(ev);
    } else {
      groups.push({ label, events: [ev] });
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:px-8 space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-white mainFont">
          {getGreeting()}
          {username ? `, ${username}` : ''}
        </h1>
        <p className="text-sm text-white/80 mt-0.5">
          Here&apos;s what&apos;s happening on Beehive Books.
        </p>
      </div>

      {/* Announcements */}
      {announcements.length > 0 && (
        <AnnouncementsSection announcements={announcements} />
      )}

      {/* Your Writing */}
      {recentWriting.length > 0 && (
        <section>
          <SectionHeader
            title="Your Writing"
            href="/library"
            icon={<PenLine className="w-4 h-4" aria-hidden="true" />}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {recentWriting.map((book) => (
              <Link
                key={book.id}
                href={`/library/${book.id}`}
                className="group flex items-center gap-3 p-4 rounded-xl bg-[#1c1c1c] border border-[#2a2a2a] hover:border-[#FFC300]/25 hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="w-12 h-16 rounded-lg bg-linear-to-br from-[#222] to-[#141414] shrink-0 overflow-hidden relative">
                  {book.coverUrl ? (
                    <Image
                      src={book.coverUrl}
                      alt={book.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-lg font-bold text-white/80 mainFont">
                        {book.title[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#FFC300] truncate transition-colors mainFont">
                    {book.title}
                  </p>
                  <p className="text-xs text-white/80 mt-0.5">
                    {book.wordCount.toLocaleString()} words ·{' '}
                    {book.chapterCount} chapters
                  </p>
                </div>
                <ArrowRight
                  className="w-4 h-4 text-white/80 group-hover:text-[#FFC300]/60 transition-colors shrink-0"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Continue Reading */}
      {continueReading.length > 0 && (
        <section>
          <SectionHeader
            title="Continue Reading"
            href="/explore/books"
            icon={<Clock className="w-4 h-4" aria-hidden="true" />}
          />
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide mt-4 -mx-4 px-4 md:-mx-8 md:px-8">
            {continueReading.map((item) => (
              <Link
                key={item.bookId}
                href={`/books/${item.bookId}/${item.chapterId}`}
                className="group shrink-0 w-36 flex flex-col rounded-xl bg-[#1c1c1c] border border-[#2a2a2a] overflow-hidden hover:border-[#FFC300]/25 hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="w-full aspect-2/3 bg-linear-to-br from-[#222] to-[#141414] relative overflow-hidden">
                  {item.coverUrl ? (
                    <Image
                      src={item.coverUrl}
                      alt={item.bookTitle}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-white/80 mainFont">
                        {item.bookTitle[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-semibold text-white line-clamp-2 group-hover:text-[#FFC300] transition-colors mainFont min-h-8">
                    {item.bookTitle}
                  </p>
                  <p className="text-[10px] text-white/80 mt-1 truncate">
                    {item.chapterTitle}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Friend Activity OR New User Welcome */}
      {!hasFriends ? (
        <NewUserWelcome />
      ) : events.length === 0 ? (
        <section>
          <SectionHeader
            title="Friend Activity"
            icon={<Users2 className="w-4 h-4" aria-hidden="true" />}
          />
          <NoActivityEmpty />
        </section>
      ) : (
        <section>
          <SectionHeader
            title="Friend Activity"
            icon={<Users2 className="w-4 h-4" aria-hidden="true" />}
          />
          <div className="space-y-4 mt-4">
            {groups.map((group) => (
              <DayGroup
                key={group.label}
                label={group.label}
                events={group.events}
              />
            ))}
          </div>
        </section>
      )}

      {/* Quick Links */}
      <section>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { href: '/library', label: 'Library', icon: BookOpen },
              { href: '/explore', label: 'Explore', icon: Compass },
              { href: '/hive', label: 'Hives', icon: Hexagon },
              { href: '/clubs', label: 'Clubs', icon: Users2 },
              { href: '/prompts', label: 'Prompts', icon: Lightbulb },
              {
                href: '/reading-lists',
                label: 'Reading Lists',
                icon: BookMarked,
              },
              { href: '/friends', label: 'Friends', icon: UserPlus },
            ] as const
          ).map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1c1c1c] border border-[#2a2a2a] text-sm text-white/80 hover:text-white hover:border-[#FFC300]/30 transition-all"
            >
              <Icon className="w-3.5 h-3.5" aria-hidden="true" />
              {label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
