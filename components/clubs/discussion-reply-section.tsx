'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useClubStore } from '@/lib/stores/club-store';
import DiscussionReply from './discussion-reply';
import type {
  ClubDiscussionReplyWithAuthor,
  ClubRole,
} from '@/lib/types/club.types';

interface DiscussionReplySectionProps {
  replies: ClubDiscussionReplyWithAuthor[];
  clubId: string;
  discussionId: string;
  currentUserId: string | null;
  isMember: boolean;
  myRole: ClubRole | null;
}

export default function DiscussionReplySection({
  replies,
  clubId,
  discussionId,
  currentUserId,
  isMember,
  myRole,
}: DiscussionReplySectionProps) {
  const router = useRouter();
  const store = useClubStore();

  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');

  const topLevel = replies.filter((r) => r.parentId === null);

  const handlePost = async () => {
    if (!content.trim()) return;
    setPosting(true);
    setError('');
    const result = await store.createReply(
      clubId,
      discussionId,
      content.trim(),
    );
    setPosting(false);
    if (result.success) {
      setContent('');
      router.refresh();
    } else {
      setError(result.message);
    }
  };

  return (
    <div>
      {isMember ? (
        <div className="rounded-xl bg-[#252525] border border-[#2a2a2a] p-4 mb-4">
          <label className="block text-sm font-medium text-white mb-2">
            Add a Reply
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            placeholder="Share your thoughts…"
            className="w-full rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFC300]/40 focus:ring-1 focus:ring-[#FFC300]/20 transition-all resize-none"
          />
          {error && <p className="text-xs text-red-400 mt-1.5">{error}</p>}
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={handlePost}
              disabled={posting || !content.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#FFC300] text-black text-sm font-semibold hover:bg-[#e0ac01] disabled:opacity-50 transition-colors"
            >
              {posting && <Loader2 className="w-4 h-4 animate-spin" />}
              Post Reply
            </button>
          </div>
        </div>
      ) : currentUserId ? (
        <div className="rounded-xl bg-[#252525] border border-[#2a2a2a] p-4 mb-4 text-center">
          <p className="text-sm text-white/80 mb-2">
            Join this club to participate in discussions.
          </p>
          <Link
            href={`/clubs/${clubId}`}
            className="text-sm text-[#FFC300]/80 hover:text-[#FFC300] transition-colors"
          >
            View Club →
          </Link>
        </div>
      ) : (
        <div className="rounded-xl bg-[#252525] border border-[#2a2a2a] p-4 mb-4 text-center">
          <p className="text-sm text-white/80">
            Sign in and join this club to participate.
          </p>
        </div>
      )}

      {topLevel.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center rounded-xl bg-[#252525] border border-[#2a2a2a]">
          <MessageSquare className="w-8 h-8 text-white/80 mb-2" />
          <p className="text-sm text-white/80">
            No replies yet. {isMember ? 'Be the first to reply!' : ''}
          </p>
        </div>
      ) : (
        <div className="rounded-xl bg-[#252525] border border-[#2a2a2a] px-4 divide-y divide-[#2a2a2a]">
          {topLevel.map((reply) => (
            <DiscussionReply
              key={reply.id}
              reply={reply}
              clubId={clubId}
              discussionId={discussionId}
              currentUserId={currentUserId}
              isMember={isMember}
              myRole={myRole}
              depth={0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
