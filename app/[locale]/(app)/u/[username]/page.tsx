import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { BookOpen, Heart, Trophy } from 'lucide-react';
import { ProfileContent } from '@/components/profile/profile-content';
import { FriendButton } from '@/components/friends/friend-button';
import { CoverImageViewer } from '@/components/library/cover-image-viewer';
import { getUserProfileAction } from '@/lib/actions/user.actions';
import { getFriendshipStatusAction } from '@/lib/actions/friend.actions';
import type { ClubWithMembership } from '@/lib/types/club.types';
import type { HiveWithMembership } from '@/lib/types/hive.types';
import type { PromptCard as PromptCardType } from '@/lib/types/prompt.types';

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
    promptWins,
    isOwnProfile,
    currentUserId,
  } = profile;

  const friendStatus =
    currentUserId && !isOwnProfile
      ? await getFriendshipStatusAction(user.id)
      : null;

  const displayName = user.username ?? 'unknown';
  const memberSince = user.createdAt.getFullYear();

  const totalBooks = books.filter((b) => b.privacy === 'PUBLIC').length;
  const totalLikes = books.reduce((sum, b) => sum + (b.likeCount ?? 0), 0);

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

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:px-8">
      <div className="rounded-2xl bg-[#1e1e1e] border border-[#2a2a2a] mb-10 overflow-hidden">
        {/* Banner */}
        <div className="h-36 relative overflow-hidden bg-gradient-to-br from-[#2d2200] via-[#1e1800] to-[#141414]">
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100' viewBox='0 0 56 100'%3E%3Cpath d='M28 66L0 50V16L28 0l28 16v34L28 66zm0-2l26-15V18L28 2 2 18v30l26 15z' fill='%23FFC300'/%3E%3C/svg%3E")`,
              backgroundSize: '56px 100px',
            }}
          />
        </div>

        <div className="px-5 pb-6 md:px-7 md:pb-7">
          <div className="flex items-end justify-between -mt-12 gap-4">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full ring-4 ring-[#1e1e1e] overflow-hidden bg-[#2a2000] shrink-0">
              {user.image ? (
                <div className="relative w-24 h-24 rounded-full overflow-hidden">
                  <Image
                    src={user.image}
                    alt={displayName}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                  <CoverImageViewer src={user.image} alt={displayName} />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-[#FFC300]">
                    {(displayName[0] || '?').toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="pb-1 flex items-center gap-2">
              {isOwnProfile ? (
                <Link
                  href="/settings"
                  data-testid="edit-profile-link"
                  className="text-xs px-4 py-2 rounded-full border border-[#2a2a2a] text-white/80 hover:text-white hover:border-[#FFC300]/30 transition-all"
                >
                  Edit Profile
                </Link>
              ) : (
                <button
                  disabled
                  className="text-xs px-4 py-2 rounded-full border border-[#2a2a2a] text-white/80 cursor-not-allowed"
                  title="Follow feature coming soon"
                >
                  Follow
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

          {/* Name + meta */}
          <div className="mt-3">
            <h1 data-testid="profile-username" className="text-xl md:text-2xl font-bold text-white mainFont">
              {displayName}
            </h1>
            <p className="text-xs text-white/80 mt-0.5">Member since {memberSince}</p>

            {/* Stats row */}
            <div className="flex items-center gap-5 mt-3 flex-wrap">
              <div className="flex items-center gap-1.5 text-sm text-white/80">
                <BookOpen className="w-4 h-4 text-[#FFC300]/60" />
                <span>{totalBooks} {totalBooks === 1 ? 'book' : 'books'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-white/80">
                <Heart className="w-4 h-4 text-rose-400/60" />
                <span>{totalLikes} {totalLikes === 1 ? 'like' : 'likes'}</span>
              </div>
            </div>

            {/* Bio */}
            {user.bio ? (
              <p className="text-sm text-white/80 mt-3 max-w-lg leading-relaxed">{user.bio}</p>
            ) : isOwnProfile ? (
              <p className="text-sm text-white/80 mt-3 italic">
                No bio yet.{' '}
                <Link href="/settings" className="text-[#FFC300]/60 hover:text-[#FFC300] transition-colors not-italic">Add one in settings</Link>
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {promptWins.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            Prompt Wins
          </h2>
          <div className="flex flex-col gap-2">
            {promptWins.map((win) => (
              <Link
                key={win.id}
                href={`/prompts/${win.id}`}
                className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] hover:border-[#FFC300]/30 transition-colors group"
              >
                <p className="text-sm text-white font-medium truncate group-hover:text-yellow-500 transition-colors">
                  {win.title}
                </p>
                <div className="flex gap-1.5 shrink-0">
                  {win.isCommunityWin && (
                    <span className="bg-[#FFC300] text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Community Pick
                    </span>
                  )}
                  {win.isAuthorChoice && (
                    <span className="bg-white/10 border border-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Author&apos;s Pick
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <ProfileContent
        books={books}
        readingLists={readingLists}
        clubs={clubs as unknown as ClubWithMembership[]}
        hives={hives as unknown as HiveWithMembership[]}
        promptCards={promptCards as unknown as PromptCardType[]}
        isOwnProfile={isOwnProfile}
      />
    </div>
  );
}
