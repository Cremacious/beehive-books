'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MessageSquare, Heart, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ClubDiscussionWithAuthor } from '@/lib/types/club.types';

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function AuthorAvatar({ author }: { author: ClubDiscussionWithAuthor['author'] }) {
  const name = author.firstName ?? author.username ?? '?';
  const initials = name.charAt(0).toUpperCase();
  if (author.imageUrl) {
    return (
      <Image
        src={author.imageUrl}
        alt={name}
        width={24}
        height={24}
        className="w-6 h-6 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="w-6 h-6 rounded-full bg-[#FFC300]/20 flex items-center justify-center shrink-0">
      <span className="text-[10px] font-semibold text-[#FFC300]">{initials}</span>
    </div>
  );
}

interface ClubDiscussionPreviewProps {
  discussions: ClubDiscussionWithAuthor[];
  clubId: string;
  isMember: boolean;
}

export default function ClubDiscussionPreview({
  discussions,
  clubId,
  isMember,
}: ClubDiscussionPreviewProps) {
  const preview = discussions.slice(0, 3);

  return (
    <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#FFC300]" />
          <h3 className="text-base font-semibold text-white">Discussions</h3>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/clubs/${clubId}/discussions`}>View all</Link>
        </Button>
      </div>

      {preview.length === 0 ? (
        <div className="py-12 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#1e1e1e] border border-[#2a2a2a] flex items-center justify-center mb-4">
            <MessageCircle className="w-7 h-7 text-white/80" />
          </div>
          <p className="text-sm font-medium text-white mb-1">No discussions yet</p>
          <p className="text-sm text-white/80 mb-4 max-w-xs">
            Start a conversation — share thoughts, questions, or reactions about the books you&apos;re reading.
          </p>
          {isMember && (
            <Button size="sm" asChild>
              <Link href={`/clubs/${clubId}/discussions/create`}>Start a Discussion</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {preview.map((discussion) => (
            <Link
              key={discussion.id}
              href={`/clubs/${clubId}/discussions/${discussion.id}`}
              className="block rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] p-3.5 hover:border-[#FFC300]/20 transition-all"
            >
              <p className="text-sm font-medium text-white truncate mb-2">
                {discussion.isPinned && (
                  <span className="text-[#FFC300] text-xs mr-1.5">📌</span>
                )}
                {discussion.title}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <AuthorAvatar author={discussion.author} />
                  <span className="text-xs text-white/80">
                    {discussion.author.username ?? discussion.author.firstName ?? 'Unknown'}
                  </span>
                  <span className="text-xs text-white/80">·</span>
                  <span className="text-xs text-white/80">{timeAgo(discussion.createdAt)}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-white/80">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {discussion.replyCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {discussion.likeCount}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
