import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import {
  BookOpen,
  BookMarked,
  Users,
  Zap,
  Hexagon,
  Lock,
  UserCheck,
} from 'lucide-react';
import BookCard from '@/components/library/book-card';
import { FriendButton } from '@/components/friends/friend-button';
import { getUserProfileAction } from '@/lib/actions/user.actions';
import { getFriendshipStatusAction } from '@/lib/actions/friend.actions';

//TODO: Make the user confirm before unfriending

type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return { title: `@${username} · Beehive Books` };
}

export default async function UserProfilePage({ params }: Props) {
  const { username } = await params;
  const profile = await getUserProfileAction(username);

  if (!profile) notFound();

  const { user, books, readingLists, stats, isOwnProfile, currentUserId } =
    profile;

  const friendStatus =
    currentUserId && !isOwnProfile
      ? await getFriendshipStatusAction(user.clerkId)
      : null;

  const displayName = user.username ?? 'unknown';

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:px-8">
      <div className="rounded-2xl bg-[#1e1e1e] border border-[#2a2a2a] mb-10 overflow-hidden">
        <div className="h-1 w-full  bg-[#FFC300]" />

        <div className="p-5 md:p-7">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-[#2a2000] shrink-0 ring-2 ring-[#FFC300]/20">
              {user.imageUrl ? (
                <Image
                  src={user.imageUrl}
                  alt={displayName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-[#FFC300]">
                    {(displayName[0] || '?').toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-2xl font-bold text-white truncate">
                {displayName}
              </h1>
              <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                {isOwnProfile && (
                  <button className="text-xs px-3 py-1.5 rounded-lg border border-[#333] text-white/70 hover:text-white hover:border-[#FFC300]/40 transition-all cursor-not-allowed opacity-60">
                    Edit Profile
                  </button>
                )}
                {friendStatus && (
                  <FriendButton
                    targetUserId={user.clerkId}
                    initialStatus={friendStatus}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 mt-5 pt-4 border-t border-[#2a2a2a]">
            <Stat
              value={stats.bookCount}
              label={stats.bookCount === 1 ? 'Work' : 'Works'}
            />
            <div className="w-px h-5 bg-[#2a2a2a]" />
            <Stat
              value={stats.totalChapters}
              label={stats.totalChapters === 1 ? 'Chapter' : 'Chapters'}
            />
            <div className="w-px h-5 bg-[#2a2a2a]" />
            <Stat
              value={stats.totalWords.toLocaleString()}
              label="Words Written"
            />
          </div>
        </div>
      </div>

      <ProfileSection
        icon={<BookOpen className="w-5 h-5 text-[#FFC300]" />}
        title="Works"
        count={books.length}
      >
        {books.length === 0 ? (
          <EmptyState
            message={
              isOwnProfile
                ? "You haven't published any works yet."
                : 'No public works yet.'
            }
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {books.map((book) => (
              <div key={book.id} className="relative">
                <BookCard book={book} />
                {isOwnProfile && book.privacy !== 'PUBLIC' && (
                  <div className="absolute top-1.5 right-1.5 z-10">
                    <PrivacyBadge
                      privacy={book.privacy as 'PRIVATE' | 'FRIENDS'}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </ProfileSection>

      <ProfileSection
        icon={<BookMarked className="w-5 h-5 text-[#FFC300]" />}
        title="Reading Lists"
        count={readingLists.length}
      >
        {readingLists.length === 0 ? (
          <EmptyState
            message={
              isOwnProfile
                ? 'No reading lists yet.'
                : 'No public reading lists yet.'
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {readingLists.map((list) => (
              <Link
                key={list.id}
                href={`/reading-lists/${list.id}`}
                className="group rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] p-4 hover:border-[#FFC300]/30 hover:bg-[#232323] transition-all duration-200 flex flex-col"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-white group-hover:text-[#FFC300] transition-colors line-clamp-1 flex-1">
                    {list.title}
                  </h3>
                  {isOwnProfile && list.privacy !== 'PUBLIC' && (
                    <PrivacyBadge
                      privacy={list.privacy as 'PRIVATE' | 'FRIENDS'}
                    />
                  )}
                </div>
                {list.description ? (
                  <p className="text-sm text-white/70 mt-1.5 line-clamp-2 flex-1">
                    {list.description}
                  </p>
                ) : (
                  <div className="flex-1" />
                )}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#2a2a2a]">
                  <span className="text-xs text-white/70">
                    {list.bookCount} {list.bookCount === 1 ? 'book' : 'books'}
                  </span>
                  {list.currentlyReadingTitle && (
                    <>
                      <span className="text-white/70">·</span>
                      <span className="text-xs text-[#FFC300]/50 truncate">
                        Reading: {list.currentlyReadingTitle}
                      </span>
                    </>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </ProfileSection>

      <ComingSoonSection
        icon={<Users className="w-5 h-5 text-[#FFC300]" />}
        title="Book Clubs"
        description="Join and host reading groups — discuss books together."
        previewCards={[
          { label: 'Fantasy Readers Circle', sub: '12 members · 4 books' },
          { label: 'Sci-Fi & Speculative', sub: '8 members · 7 books' },
          { label: 'Monthly Classics', sub: '20 members · 2 books' },
        ]}
      />

      <ComingSoonSection
        icon={<Zap className="w-5 h-5 text-[#FFC300]" />}
        title="Prompts"
        description="Share and respond to writing prompts to spark creativity."
        previewCards={[
          { label: 'The Last Library', sub: '34 responses' },
          { label: '100-Word Challenge', sub: '56 responses' },
          { label: "Write a villain's origin", sub: '22 responses' },
        ]}
      />

      <ComingSoonSection
        icon={<Hexagon className="w-5 h-5 text-[#FFC300]" />}
        title="Hives"
        description="Spaces where writers collaborate around shared interests."
        previewCards={[
          { label: 'Dark Fantasy Writers', sub: '42 members' },
          { label: 'Romance & Drama', sub: '67 members' },
          { label: 'World Builders Guild', sub: '18 members' },
        ]}
      />
    </div>
  );
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div>
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-xs text-white/70 mt-0.5">{label}</p>
    </div>
  );
}

function ProfileSection({
  icon,
  title,
  count,
  children,
}: {
  icon: ReactNode;
  title: string;
  count: number;
  children: ReactNode;
}) {
  return (
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-5">
        {icon}
        <h2 className="text-base font-semibold text-white">{title}</h2>
        {count > 0 && <span className="text-sm text-white/70">({count})</span>}
      </div>
      {children}
    </section>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-[#2a2a2a] bg-[#1a1a1a]/40 py-10 text-center">
      <p className="text-sm text-white/70">{message}</p>
    </div>
  );
}

function PrivacyBadge({ privacy }: { privacy: 'PRIVATE' | 'FRIENDS' }) {
  const isPrivate = privacy === 'PRIVATE';
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-sm border border-white/10 text-white/70">
      {isPrivate ? (
        <Lock className="w-2.5 h-2.5" />
      ) : (
        <UserCheck className="w-2.5 h-2.5" />
      )}
      <span className="text-[10px] leading-none">
        {isPrivate ? 'Private' : 'Friends'}
      </span>
    </span>
  );
}

type PreviewCard = { label: string; sub: string };

function ComingSoonSection({
  icon,
  title,
  description,
  previewCards,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  previewCards: PreviewCard[];
}) {
  return (
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-5">
        {icon}
        <h2 className="text-base font-semibold text-white">{title}</h2>
        <span className="px-2 py-0.5 rounded-full bg-[#FFC300]/10 text-[#FFC300] text-xs font-medium">
          Coming Soon
        </span>
      </div>

      <div className="relative rounded-xl border border-[#2a2a2a] overflow-hidden">
        <div className="absolute inset-0 z-10 backdrop-blur-[3px] bg-[#1e1e1e]/65 flex flex-col items-center justify-center gap-2 p-4 text-center">
          <div className="opacity-30">{icon}</div>
          <p className="text-sm text-white/70 max-w-xs">{description}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 pointer-events-none select-none">
          {previewCards.map((card) => (
            <div
              key={card.label}
              className="rounded-lg bg-[#252525] border border-[#2a2a2a] p-4"
            >
              <div className="h-2 w-3/4 rounded bg-[#333] mb-2" />
              <div className="h-2 w-1/2 rounded bg-[#2a2a2a] mb-4" />
              <div className="h-2 w-2/3 rounded bg-[#2a2a2a]" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
