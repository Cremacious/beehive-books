import Link from 'next/link';
import { MessageSquare, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
        <div>
          <h2 className="text-lg font-semibold text-white mainFont">Discussions</h2>
          <p className="text-sm text-white/80 mt-0.5">
            {total} discussion{total !== 1 ? 's' : ''}
          </p>
        </div>
        {isMember && (
          <Button asChild size="sm">
            <Link href={`/clubs/${clubId}/discussions/create`}>
              <Plus />
              New Discussion
            </Link>
          </Button>
        )}
      </div>

    
      {discussions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl bg-[#252525] border border-[#2a2a2a]">
          <div className="w-16 h-16 rounded-2xl bg-[#1e1e1e] flex items-center justify-center mb-4">
            <MessageSquare className="w-7 h-7 text-white/80" />
          </div>
          <h3 className="text-base font-semibold text-white/80 mb-1">
            No discussions yet
          </h3>
          <p className="text-sm text-white/80 mb-4 max-w-xs">
            {isMember
              ? 'Start a conversation — ask a question, share your thoughts, or kick off a debate!'
              : 'Join this club to participate in discussions.'}
          </p>
          {isMember && (
            <Button asChild size="sm">
              <Link href={`/clubs/${clubId}/discussions/create`}>
                <Plus />
                Start a Discussion
              </Link>
            </Button>
          )}
        </div>
      )}


      {discussions.length > 0 && (
        <div className="space-y-3">
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
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#2a2a2a] text-sm text-white/80 hover:text-white hover:border-[#2a2a2a] transition-all"
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
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#2a2a2a] text-sm text-white/80 hover:text-white hover:border-[#2a2a2a] transition-all"
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
