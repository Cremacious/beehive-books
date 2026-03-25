import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import DiscussionListItem from './discussion-list-item';
import type { ClubDiscussionWithAuthor, ClubRole } from '@/lib/types/club.types';

const PAGE_SIZE = 20;

interface DiscussionListProps {
  discussions: ClubDiscussionWithAuthor[];
  clubId: string;
  currentUserId: string | null;
  myRole: ClubRole | null;
  total: number;
  page: number;
}

export default function DiscussionList({
  discussions,
  clubId,
  currentUserId,
  myRole,
  total,
  page,
}: DiscussionListProps) {
  const isMember = myRole !== null;
  const isMod = myRole === 'OWNER' || myRole === 'MODERATOR';
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Discussions</h2>
          <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[10px] font-bold bg-[#FFC300] text-black">
            {total}
          </span>
        </div>
        {isMember && (
          <Link
            href={`/clubs/${clubId}/discussions/create`}
            className="px-3 py-1.5 rounded-lg bg-[#FFC300] text-black text-xs font-semibold hover:bg-[#FFD040] transition-colors"
          >
            New Discussion
          </Link>
        )}
      </div>

      {discussions.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm font-semibold text-white mb-1">No discussions yet</p>
          <p className="text-sm text-white/80 max-w-xs mx-auto">
            {isMember
              ? 'Start a conversation — ask a question, share your thoughts, or kick off a debate!'
              : 'Join this club to participate in discussions.'}
          </p>
          {isMember && (
            <Link
              href={`/clubs/${clubId}/discussions/create`}
              className="inline-flex mt-4 px-3 py-1.5 rounded-lg bg-[#FFC300] text-black text-xs font-semibold hover:bg-[#FFD040] transition-colors"
            >
              Start a Discussion
            </Link>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-[#2a2a2a] overflow-hidden mb-4">
          {discussions.map((discussion) => (
            <DiscussionListItem
              key={discussion.id}
              discussion={discussion}
              clubId={clubId}
              currentUserId={currentUserId}
              isMod={isMod}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          {page > 1 ? (
            <Link
              href={`/clubs/${clubId}/discussions?page=${page - 1}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#2a2a2a] text-sm text-white/80 hover:text-white transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#2a2a2a] text-sm text-white/80 opacity-40 cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" />
              Previous
            </span>
          )}

          <span className="text-sm text-white/80">
            {page} / {totalPages}
          </span>

          {page < totalPages ? (
            <Link
              href={`/clubs/${clubId}/discussions?page=${page + 1}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#2a2a2a] text-sm text-white/80 hover:text-white transition-all"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#2a2a2a] text-sm text-white/80 opacity-40 cursor-not-allowed">
              Next
              <ChevronRight className="w-4 h-4" />
            </span>
          )}
        </div>
      )}
    </div>
  );
}
