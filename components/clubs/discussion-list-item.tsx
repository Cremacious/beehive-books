import Link from 'next/link';
import Image from 'next/image';
import type { ClubDiscussionWithAuthor } from '@/lib/types/club.types';

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

interface DiscussionListItemProps {
  discussion: ClubDiscussionWithAuthor;
  clubId: string;
  currentUserId: string | null;
  isMod: boolean;
}

export default function DiscussionListItem({
  discussion,
  clubId,
}: DiscussionListItemProps) {
  const author = discussion.author;
  const authorName = author.username ?? 'Unknown';
  const initials = authorName.charAt(0).toUpperCase();
  const lastActivity = timeAgo(discussion.updatedAt ?? discussion.createdAt);

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-[#2a2a2a] last:border-b-0 hover:bg-white/5 transition-colors">
      <div className="shrink-0">
        {author.image ? (
          <Image
            src={author.image}
            alt={authorName}
            width={32}
            height={32}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <span className="text-xs font-semibold text-yellow-500">{initials}</span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          {discussion.isPinned && (
            <span className="bg-yellow-500/15 text-yellow-500 text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide shrink-0">
              Pinned
            </span>
          )}
          <Link
            href={`/clubs/${clubId}/discussions/${discussion.id}`}
            className="text-sm font-semibold text-white hover:text-yellow-500 transition-colors"
          >
            {discussion.title}
          </Link>
        </div>
        <p className="text-xs text-white/80 mt-0.5">
          {authorName} · {timeAgo(discussion.createdAt)}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-sm font-medium text-white">{discussion.replyCount}</p>
        <p className="text-xs text-white/80">replies</p>
        <p className="text-xs text-white/80 mt-0.5">{lastActivity}</p>
      </div>
    </div>
  );
}
