import Link from 'next/link';
import { Globe, Lock, Users, Crown, Shield, Check, Settings, UserPlus } from 'lucide-react';
import BackButton from '@/components/shared/back-button';
import { Button } from '@/components/ui/button';
import JoinClubButton from './join-club-button';
import ClubProgress from './club-progress';
import ClubDiscussionPreview from './club-discussion-preview';
import ClubMembersPreview from './club-members-preview';
import ClubReadingListPreview from './club-reading-list-preview';
import type {
  ClubWithMembership,
  ClubDiscussionWithAuthor,
  ClubMemberWithUser,
  ClubReadingListBook,
} from '@/lib/types/club.types';

interface ClubDashboardProps {
  club: ClubWithMembership;
  recentDiscussions: ClubDiscussionWithAuthor[];
  members: ClubMemberWithUser[];
  readingList: ClubReadingListBook[];
  currentUserId: string | null;
  pendingRequestCount?: number;
}

export default function ClubDashboard({
  club,
  recentDiscussions,
  members,
  readingList,
  pendingRequestCount = 0,
}: ClubDashboardProps) {
  const isOwner = club.myRole === 'OWNER';
  const isMember = club.isMember;

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 py-6 md:px-8">
      <BackButton href="/clubs" label="Clubs" className="mb-2" />

      {isOwner && pendingRequestCount > 0 && (
        <Link
          href={`/clubs/${club.id}/members`}
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#FFC300]/8 border border-[#FFC300]/20 hover:bg-[#FFC300]/12 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-yellow-500/15 flex items-center justify-center shrink-0">
            <UserPlus className="w-4 h-4 text-yellow-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-yellow-500">
              {pendingRequestCount} pending join {pendingRequestCount === 1 ? 'request' : 'requests'}
            </p>
            <p className="text-sm text-white">Tap to review in Members</p>
          </div>
          <span className="text-sm text-white">View →</span>
        </Link>
      )}
      <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-white mainFont">{club.name}</h1>

              {club.privacy === 'PUBLIC' ? (
                <span className="inline-flex items-center gap-1 text-xs text-white/80 bg-white/10 rounded-full px-2.5 py-1">
                  <Globe className="w-3 h-3" />
                  Public
                </span>
              ) : club.privacy === 'FRIENDS' ? (
                <span className="inline-flex items-center gap-1 text-xs text-white/80 bg-white/10 rounded-full px-2.5 py-1">
                  <Users className="w-3 h-3" />
                  Friends
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-white/80 bg-white/10 rounded-full px-2.5 py-1">
                  <Lock className="w-3 h-3" />
                  Private
                </span>
              )}

              {isOwner && (
                <span className="inline-flex items-center gap-1 text-xs text-yellow-500 bg-yellow-500/10 rounded-full px-2.5 py-1">
                  <Crown className="w-3 h-3" />
                  Owner
                </span>
              )}
              {club.myRole === 'MODERATOR' && (
                <span className="inline-flex items-center gap-1 text-xs text-white/80 bg-white/10 rounded-full px-2.5 py-1">
                  <Shield className="w-3 h-3" />
                  Moderator
                </span>
              )}
              {club.myRole === 'MEMBER' && (
                <span className="inline-flex items-center gap-1 text-xs text-white/80 bg-white/10 rounded-full px-2.5 py-1">
                  <Check className="w-3 h-3" />
                  Member
                </span>
              )}
            </div>

            <p className="text-sm text-white/80 mt-1">
              {club.memberCount} {club.memberCount !== 1 ? 'members' : 'member'}
            </p>

            {club.description && (
              <p className="text-sm text-white/80 mt-3 leading-relaxed max-w-2xl">
                {club.description}
              </p>
            )}

            {club.tags && club.tags.length > 0 && (
              <div className="flex gap-1.5 flex-wrap mt-3">
                {club.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs text-white/80 bg-[#1e1e1e] border border-[#2a2a2a] rounded-full px-2.5 py-0.5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isOwner && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/clubs/${club.id}/settings`}>
                  <Settings className="w-4 h-4 mr-1.5" />
                  Settings
                </Link>
              </Button>
            )}
            <JoinClubButton
              clubId={club.id}
              isMember={isMember}
              isOwner={isOwner}
              memberCount={club.memberCount}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ClubProgress club={club} />
          <ClubDiscussionPreview
            discussions={recentDiscussions}
            clubId={club.id}
            isMember={isMember}
          />
        </div>

        <div className="space-y-6">
          <ClubMembersPreview
            members={members}
            clubId={club.id}
            total={club.memberCount}
          />
          <ClubReadingListPreview
            books={readingList}
            clubId={club.id}
            isMember={isMember}
          />
        </div>
      </div>
    </div>
  );
}
