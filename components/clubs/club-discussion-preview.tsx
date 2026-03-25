'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ClubDiscussionWithAuthor } from '@/lib/types/club.types';

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function AuthorChip({
  author,
}: {
  author: ClubDiscussionWithAuthor['author'];
}) {
  const router = useRouter();
  const name = author.username ?? '?';
  const initials = name.charAt(0).toUpperCase();

  const avatar = author.image ? (
    <Image
      src={author.image}
      alt={name}
      width={24}
      height={24}
      className="w-6 h-6 rounded-full object-cover"
    />
  ) : (
    <div className="w-6 h-6 rounded-full bg-[#FFC300]/20 flex items-center justify-center shrink-0">
      <span className="text-xs font-semibold text-yellow-500">{initials}</span>
    </div>
  );

  if (!author.username) {
    return (
      <div className="flex items-center gap-1.5">
        {avatar}
        <span className="text-xs text-white/80">{name}</span>
      </div>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        router.push(`/u/${author.username!}`);
      }}
      className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
    >
      {avatar}
      <span className="text-xs text-white/80 hover:text-white transition-colors">
        {name}
      </span>
    </button>
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
        <h3 className="font-semibold text-white mainFont">Discussions</h3>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/clubs/${clubId}/discussions`}>View all</Link>
        </Button>
      </div>

      {preview.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <p className="text-sm font-semibold text-white mb-1">
            No discussions yet
          </p>
          <p className="text-sm text-white/80 mb-4 max-w-sm">
            Start conversations about books, share your thoughts, and connect
            with fellow readers.
          </p>
          {isMember && (
            <Button size="lg" asChild>
              <Link href={`/clubs/${clubId}/discussions/create`}>
                Start a Discussion
              </Link>
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
                  <span className="text-yellow-500 text-xs mr-1.5">📌</span>
                )}
                {discussion.title}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <AuthorChip author={discussion.author} />
                  <span className="text-xs text-white/80">·</span>
                  <span className="text-xs text-white/80">
                    {timeAgo(discussion.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-white/80">
                  <span>{discussion.replyCount} replies</span>
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
