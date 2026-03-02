'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { Plus, Heart, Trash2, Loader2, Sparkles, Music, Smile, ImageIcon, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getBuzzItemsAction,
  createBuzzItemAction,
  toggleBuzzLikeAction,
  deleteBuzzItemAction,
} from '@/lib/actions/hive-buzz.actions';
import type { BuzzItemWithAuthor, BuzzType, HiveRole } from '@/lib/types/hive.types';

interface HiveBuzzBoardProps {
  hiveId: string;
  initialItems: BuzzItemWithAuthor[];
  currentUserId: string;
  myRole: HiveRole;
}

const BUZZ_TYPES: { value: BuzzType; label: string; Icon: React.ElementType; color: string }[] = [
  { value: 'INSPIRATION', label: 'Inspiration', Icon: Sparkles, color: 'text-purple-400' },
  { value: 'MEME', label: 'Meme', Icon: Smile, color: 'text-yellow-400' },
  { value: 'PLAYLIST', label: 'Playlist', Icon: Music, color: 'text-green-400' },
  { value: 'MOOD', label: 'Mood', Icon: ImageIcon, color: 'text-pink-400' },
  { value: 'OTHER', label: 'Other', Icon: MoreHorizontal, color: 'text-white/50' },
];

function buzzTypeConfig(type: BuzzType) {
  return BUZZ_TYPES.find((t) => t.value === type) ?? BUZZ_TYPES[4];
}

function timeAgo(date: Date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function BuzzCard({
  item,
  currentUserId,
  myRole,
  onLike,
  onDelete,
}: {
  item: BuzzItemWithAuthor;
  currentUserId: string;
  myRole: HiveRole;
  onLike: (id: string, liked: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const [liking, setLiking] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const typeConf = buzzTypeConfig(item.type);
  const Icon = typeConf.Icon;
  const canDelete =
    item.authorId === currentUserId || myRole === 'OWNER' || myRole === 'MODERATOR';

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    const result = await toggleBuzzLikeAction(item.id);
    if (result.success) onLike(item.id, result.liked);
    setLiking(false);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this buzz? This cannot be undone.')) return;
    setDeleting(true);
    await deleteBuzzItemAction(item.id);
    onDelete(item.id);
    setDeleting(false);
  };

  return (
    <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] p-4 space-y-3 group">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {item.author.imageUrl ? (
            <Image
              src={item.author.imageUrl}
              alt={item.author.username ?? 'User'}
              width={28}
              height={28}
              className="rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-[#FFC300]/15 flex items-center justify-center shrink-0 text-[#FFC300] font-bold text-xs">
              {(item.author.username ?? item.author.firstName ?? 'U')[0]?.toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-medium text-white truncate">
              {item.author.username ?? item.author.firstName ?? 'User'}
            </p>
            <p className="text-[10px] text-white/30">{timeAgo(item.createdAt)}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/5 ${typeConf.color}`}>
            <Icon className="w-3 h-3" />
            {typeConf.label}
          </span>
          {canDelete && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-white/30 hover:text-red-400"
            >
              {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap break-words">
        {item.content}
      </p>

      {/* Media */}
      {item.mediaUrl && (
        <a
          href={item.mediaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-xs text-[#FFC300] hover:underline truncate"
        >
          {item.mediaUrl}
        </a>
      )}

      {/* Footer */}
      <div className="flex items-center justify-end pt-0.5">
        <button
          onClick={handleLike}
          disabled={liking}
          className={`flex items-center gap-1.5 text-xs transition-colors ${
            item.likedByMe ? 'text-red-400' : 'text-white/30 hover:text-red-400'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${item.likedByMe ? 'fill-current' : ''}`} />
          {item.likeCount > 0 && item.likeCount}
        </button>
      </div>
    </div>
  );
}

function CreateBuzzForm({
  hiveId,
  onDone,
}: {
  hiveId: string;
  onDone: () => void;
}) {
  const [content, setContent] = useState('');
  const [type, setType] = useState<BuzzType>('INSPIRATION');
  const [mediaUrl, setMediaUrl] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    setError('');
    startTransition(async () => {
      const result = await createBuzzItemAction(hiveId, content, type, mediaUrl || undefined);
      if (!result.success) {
        setError(result.message);
        return;
      }
      onDone();
    });
  };

  return (
    <div className="rounded-2xl bg-[#252525] border border-[#FFC300]/20 p-5 space-y-4">
      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-[#FFC300]" />
        Share with the Hive
      </h3>

      {/* Type picker */}
      <div className="flex flex-wrap gap-2">
        {BUZZ_TYPES.map(({ value, label, Icon, color }) => (
          <button
            key={value}
            type="button"
            onClick={() => setType(value)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
              type === value
                ? 'border-[#FFC300]/50 bg-[#FFC300]/10 text-[#FFC300]'
                : 'border-[#2a2a2a] bg-[#1e1e1e] text-white/50 hover:border-white/20'
            }`}
          >
            <Icon className={`w-3 h-3 ${type === value ? 'text-[#FFC300]' : color}`} />
            {label}
          </button>
        ))}
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share something inspiring, funny, or useful…"
        maxLength={1000}
        rows={3}
        className="w-full rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#FFC300]/40 transition-all resize-none"
      />

      <input
        value={mediaUrl}
        onChange={(e) => setMediaUrl(e.target.value)}
        placeholder="Link (optional)"
        className="w-full rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#FFC300]/40 transition-all"
      />

      {error && (
        <p className="text-sm text-red-400 bg-red-400/10 rounded-xl px-4 py-2.5">{error}</p>
      )}

      <div className="flex items-center gap-3 justify-end">
        <Button variant="outline" size="sm" onClick={onDone} disabled={isPending}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleSubmit} disabled={isPending || !content.trim()}>
          {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Post
        </Button>
      </div>
    </div>
  );
}

export default function HiveBuzzBoard({
  hiveId,
  initialItems,
  currentUserId,
  myRole,
}: HiveBuzzBoardProps) {
  const [items, setItems] = useState<BuzzItemWithAuthor[]>(initialItems);
  const [showCreate, setShowCreate] = useState(false);
  const [, startTransition] = useTransition();

  const handleLike = (id: string, liked: boolean) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              likedByMe: liked,
              likeCount: liked ? item.likeCount + 1 : Math.max(item.likeCount - 1, 0),
            }
          : item,
      ),
    );
  };

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCreated = () => {
    setShowCreate(false);
    // Refetch from server to get the new item with full author data
    startTransition(async () => {
      const fresh = await getBuzzItemsAction(hiveId);
      setItems(fresh);
    });
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-white/40">
          {items.length} post{items.length !== 1 ? 's' : ''}
        </p>
        {!showCreate && (
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="w-3.5 h-3.5" />
            Share
          </Button>
        )}
      </div>

      {/* Create form */}
      {showCreate && (
        <CreateBuzzForm
          hiveId={hiveId}
          onDone={handleCreated}
        />
      )}

      {/* Item list */}
      {items.length === 0 && !showCreate ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#252525] flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-[#FFC300]/40" />
          </div>
          <p className="text-sm text-white/40">
            Nothing on the Buzz Board yet. Share some inspiration! 🐝
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <BuzzCard
              key={item.id}
              item={item}
              currentUserId={currentUserId}
              myRole={myRole}
              onLike={handleLike}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
