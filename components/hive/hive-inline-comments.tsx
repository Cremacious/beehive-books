'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  Loader2,
  MessageSquare,
  AlertCircle,
  BarChart3,
  Palette,
  GitBranch,
  AlignLeft,
  X,
  ChevronDown,
  Check,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Popup from '@/components/ui/popup';
import { DeleteDialog } from '@/components/shared/delete-dialog';
import {
  getInlineCommentsAction,
  getChapterContentAction,
  createInlineCommentAction,
  resolveInlineCommentAction,
  deleteInlineCommentAction,
} from '@/lib/actions/hive-inline-comments.actions';
import type {
  InlineComment,
  AnnotationLayer,
  HiveRole,
} from '@/lib/types/hive.types';

interface HiveInlineCommentsProps {
  hiveId: string;
  chapters: { id: string; title: string; order: number }[];
  initialChapterId: string | null;
  initialComments: InlineComment[];
  initialContent: { title: string; content: string } | null;
  currentUserId: string;
  myRole: HiveRole;
}

const LAYERS: {
  value: AnnotationLayer;
  label: string;
  Icon: React.ElementType;
  color: string;
  bg: string;
}[] = [
  {
    value: 'GRAMMAR',
    label: 'Grammar',
    Icon: AlertCircle,
    color: 'text-red-400',
    bg: 'bg-red-400/10 border-red-400/20',
  },
  {
    value: 'PLOT',
    label: 'Plot',
    Icon: GitBranch,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10 border-purple-400/20',
  },
  {
    value: 'TONE',
    label: 'Tone',
    Icon: Palette,
    color: 'text-pink-400',
    bg: 'bg-pink-400/10 border-pink-400/20',
  },
  {
    value: 'CONTINUITY',
    label: 'Continuity',
    Icon: BarChart3,
    color: 'text-orange-400',
    bg: 'bg-orange-400/10 border-orange-400/20',
  },
  {
    value: 'GENERAL',
    label: 'General',
    Icon: AlignLeft,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10 border-blue-400/20',
  },
];

function layerConfig(layer: AnnotationLayer) {
  return LAYERS.find((l) => l.value === layer) ?? LAYERS[4];
}

function timeAgo(date: Date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function AuthorRow({ comment }: { comment: InlineComment }) {
  return (
    <div className="flex items-center gap-1.5">
      {comment.author.image ? (
        <Image
          src={comment.author.image}
          alt={comment.author.username ?? ''}
          width={14}
          height={14}
          className="rounded-full"
        />
      ) : (
        <div className="w-3.5 h-3.5 rounded-full bg-[#FFC300]/15 flex items-center justify-center text-[#FFC300] text-[8px] font-bold">
          {(comment.author.username ?? 'U')[0]?.toUpperCase()}
        </div>
      )}
      <span className="text-[11px] text-white/80">
        {comment.author.username ?? 'User'}
        {' · '}
        {timeAgo(comment.createdAt)}
      </span>
    </div>
  );
}

function AnnotationPreviewCard({
  comment,
  onClick,
}: {
  comment: InlineComment;
  onClick: () => void;
}) {
  const conf = layerConfig(comment.layer);
  const Icon = conf.Icon;
  const isResolved = comment.status === 'RESOLVED';

  return (
    <button
      onClick={onClick}
      className={`hover:cursor-pointer w-full text-left rounded-xl border p-3 space-y-2 transition-all group ${
        isResolved
          ? 'bg-[#1a1a1a] border-[#252525] opacity-60 hover:opacity-80 hover:border-[#2a2a2a]'
          : 'bg-[#252525] border-[#2a2a2a] hover:bg-[#2d2d2d] hover:border-white/15'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${conf.bg} ${conf.color}`}
        >
          <Icon className="w-2.5 h-2.5" />
          {conf.label}
        </span>
        {isResolved ? (
          <span className="flex items-center gap-1 text-[10px] text-green-400/70">
            <CheckCircle2 className="w-3 h-3" />
            Resolved
          </span>
        ) : (
          <span className="text-xs font-bold text-yellow-500 group-hover:text-yellow-600 transition-colors">
            Click To View
          </span>
        )}
      </div>

      {comment.selectedText && (
        <p className="border-l-2 border-[#FFC300]/30 pl-2 text-[11px] text-white/80 italic leading-relaxed line-clamp-2">
          &ldquo;{comment.selectedText}&rdquo;
        </p>
      )}

      <p className="text-xs text-white/80 line-clamp-3 leading-relaxed">
        {comment.content}
      </p>

      <AuthorRow comment={comment} />
    </button>
  );
}

function AnnotationDetail({
  comment,
  currentUserId,
  myRole,
  onResolve,
  onDelete,
  onClose,
}: {
  comment: InlineComment;
  currentUserId: string;
  myRole: HiveRole;
  onResolve: (id: string, resolved: boolean) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  const [resolving, setResolving] = useState(false);
  const conf = layerConfig(comment.layer);
  const Icon = conf.Icon;
  const isResolved = comment.status === 'RESOLVED';
  const canManage =
    comment.authorId === currentUserId ||
    myRole === 'OWNER' ||
    myRole === 'MODERATOR';

  const handleResolve = async () => {
    setResolving(true);
    await resolveInlineCommentAction(comment.id);
    onResolve(comment.id, !isResolved);
    setResolving(false);
    onClose();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${conf.bg} ${conf.color}`}
        >
          <Icon className="w-3.5 h-3.5" />
          {conf.label}
        </span>
        {isResolved && (
          <span className="flex items-center gap-1 text-xs text-green-400/80 bg-green-400/10 border border-green-400/20 px-2.5 py-1 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Resolved
          </span>
        )}
      </div>

      {comment.selectedText && (
        <blockquote className="border-l-2 border-[#FFC300]/40 pl-4 py-2 bg-[#FFC300]/5 rounded-r-lg">
          <p className="text-sm text-white/80 italic leading-relaxed">
            &ldquo;{comment.selectedText}&rdquo;
          </p>
        </blockquote>
      )}

      <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">
        {comment.content}
      </p>

      <div className="flex items-center gap-2 pt-2 border-t border-[#2a2a2a]">
        {comment.author.image ? (
          <Image
            src={comment.author.image}
            alt={comment.author.username ?? ''}
            width={20}
            height={20}
            className="rounded-full"
          />
        ) : (
          <div className="w-5 h-5 rounded-full bg-[#FFC300]/15 flex items-center justify-center text-[#FFC300] text-[10px] font-bold">
            {(comment.author.username ?? 'U')[0]?.toUpperCase()}
          </div>
        )}
        <span className="text-xs text-white/80">
          {comment.author.username ?? 'User'}
          {' · '}
          {timeAgo(comment.createdAt)}
        </span>
      </div>

      {canManage && (
        <div className="flex items-center gap-2 pt-1">
          <Button
            size="sm"
            onClick={handleResolve}
            disabled={resolving}
            variant={isResolved ? 'outline' : 'default'}
          >
            {resolving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : isResolved ? (
              <Circle className="w-3.5 h-3.5" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5" />
            )}
            {isResolved ? 'Reopen' : 'Mark Resolved'}
          </Button>
          <DeleteDialog
            itemType="annotation"
            onDelete={async () => {
              await deleteInlineCommentAction(comment.id);
              onDelete(comment.id);
              onClose();
            }}
            trigger={
              <Button size="sm" variant="destructive" className="ml-auto">
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

function AddCommentForm({
  hiveId,
  chapterId,
  onAdded,
  onCancel,
}: {
  hiveId: string;
  chapterId: string;
  onAdded: (comment: InlineComment) => void;
  onCancel: () => void;
}) {
  const [selectedText, setSelectedText] = useState('');
  const [content, setContent] = useState('');
  const [layer, setLayer] = useState<AnnotationLayer>('GENERAL');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    setError('');
    startTransition(async () => {
      const result = await createInlineCommentAction(
        hiveId,
        chapterId,
        selectedText,
        0,
        selectedText.length,
        content,
        layer,
      );
      if (!result.success) {
        setError(result.message);
        return;
      }

      const fresh = await getInlineCommentsAction(hiveId, chapterId);
      const created = fresh.find((c) => c.id === result.commentId);
      if (created) onAdded(created);
    });
  };

  return (
    <div className="rounded-2xl bg-[#252525] border border-[#FFC300]/20 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-white">Add Annotation</h4>
        <button
          onClick={onCancel}
          className="p-1 text-white/80 hover:text-white/80"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {LAYERS.map(({ value, label, Icon, color, bg }) => (
          <button
            key={value}
            type="button"
            onClick={() => setLayer(value)}
            className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border transition-all ${
              layer === value
                ? `${bg} ${color}`
                : 'border-[#2a2a2a] text-white/80 hover:text-white hover:border-white/20'
            }`}
          >
            <Icon className="w-3 h-3" />
            {label}
          </button>
        ))}
      </div>

      <input
        value={selectedText}
        onChange={(e) => setSelectedText(e.target.value)}
        placeholder="Text you're referencing (optional)…"
        maxLength={500}
        className="w-full rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFC300]/40 transition-all"
      />

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Your annotation…"
        maxLength={2000}
        rows={3}
        className="w-full rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFC300]/40 transition-all resize-none"
      />

      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="flex items-center gap-2 justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
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
          Add
        </Button>
      </div>
    </div>
  );
}

function LayerFilterDropdown({
  activeLayer,
  setActiveLayer,
  showResolved,
  setShowResolved,
  comments,
  openCount,
  resolvedCount,
}: {
  activeLayer: AnnotationLayer | 'ALL';
  setActiveLayer: (layer: AnnotationLayer | 'ALL') => void;
  showResolved: boolean;
  setShowResolved: (v: boolean) => void;
  comments: InlineComment[];
  openCount: number;
  resolvedCount: number;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const currentConf = activeLayer === 'ALL' ? null : layerConfig(activeLayer);
  const CurrentIcon = currentConf?.Icon ?? SlidersHorizontal;
  const currentColor = currentConf ? currentConf.color : 'text-white/80';
  const currentLabel = currentConf ? currentConf.label : 'All';
  const currentCount =
    activeLayer === 'ALL'
      ? openCount
      : comments.filter((c) => c.layer === activeLayer && c.status === 'OPEN')
          .length;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-[#252525] border border-[#2a2a2a] text-sm font-medium text-white"
      >
        <span className="flex items-center gap-2">
          <CurrentIcon className={`w-4 h-4 ${currentColor}`} />
          <span>{currentLabel}</span>
          {currentCount > 0 && (
            <span className="text-xs text-white/80">({currentCount} open)</span>
          )}
          {showResolved && resolvedCount > 0 && (
            <span className="text-xs text-green-400/60">
              +{resolvedCount} resolved
            </span>
          )}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-white/80 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-xl bg-[#252525] border border-[#2a2a2a] shadow-xl overflow-hidden">
          <button
            onClick={() => {
              setActiveLayer('ALL');
              setOpen(false);
            }}
            className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-sm font-medium transition-colors border-b border-[#2a2a2a] ${
              activeLayer === 'ALL'
                ? 'text-[#FFC300] bg-[#FFC300]/8'
                : 'text-white hover:bg-white/5'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <SlidersHorizontal
                className={`w-4 h-4 ${activeLayer === 'ALL' ? 'text-[#FFC300]' : 'text-white/80'}`}
              />
              <span>All</span>
              {openCount > 0 && (
                <span
                  className={`text-xs ${activeLayer === 'ALL' ? 'text-[#FFC300]/60' : 'text-white/80'}`}
                >
                  {openCount} open
                </span>
              )}
            </span>
            {activeLayer === 'ALL' && (
              <Check className="w-3.5 h-3.5 text-[#FFC300]" />
            )}
          </button>

          {LAYERS.map(({ value, label, Icon, color }) => {
            const count = comments.filter(
              (c) => c.layer === value && c.status === 'OPEN',
            ).length;
            const isActive = activeLayer === value;
            return (
              <button
                key={value}
                onClick={() => {
                  setActiveLayer(value);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-sm font-medium transition-colors border-b border-[#2a2a2a] ${
                  isActive
                    ? 'text-[#FFC300] bg-[#FFC300]/8'
                    : 'text-white hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${isActive ? 'text-[#FFC300]' : color}`}
                  />
                  <span>{label}</span>
                  {count > 0 && (
                    <span
                      className={`text-xs ${isActive ? 'text-[#FFC300]/60' : 'text-white/80'}`}
                    >
                      {count}
                    </span>
                  )}
                </span>
                {isActive && <Check className="w-3.5 h-3.5 text-[#FFC300]" />}
              </button>
            );
          })}

          {resolvedCount > 0 && (
            <button
              onClick={() => setShowResolved(!showResolved)}
              className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-sm font-medium transition-colors border-t border-[#2a2a2a] ${
                showResolved
                  ? 'text-green-400 bg-green-400/8'
                  : 'text-white/80 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <CheckCircle2
                  className={`w-4 h-4 ${showResolved ? 'text-green-400' : 'text-white/80'}`}
                />
                <span>{showResolved ? 'Hide' : 'Show'} Resolved</span>
                <span
                  className={`text-xs ${showResolved ? 'text-green-400/60' : 'text-white/80'}`}
                >
                  {resolvedCount}
                </span>
              </span>
              {showResolved && <Check className="w-3.5 h-3.5 text-green-400" />}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function HiveInlineComments({
  hiveId,
  chapters,
  initialChapterId,
  initialComments,
  initialContent,
  currentUserId,
  myRole,
}: HiveInlineCommentsProps) {
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(
    initialChapterId ?? chapters[0]?.id ?? null,
  );
  const [comments, setComments] = useState<InlineComment[]>(initialComments);
  const [chapterContent, setChapterContent] = useState(initialContent);
  const [activeLayer, setActiveLayer] = useState<AnnotationLayer | 'ALL'>(
    'ALL',
  );
  const [showResolved, setShowResolved] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewingComment, setViewingComment] = useState<InlineComment | null>(
    null,
  );
  const [, startTransition] = useTransition();

  const loadChapter = (chapterId: string) => {
    setSelectedChapterId(chapterId);
    setComments([]);
    setChapterContent(null);
    startTransition(async () => {
      const [freshComments, content] = await Promise.all([
        getInlineCommentsAction(hiveId, chapterId),
        getChapterContentAction(hiveId, chapterId),
      ]);
      setComments(freshComments);
      setChapterContent(content);
    });
  };

  const handleResolve = (id: string, resolved: boolean) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: resolved ? 'RESOLVED' : 'OPEN' } : c,
      ),
    );

    setViewingComment((prev) =>
      prev?.id === id
        ? { ...prev, status: resolved ? 'RESOLVED' : 'OPEN' }
        : prev,
    );
  };

  const handleDelete = (id: string) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
  };

  const handleAdded = (comment: InlineComment) => {
    setComments((prev) => [comment, ...prev]);
    setShowAddForm(false);
  };

  const filtered = comments.filter((c) => {
    const layerMatch = activeLayer === 'ALL' || c.layer === activeLayer;
    const resolvedMatch = showResolved || c.status === 'OPEN';
    return layerMatch && resolvedMatch;
  });

  const openCount = comments.filter((c) => c.status === 'OPEN').length;
  const resolvedCount = comments.filter((c) => c.status === 'RESOLVED').length;

  if (chapters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-xl border-2 border-dashed border-[#FFC300]/20 bg-[#FFC300]/5 flex items-center justify-center mb-8">
          <MessageSquare className="w-8 h-8 text-[#FFC300]/20" />
        </div>
        <h2 className="text-2xl font-bold text-[#FFC300] mb-2 mainFont">
          No chapters available!
        </h2>
        <p className="text-white/80 mb-8 max-w-sm">
          Chapters need to be written before annotations can be added.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={selectedChapterId ?? ''}
            onChange={(e) => e.target.value && loadChapter(e.target.value)}
            className="flex-1 min-w-50 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFC300]/40 transition-all"
          >
            {chapters.map((ch) => (
              <option key={ch.id} value={ch.id}>
                {String(ch.order + 1).padStart(2, '0')}. {ch.title}
              </option>
            ))}
          </select>
          {!showAddForm && selectedChapterId && (
            <Button size="sm" onClick={() => setShowAddForm(true)}>
              <Plus className="w-3.5 h-3.5" />
              Add Annotation
            </Button>
          )}
        </div>

        {showAddForm && selectedChapterId && (
          <AddCommentForm
            hiveId={hiveId}
            chapterId={selectedChapterId}
            onAdded={handleAdded}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        <div className="xl:hidden space-y-3">
          <LayerFilterDropdown
            activeLayer={activeLayer}
            setActiveLayer={setActiveLayer}
            showResolved={showResolved}
            setShowResolved={setShowResolved}
            comments={comments}
            openCount={openCount}
            resolvedCount={resolvedCount}
          />
          <div className="space-y-2">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center gap-2">
                <MessageSquare className="w-6 h-6 text-[#FFC300]/40" />
                <p className="text-sm text-white/80">
                  {comments.length === 0
                    ? 'No annotations on this chapter yet.'
                    : 'No annotations match the current filter.'}
                </p>
              </div>
            ) : (
              filtered.map((comment) => (
                <AnnotationPreviewCard
                  key={comment.id}
                  comment={comment}
                  onClick={() => setViewingComment(comment)}
                />
              ))
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          <div className="xl:col-span-3">
            <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] overflow-hidden">
              {chapterContent ? (
                <>
                  <div className="px-5 py-3 border-b border-[#2a2a2a]">
                    <h3 className="text-sm font-semibold text-white">
                      {chapterContent.title}
                    </h3>
                  </div>
                  <div
                    className="p-5 prose prose-invert prose-sm max-w-none text-white leading-relaxed max-h-150 overflow-y-auto"
                    dangerouslySetInnerHTML={{
                      __html:
                        chapterContent.content ||
                        '<p class="text-white/80 italic">No content yet.</p>',
                    }}
                  />
                </>
              ) : (
                <div className="flex items-center justify-center py-16 text-white/80">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              )}
            </div>
          </div>

          <div className="xl:hidden border-t border-[#2a2a2a] my-2" />
          <div className="hidden xl:block xl:col-span-2 space-y-3">
            <LayerFilterDropdown
              activeLayer={activeLayer}
              setActiveLayer={setActiveLayer}
              showResolved={showResolved}
              setShowResolved={setShowResolved}
              comments={comments}
              openCount={openCount}
              resolvedCount={resolvedCount}
            />
            <div className="space-y-2 max-h-150 overflow-y-auto pr-1">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-center gap-2">
                  <MessageSquare className="w-6 h-6 text-[#FFC300]/40" />
                  <p className="text-sm text-white/80">
                    {comments.length === 0
                      ? 'No annotations on this chapter yet.'
                      : 'No annotations match the current filter.'}
                  </p>
                </div>
              ) : (
                filtered.map((comment) => (
                  <AnnotationPreviewCard
                    key={comment.id}
                    comment={comment}
                    onClick={() => setViewingComment(comment)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <Popup
        open={viewingComment !== null}
        onClose={() => setViewingComment(null)}
        title="Annotation"
        maxWidth="md"
      >
        {viewingComment && (
          <AnnotationDetail
            comment={viewingComment}
            currentUserId={currentUserId}
            myRole={myRole}
            onResolve={handleResolve}
            onDelete={handleDelete}
            onClose={() => setViewingComment(null)}
          />
        )}
      </Popup>
    </>
  );
}
