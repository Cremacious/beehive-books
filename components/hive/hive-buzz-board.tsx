'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import {
  Plus,
  Trash2,
  Loader2,
  Sparkles,
  Music,
  Smile,
  ImageIcon,
  MoreHorizontal,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Popup from '@/components/ui/popup';
import { DeleteDialog } from '@/components/shared/delete-dialog';
import {
  getBuzzItemsAction,
  createBuzzItemAction,
  deleteBuzzItemAction,
} from '@/lib/actions/hive-buzz.actions';
import type {
  BuzzItemWithAuthor,
  BuzzType,
  HiveRole,
} from '@/lib/types/hive.types';

interface HiveBuzzBoardProps {
  hiveId: string;
  initialItems: BuzzItemWithAuthor[];
  currentUserId: string;
  myRole: HiveRole;
}

const BUZZ_TYPES: {
  value: BuzzType;
  label: string;
  Icon: React.ElementType;
  color: string;
  cardAccent: string;
}[] = [
  {
    value: 'INSPIRATION',
    label: 'Inspiration',
    Icon: Sparkles,
    color: 'text-purple-400',
    cardAccent: 'border-purple-500/25 bg-purple-500/5',
  },
  {
    value: 'MEME',
    label: 'Meme',
    Icon: Smile,
    color: 'text-yellow-400',
    cardAccent: 'border-yellow-500/25 bg-yellow-500/5',
  },
  {
    value: 'PLAYLIST',
    label: 'Playlist',
    Icon: Music,
    color: 'text-green-400',
    cardAccent: 'border-green-500/25 bg-green-500/5',
  },
  {
    value: 'MOOD',
    label: 'Mood',
    Icon: ImageIcon,
    color: 'text-pink-400',
    cardAccent: 'border-pink-500/25 bg-pink-500/5',
  },
  {
    value: 'OTHER',
    label: 'Other',
    Icon: MoreHorizontal,
    color: 'text-white/50',
    cardAccent: 'border-[#2a2a2a] bg-[#252525]',
  },
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

/** Tailwind line-clamp class based on content length so cards have variable heights. */
function clampClass(content: string): string {
  if (content.length < 120) return 'line-clamp-3';
  if (content.length < 300) return 'line-clamp-5';
  if (content.length < 600) return 'line-clamp-7';
  return 'line-clamp-10';
}

function AuthorRow({
  item,
  small = false,
}: {
  item: BuzzItemWithAuthor;
  small?: boolean;
}) {
  const size = small ? 20 : 26;
  return (
    <div className="flex items-center gap-2 min-w-0">
      {item.author.imageUrl ? (
        <Image
          src={item.author.imageUrl}
          alt={item.author.username ?? 'User'}
          width={size}
          height={size}
          className="rounded-full object-cover shrink-0"
        />
      ) : (
        <div
          style={{ width: size, height: size }}
          className="rounded-full bg-[#FFC300]/15 flex items-center justify-center shrink-0 text-[#FFC300] font-bold text-[10px]"
        >
          {(item.author.username ??
            item.author.firstName ??
            'U')[0]?.toUpperCase()}
        </div>
      )}
      <div className="min-w-0">
        <p
          className={`font-medium text-white truncate ${small ? 'text-[10px]' : 'text-xs'}`}
        >
          {item.author.username ?? item.author.firstName ?? 'User'}
        </p>
        <p className="text-[10px] text-white/30">{timeAgo(item.createdAt)}</p>
      </div>
    </div>
  );
}

function BuzzCard({
  item,
  onClick,
}: {
  item: BuzzItemWithAuthor;
  onClick: () => void;
}) {
  const typeConf = buzzTypeConfig(item.type);
  const Icon = typeConf.Icon;

  return (
    <div
      onClick={onClick}
      className={`break-inside-avoid mb-4 rounded-2xl border p-4 space-y-2.5 cursor-pointer hover:brightness-125 transition-all ${typeConf.cardAccent}`}
    >
      <div className="flex items-center justify-between gap-2">
        <AuthorRow item={item} small />
        <span
          className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/5 shrink-0 ${typeConf.color}`}
        >
          <Icon className="w-3 h-3" />
          {typeConf.label}
        </span>
      </div>

      <p
        className={`text-sm text-white/85 leading-relaxed whitespace-pre-wrap ${clampClass(item.content)}`}
      >
        {item.content}
      </p>

      {item.mediaUrl && (
        <p className={`text-[10px] text-[#FFC300]/60 truncate`}>
          {item.mediaUrl}
        </p>
      )}
    </div>
  );
}

function BuzzDetail({
  item,
  currentUserId,
  myRole,
  onDelete,
  onClose,
}: {
  item: BuzzItemWithAuthor;
  currentUserId: string;
  myRole: HiveRole;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  const typeConf = buzzTypeConfig(item.type);
  const Icon = typeConf.Icon;
  const canDelete =
    item.authorId === currentUserId ||
    myRole === 'OWNER' ||
    myRole === 'MODERATOR';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <AuthorRow item={item} />
        <span
          className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-white/5 border border-white/10 ${typeConf.color}`}
        >
          <Icon className="w-3.5 h-3.5" />
          {typeConf.label}
        </span>
      </div>

      <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">
        {item.content}
      </p>

      {item.mediaUrl && (
        <a
          href={item.mediaUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 text-xs text-[#FFC300] hover:underline break-all"
        >
          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          {item.mediaUrl}
        </a>
      )}

      {canDelete && (
        <div className="pt-2 border-t border-[#2a2a2a]">
          <DeleteDialog
            itemType="buzz"
            onDelete={async () => {
              await deleteBuzzItemAction(item.id);
              onDelete(item.id);
              onClose();
            }}
            trigger={
              <Button size="sm" variant="destructive">
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </Button>
            }
          />
        </div>
      )}
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
      const result = await createBuzzItemAction(
        hiveId,
        content,
        type,
        mediaUrl || undefined,
      );
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
            <Icon
              className={`w-3 h-3 ${type === value ? 'text-[#FFC300]' : color}`}
            />
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
        <p className="text-sm text-red-400 bg-red-400/10 rounded-xl px-4 py-2.5">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={onDone}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={isPending || !content.trim()}
        >
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
  const [viewingItem, setViewingItem] = useState<BuzzItemWithAuthor | null>(
    null,
  );
  const [, startTransition] = useTransition();

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCreated = () => {
    setShowCreate(false);
    startTransition(async () => {
      const fresh = await getBuzzItemsAction(hiveId);
      setItems(fresh);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-white">
          {items.length} post{items.length !== 1 ? 's' : ''}
        </p>
        {!showCreate && (
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="w-3.5 h-3.5" />
            Share
          </Button>
        )}
      </div>

      {showCreate && <CreateBuzzForm hiveId={hiveId} onDone={handleCreated} />}

      {items.length === 0 && !showCreate ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-xl border-2 border-dashed border-[#FFC300]/20 bg-[#FFC300]/5 flex items-center justify-center mb-8">
            <Sparkles className="w-8 h-8 text-[#FFC300]/20" />
          </div>
          <h2 className="text-2xl font-bold text-[#FFC300] mb-2 mainFont">
            Buzz Board is empty!
          </h2>
          <p className="text-white/80 mb-8 max-w-sm">
            Share inspiration, memes, playlists, and more to get the hive
            buzzing.
          </p>
          <Button size="lg" onClick={() => setShowCreate(true)}>
            <Plus className="w-5 h-5" />
            Share your first buzz
          </Button>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
          {items.map((item) => (
            <BuzzCard
              key={item.id}
              item={item}
              onClick={() => setViewingItem(item)}
            />
          ))}
        </div>
      )}

      <Popup
        open={viewingItem !== null}
        onClose={() => setViewingItem(null)}
        title="Buzz"
        maxWidth="md"
      >
        {viewingItem && (
          <BuzzDetail
            item={viewingItem}
            currentUserId={currentUserId}
            myRole={myRole}
            onDelete={handleDelete}
            onClose={() => setViewingItem(null)}
          />
        )}
      </Popup>
    </div>
  );
}
