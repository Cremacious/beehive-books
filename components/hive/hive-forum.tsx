'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import {
  createThreadAction,
  replyToThreadAction,
  deleteForumMessageAction,
  getThreadRepliesAction,
} from '@/lib/actions/hive-forum.actions';
import { getHiveForumAction } from '@/lib/actions/hive-forum.actions';
import type { ForumThreadWithAuthor, ForumReplyWithAuthor, HiveRole } from '@/lib/types/hive.types';
import { ChevronDown, ChevronUp, MessageSquare, Trash2 } from 'lucide-react';

interface Props {
  hiveId: string;
  initialThreads: ForumThreadWithAuthor[];
  currentUserId: string;
  myRole: HiveRole;
}

function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function Avatar({ user }: { user: { username: string | null; image: string | null } }) {
  return (
    <div className="w-7 h-7 rounded-full bg-[#252525] shrink-0 overflow-hidden ring-1 ring-[#2a2a2a]">
      {user.image ? (
        <Image src={user.image} alt={user.username ?? 'user'} width={28} height={28} className="object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-[10px] font-medium text-white/80">
          {(user.username ?? '?')[0].toUpperCase()}
        </div>
      )}
    </div>
  );
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function ReplyRow({
  reply,
  currentUserId,
  isMod,
  hiveId,
  onDelete,
}: {
  reply: ForumReplyWithAuthor;
  currentUserId: string;
  isMod: boolean;
  hiveId: string;
  onDelete: (id: string) => void;
}) {
  const canDelete = reply.authorId === currentUserId || isMod;
  return (
    <div className="flex gap-3 py-3 border-t border-[#2a2a2a] first:border-t-0">
      <Avatar user={reply.author} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-white">
            {reply.author.username ?? 'Unknown'}
          </span>
          <span className="text-xs text-white/80">{timeAgo(reply.createdAt)}</span>
        </div>
        <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap break-words">
          {reply.content}
        </p>
      </div>
      {canDelete && (
        <button
          type="button"
          onClick={() => onDelete(reply.id)}
          className="shrink-0 p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/5 transition-colors"
          title="Delete reply"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

function ThreadCard({
  thread,
  currentUserId,
  isMod,
  hiveId,
  onDelete,
  onRefresh,
}: {
  thread: ForumThreadWithAuthor;
  currentUserId: string;
  isMod: boolean;
  hiveId: string;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [replies, setReplies] = useState<ForumReplyWithAuthor[] | null>(null);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replyError, setReplyError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const canDelete = thread.authorId === currentUserId || isMod;
  const preview = stripHtml(thread.content).slice(0, 100);
  const hasMore = stripHtml(thread.content).length > 100;

  async function toggleExpand() {
    const next = !expanded;
    setExpanded(next);
    if (next && replies === null) {
      setLoadingReplies(true);
      const fetched = await getThreadRepliesAction(hiveId, thread.id);
      setReplies(fetched);
      setLoadingReplies(false);
    }
  }

  function handleReply() {
    setReplyError(null);
    startTransition(async () => {
      const result = await replyToThreadAction(hiveId, thread.id, replyContent);
      if (!result.success) {
        setReplyError(result.message);
        return;
      }
      setReplyContent('');
      const fresh = await getThreadRepliesAction(hiveId, thread.id);
      setReplies(fresh);
      onRefresh();
    });
  }

  function handleDeleteReply(replyId: string) {
    startTransition(async () => {
      await deleteForumMessageAction(hiveId, replyId);
      const fresh = await getThreadRepliesAction(hiveId, thread.id);
      setReplies(fresh);
      onRefresh();
    });
  }

  return (
    <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-2xl overflow-hidden">
      {/* Thread header / preview */}
      <button
        type="button"
        onClick={toggleExpand}
        className="w-full text-left p-4 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-start gap-3">
          <Avatar user={thread.author} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-sm font-semibold text-white">
                {thread.author.username ?? 'Unknown'}
              </span>
              <span className="text-xs text-white/80">{timeAgo(thread.createdAt)}</span>
              <span className="ml-auto flex items-center gap-1 text-xs text-white/80">
                <MessageSquare className="w-3 h-3" />
                {thread.replyCount}
              </span>
            </div>
            <p className="text-sm text-white/80 leading-relaxed">
              {preview}{hasMore ? '…' : ''}
            </p>
          </div>
          <div className="shrink-0 text-white/80">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {/* Expanded: full content + replies + reply box */}
      {expanded && (
        <div className="border-t border-[#2a2a2a] px-4 pb-4">
          {/* Full thread content */}
          <div className="pt-4 pb-3">
            <div className="flex items-start gap-2 justify-between">
              <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap break-words flex-1">
                {thread.content}
              </p>
              {canDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(thread.id)}
                  className="shrink-0 p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/5 transition-colors ml-2"
                  title="Delete thread"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Replies */}
          {loadingReplies && (
            <p className="text-xs text-white/80 py-2">Loading replies…</p>
          )}
          {replies && replies.length > 0 && (
            <div className="mb-3">
              {replies.map((reply) => (
                <ReplyRow
                  key={reply.id}
                  reply={reply}
                  currentUserId={currentUserId}
                  isMod={isMod}
                  hiveId={hiveId}
                  onDelete={handleDeleteReply}
                />
              ))}
            </div>
          )}
          {replies !== null && replies.length === 0 && (
            <p className="text-xs text-white/80 py-2 mb-2">No replies yet. Be the first.</p>
          )}

          {/* Reply box */}
          <div className="flex gap-2 mt-2">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply…"
              rows={2}
              className="flex-1 px-3 py-2 rounded-xl bg-[#252525] border border-[#333] text-sm text-white/80 placeholder:text-white/80 resize-none focus:outline-none focus:border-yellow-500/40"
            />
            <button
              type="button"
              onClick={handleReply}
              disabled={isPending || !replyContent.trim()}
              className="shrink-0 px-3 py-2 rounded-xl bg-yellow-500/15 border border-yellow-500/20 text-yellow-500 text-sm font-medium hover:bg-yellow-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-end"
            >
              Reply
            </button>
          </div>
          {replyError && <p className="text-xs text-red-400 mt-1">{replyError}</p>}
        </div>
      )}
    </div>
  );
}

export default function HiveForum({ hiveId, initialThreads, currentUserId, myRole }: Props) {
  const [threads, setThreads] = useState(initialThreads);
  const [newThreadOpen, setNewThreadOpen] = useState(false);
  const [newThreadContent, setNewThreadContent] = useState('');
  const [threadError, setThreadError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isMod = myRole === 'OWNER' || myRole === 'MODERATOR';

  async function refreshThreads() {
    const fresh = await getHiveForumAction(hiveId);
    setThreads(fresh);
  }

  function handleCreateThread() {
    setThreadError(null);
    startTransition(async () => {
      const result = await createThreadAction(hiveId, newThreadContent);
      if (!result.success) {
        setThreadError(result.message);
        return;
      }
      setNewThreadContent('');
      setNewThreadOpen(false);
      await refreshThreads();
    });
  }

  function handleDeleteThread(threadId: string) {
    startTransition(async () => {
      await deleteForumMessageAction(hiveId, threadId);
      await refreshThreads();
    });
  }

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Forum</h1>
          <p className="text-sm text-white/80 mt-0.5">Discuss ideas, share thoughts, ask questions.</p>
        </div>
        {!newThreadOpen && (
          <button
            type="button"
            onClick={() => setNewThreadOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/15 border border-yellow-500/20 text-yellow-500 text-sm font-medium hover:bg-yellow-500/20 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            New Thread
          </button>
        )}
      </div>

      {/* New thread form */}
      {newThreadOpen && (
        <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-2xl p-5 mb-6">
          <h2 className="text-sm font-semibold text-white mb-3">New Thread</h2>
          <textarea
            value={newThreadContent}
            onChange={(e) => setNewThreadContent(e.target.value)}
            placeholder="What's on your mind?"
            rows={4}
            className="w-full px-3 py-2 rounded-xl bg-[#252525] border border-[#333] text-sm text-white/80 placeholder:text-white/80 resize-none focus:outline-none focus:border-yellow-500/40 mb-3"
          />
          {threadError && <p className="text-xs text-red-400 mb-2">{threadError}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCreateThread}
              disabled={isPending || !newThreadContent.trim()}
              className="px-4 py-2 rounded-xl bg-yellow-500/15 border border-yellow-500/20 text-yellow-500 text-sm font-medium hover:bg-yellow-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Posting…' : 'Post'}
            </button>
            <button
              type="button"
              onClick={() => { setNewThreadOpen(false); setNewThreadContent(''); setThreadError(null); }}
              disabled={isPending}
              className="px-4 py-2 rounded-xl bg-[#252525] border border-[#2a2a2a] text-white/80 text-sm font-medium hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Thread list */}
      {threads.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] flex items-center justify-center mx-auto mb-3">
            <MessageSquare className="w-5 h-5 text-white/80" />
          </div>
          <p className="text-sm font-medium text-white/80">No threads yet</p>
          <p className="text-xs text-white/80 mt-1">Start the conversation.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {threads.map((thread) => (
            <ThreadCard
              key={thread.id}
              thread={thread}
              currentUserId={currentUserId}
              isMod={isMod}
              hiveId={hiveId}
              onDelete={handleDeleteThread}
              onRefresh={refreshThreads}
            />
          ))}
        </div>
      )}
    </div>
  );
}
