import { notFound } from 'next/navigation';
import Image from 'next/image';
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
import ReadingListCard from '@/components/reading-lists/reading-list-card';
import ClubCard from '@/components/clubs/club-card';
import HiveCard from '@/components/hive/hive-card';
import { PromptCard } from '@/components/prompts/prompt-card';
import { ProfileSectionGrid } from '@/components/profile/profile-section-grid';
import { FriendButton } from '@/components/friends/friend-button';
import { getUserProfileAction } from '@/lib/actions/user.actions';
import { getFriendshipStatusAction } from '@/lib/actions/friend.actions';
import type { ReadingList } from '@/lib/types/reading-list.types';

const BOOK_GRID_LIMIT = 4;
const GRID_LIMIT = 3;

type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `${username}`,
    description: `View ${username}'s profile on Beehive Books — their books, reading lists, and more.`,
  };
}

export default async function UserProfilePage({ params }: Props) {
  const { username } = await params;
  const profile = await getUserProfileAction(username);

  if (!profile) notFound();

  const {
    user,
    books,
    readingLists,
    clubs,
    hives,
    prompts,
    isOwnProfile,
    currentUserId,
  } = profile;

  const friendStatus =
    currentUserId && !isOwnProfile
      ? await getFriendshipStatusAction(user.id)
      : null;

  const displayName = user.username ?? 'unknown';
  const memberSince = user.createdAt.getFullYear();

  const promptCards = prompts.map((p) => ({
    ...p,
    creator: {
      id: user.id,
      username: user.username,
      image: user.image,
    },
    myInviteStatus: null as 'PENDING' | 'ACCEPTED' | null,
    myEntryId: null as string | null,
  }));

  const bookPlaceholder = (
    <div className="flex flex-col rounded-lg border-2 border-dashed border-[#FFC300]/25 bg-[#1a1a1a] overflow-hidden">
      <div className="relative w-full aspect-2/3 flex items-center justify-center">
        <BookOpen className="w-8 h-8 text-[#FFC300]/15" />
      </div>
      <div className="px-3 pt-3 pb-3" />
    </div>
  );

  const cardPlaceholder = (
    <div className="rounded-2xl border-2 border-dashed border-[#2a2a2a] bg-[#1a1a1a] min-h-42.5" />
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:px-8">
      <div className="rounded-2xl bg-[#1e1e1e] border border-[#2a2a2a] mb-10 overflow-hidden">
        <div className="h-28 bg-linear-to-br from-[#2d2200] via-[#1e1800] to-[#1a1a1a]" />
        <div className="px-5 pb-5 md:px-7 md:pb-7">
          <div className="flex items-end justify-between -mt-10 gap-4">
            <div className="w-20 h-20 rounded-full ring-4 ring-[#1e1e1e] overflow-hidden bg-[#2a2000] shrink-0">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={displayName}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-[#FFC300]">
                    {(displayName[0] || '?').toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="pb-1 flex items-center gap-2">
              {isOwnProfile && (
                <button className="text-xs px-3 py-1.5 rounded-lg border border-[#2a2a2a] text-white/80 hover:text-white hover:border-[#FFC300]/40 transition-all cursor-not-allowed">
                  Edit Profile
                </button>
              )}
              {friendStatus && (
                <FriendButton
                  targetUserId={user.id}
                  initialStatus={friendStatus}
                />
              )}
            </div>
          </div>
          <div className="mt-3">
            <h1 className="text-xl md:text-2xl font-bold text-white mainFont">
              {displayName}
            </h1>
            <p className="text-xs text-white/80 mt-0.5">
              Member since {memberSince}
            </p>
          </div>
        </div>
      </div>

      <ProfileSectionGrid
        icon={<BookOpen className="w-5 h-5 text-[#FFC300]" />}
        title="Library"
        count={books.length}
        limit={BOOK_GRID_LIMIT}
        gridClassName="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4"
        placeholder={bookPlaceholder}
        searchTexts={books.map((b) => `${b.title} ${b.author} ${b.genre}`)}
      >
        {books.map((book) => (
          <div key={book.id} className="relative">
            <BookCard book={book} />
            {isOwnProfile && book.privacy !== 'PUBLIC' && (
              <div className="absolute top-1.5 right-1.5 z-10">
                <PrivacyBadge privacy={book.privacy as 'PRIVATE' | 'FRIENDS'} />
              </div>
            )}
          </div>
        ))}
      </ProfileSectionGrid>

      <ProfileSectionGrid
        icon={<BookMarked className="w-5 h-5 text-[#FFC300]" />}
        title="Reading Lists"
        count={readingLists.length}
        limit={GRID_LIMIT}
        gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        placeholder={cardPlaceholder}
        searchTexts={readingLists.map((l) => `${l.title} ${l.description}`)}
      >
        {readingLists.map((list) => (
          <ReadingListCard key={list.id} list={list as ReadingList} />
        ))}
      </ProfileSectionGrid>

      <ProfileSectionGrid
        icon={<Zap className="w-5 h-5 text-[#a855f7]" />}
        title="Prompts"
        count={promptCards.length}
        limit={GRID_LIMIT}
        gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        placeholder={cardPlaceholder}
        searchTexts={promptCards.map((p) => `${p.title} ${p.description}`)}
        statusValues={promptCards.map((p) => p.status)}
        statusLabels={{ ACTIVE: 'Active', ENDED: 'Ended' }}
      >
        {promptCards.map((prompt) => (
          <PromptCard key={prompt.id} prompt={prompt} />
        ))}
      </ProfileSectionGrid>

      <ProfileSectionGrid
        icon={<Users className="w-5 h-5 text-[#fb923c]" />}
        title="Book Clubs"
        count={clubs.length}
        limit={GRID_LIMIT}
        gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        placeholder={cardPlaceholder}
        searchTexts={clubs.map((c) => `${c.name} ${c.description}`)}
      >
        {clubs.map((club) => (
          <ClubCard key={club.id} club={club} />
        ))}
      </ProfileSectionGrid>

      <ProfileSectionGrid
        icon={<Hexagon className="w-5 h-5 text-[#FFC300]" />}
        title="Hives"
        count={hives.length}
        limit={GRID_LIMIT}
        gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        placeholder={cardPlaceholder}
        searchTexts={hives.map((h) => `${h.name} ${h.description}`)}
        statusValues={hives.map((h) => h.status)}
        statusLabels={{ ACTIVE: 'Active', COMPLETED: 'Completed' }}
      >
        {hives.map((hive) => (
          <HiveCard key={hive.id} hive={hive} />
        ))}
      </ProfileSectionGrid>
    </div>
  );
}

function PrivacyBadge({ privacy }: { privacy: 'PRIVATE' | 'FRIENDS' }) {
  const isPrivate = privacy === 'PRIVATE';
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-sm border border-white/10 text-white/80">
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
