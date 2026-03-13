import Link from 'next/link';
import Image from 'next/image';
import { MessageSquare, Heart, Pin } from 'lucide-react';
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

  return (
    <div className="rounded-xl bg-[#202020] border border-[#2a2a2a] p-4 hover:border-[#FFC300]/20 transition-all">
  
      {discussion.isPinned && (
        <div className="flex items-center gap-1.5 mb-2.5">
          <Pin className="w-3.5 h-3.5 text-[#FFC300]" />
          <span className="text-[11px] font-semibold text-[#FFC300] uppercase tracking-wider">
            Pinned
          </span>
        </div>
      )}


      <div className="flex items-center gap-2 mb-2.5">
        {author.username ? (
          <Link href={`/u/${author.username}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            {author.image ? (
              <Image
                src={author.image}
                alt={authorName}
                width={28}
                height={28}
                className="w-7 h-7 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#FFC300]/20 flex items-center justify-center shrink-0">
                <span className="text-[11px] font-semibold text-[#FFC300]">
                  {initials}
                </span>
              </div>
            )}
            <span className="text-xs font-medium text-white/80 hover:text-white transition-colors">{authorName}</span>
          </Link>
        ) : (
          <>
            {author.image ? (
              <Image
                src={author.image}
                alt={authorName}
                width={28}
                height={28}
                className="w-7 h-7 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#FFC300]/20 flex items-center justify-center shrink-0">
                <span className="text-[11px] font-semibold text-[#FFC300]">
                  {initials}
                </span>
              </div>
            )}
            <span className="text-xs font-medium text-white/80">{authorName}</span>
          </>
        )}
        <span className="text-xs text-white/80">·</span>
        <span className="text-xs text-white/80">
          {timeAgo(discussion.createdAt)}
        </span>
      </div>

   
      <Link href={`/clubs/${clubId}/discussions/${discussion.id}`}>
        <h3 className="text-base font-semibold text-white hover:text-[#FFC300] transition-colors mb-2 leading-snug mainFont">
          {discussion.title}
        </h3>
      </Link>

 
      {discussion.content && (
        <p className="text-sm text-white/80 line-clamp-3 leading-relaxed mb-3">
          {discussion.content}
        </p>
      )}


      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-white/80">
          <span className="flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            {discussion.replyCount} repl{discussion.replyCount !== 1 ? 'ies' : 'y'}
          </span>
          <span className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5" />
            {discussion.likeCount}
          </span>
        </div>
        <Link
          href={`/clubs/${clubId}/discussions/${discussion.id}`}
          className=" text-[#FFC300]/80 hover:text-[#FFC300] transition-colors"
        >
          Read more →
        </Link>
      </div>
    </div>
  );
}
