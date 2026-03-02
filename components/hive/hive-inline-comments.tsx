'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import {
  Plus, CheckCircle2, Circle, Trash2, Loader2, MessageSquare,
  AlertCircle, BarChart3, Palette, GitBranch, AlignLeft, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getInlineCommentsAction,
  getChapterContentAction,
  createInlineCommentAction,
  resolveInlineCommentAction,
  deleteInlineCommentAction,
} from '@/lib/actions/hive-inline-comments.actions';
import type { InlineComment, AnnotationLayer, HiveRole } from '@/lib/types/hive.types';

interface HiveInlineCommentsProps {
  hiveId: string;
  chapters: { id: string; title: string; order: number }[];
  initialChapterId: string | null;
  initialComments: InlineComment[];
  initialContent: { title: string; content: string } | null;
  currentUserId: string;
  myRole: HiveRole;
}

const LAYERS: { value: AnnotationLayer; label: string; Icon: React.ElementType; color: string; bg: string }[] = [
  { value: 'GRAMMAR', label: 'Grammar', Icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20' },
  { value: 'PLOT', label: 'Plot', Icon: GitBranch, color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20' },
  { value: 'TONE', label: 'Tone', Icon: Palette, color: 'text-pink-400', bg: 'bg-pink-400/10 border-pink-400/20' },
  { value: 'CONTINUITY', label: 'Continuity', Icon: BarChart3, color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20' },
  { value: 'GENERAL', label: 'General', Icon: AlignLeft, color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20' },
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

function CommentCard({
  comment,
  currentUserId,
  myRole,
  onResolve,
  onDelete,
}: {
  comment: InlineComment;
  currentUserId: string;
  myRole: HiveRole;
  onResolve: (id: string, resolved: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const [resolving, setResolving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const conf = layerConfig(comment.layer);
  const Icon = conf.Icon;
  const isResolved = comment.status === 'RESOLVED';
  const canManage =
    comment.authorId === currentUserId || myRole === 'OWNER' || myRole === 'MODERATOR';

  const handleResolve = async () => {
    setResolving(true);
    await resolveInlineCommentAction(comment.id);
    onResolve(comment.id, !isResolved);
    setResolving(false);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this comment?')) return;
    setDeleting(true);
    await deleteInlineCommentAction(comment.id);
    onDelete(comment.id);
    setDeleting(false);
  };

  return (
    <div className={`rounded-2xl border p-4 space-y-2.5 transition-all ${
      isResolved ? 'bg-[#1a1a1a] border-[#252525] opacity-60' : 'bg-[#252525] border-[#2a2a2a]'
    }`}>
  
      <div className="flex items-center justify-between gap-2">
        <span className={`flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full border ${conf.bg} ${conf.color}`}>
          <Icon className="w-3 h-3" />
          {conf.label}
        </span>
        <div className="flex items-center gap-1.5">
          {isResolved && (
            <span className="text-[10px] text-green-400/60">Resolved</span>
          )}
          {canManage && (
            <>
              <button
                onClick={handleResolve}
                disabled={resolving}
                className={`p-1 transition-colors ${isResolved ? 'text-green-400/50 hover:text-white/50' : 'text-white/30 hover:text-green-400'}`}
                title={isResolved ? 'Reopen' : 'Mark resolved'}
              >
                {resolving
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : isResolved
                  ? <Circle className="w-3.5 h-3.5" />
                  : <CheckCircle2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-1 text-white/20 hover:text-red-400 transition-colors"
              >
                {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              </button>
            </>
          )}
        </div>
      </div>

   
      {comment.selectedText && (
        <blockquote className="border-l-2 border-[#FFC300]/30 pl-3 text-xs text-white/80 italic leading-relaxed line-clamp-3">
          &ldquo;{comment.selectedText}&rdquo;
        </blockquote>
      )}

   
      <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">
        {comment.content}
      </p>

   
      <div className="flex items-center gap-1.5 pt-0.5">
        {comment.author.imageUrl ? (
          <Image
            src={comment.author.imageUrl}
            alt={comment.author.username ?? ''}
            width={16}
            height={16}
            className="rounded-full"
          />
        ) : (
          <div className="w-4 h-4 rounded-full bg-[#FFC300]/15 flex items-center justify-center text-[#FFC300] text-[9px] font-bold">
            {(comment.author.username ?? comment.author.firstName ?? 'U')[0]?.toUpperCase()}
          </div>
        )}
        <span className="text-[12px] text-white">
          {comment.author.username ?? comment.author.firstName ?? 'User'}
          {' · '}
          {timeAgo(comment.createdAt)}
        </span>
      </div>
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
        <h4 className="text-xs font-semibold text-white">Add Comment</h4>
        <button onClick={onCancel} className="p-1 text-white/30 hover:text-white/60">
          <X className="w-4 h-4" />
        </button>
      </div>


      <div className="flex flex-wrap gap-1.5">
        {LAYERS.map(({ value, label, Icon, color, bg }) => (
          <button
            key={value}
            type="button"
            onClick={() => setLayer(value)}
            className={`flex items-center gap-1 text-sm font-medium px-2 py-0.5 rounded-full border transition-all ${
              layer === value ? `${bg} ${color}` : 'border-[#2a2a2a] text-white hover:border-white/20'
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
        placeholder="Text you&apos;re referencing (optional)…"
        maxLength={500}
        className="w-full rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-white/75 focus:outline-none focus:border-[#FFC300]/40 transition-all"
      />

   
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Your comment…"
        maxLength={2000}
        rows={3}
        className="w-full rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-white/75 focus:outline-none focus:border-[#FFC300]/40 transition-all resize-none"
      />

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      <div className="flex items-center gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleSubmit} disabled={isPending || !content.trim()}>
          {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Add
        </Button>
      </div>
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
  const [activeLayer, setActiveLayer] = useState<AnnotationLayer | 'ALL'>('ALL');
  const [showResolved, setShowResolved] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
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
      prev.map((c) => (c.id === id ? { ...c, status: resolved ? 'RESOLVED' : 'OPEN' } : c)),
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
      <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
        <MessageSquare className="w-8 h-8 text-[#FFC300]/40" />
        <p className="text-sm text-white/80">No chapters available for annotation.</p>
      </div>
    );
  }

  return (
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
            Add Comment
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

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
       
        <div className="lg:col-span-3">
          <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] overflow-hidden">
            {chapterContent ? (
              <>
                <div className="px-5 py-3 border-b border-[#2a2a2a]">
                  <h3 className="text-sm font-semibold text-white">{chapterContent.title}</h3>
                </div>
                <div
                  className="p-5 prose prose-invert prose-sm max-w-none text-white leading-relaxed max-h-150 overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: chapterContent.content || '<p class="text-white/30 italic">No content yet.</p>' }}
                />
              </>
            ) : (
              <div className="flex items-center justify-center py-16 text-white/30">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            )}
          </div>
        </div>

     
        <div className="lg:col-span-2 space-y-3">
    
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setActiveLayer('ALL')}
                className={`text-sm px-2 py-0.5 rounded-full transition-all ${
                  activeLayer === 'ALL' ? 'bg-[#FFC300]/15 text-[#FFC300]' : 'text-white hover:text-white/60'
                }`}
              >
                All ({openCount} open)
              </button>
              {LAYERS.map(({ value, label, Icon, color, bg }) => {
                const count = comments.filter((c) => c.layer === value && c.status === 'OPEN').length;
                return (
                  <button
                    key={value}
                    onClick={() => setActiveLayer(value)}
                    className={`flex items-center gap-1 text-sm px-2 py-0.5 rounded-full border transition-all border-white/20 ${
                      activeLayer === value ? `${bg} ${color}` : 'border-transparent text-white hover:text-white/60'
                    }`}
                  >
                    <Icon className="w-2.5 h-2.5" />
                    {label} {count > 0 && `(${count})`}
                  </button>
                );
              })}
            </div>
            {resolvedCount > 0 && (
              <button
                onClick={() => setShowResolved(!showResolved)}
                className="text-[10px] text-white/30 hover:text-white/50 transition-colors"
              >
                {showResolved ? 'Hide' : 'Show'} {resolvedCount} resolved
              </button>
            )}
          </div>


          <div className="space-y-2 max-h-150 overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center gap-2">
                <MessageSquare className="w-6 h-6 text-[#FFC300]/80" />
                <p className="text-sm text-white/90">
                  {comments.length === 0
                    ? 'No comments yet on this chapter.'
                    : 'No comments match the current filter.'}
                </p>
              </div>
            ) : (
              filtered.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  currentUserId={currentUserId}
                  myRole={myRole}
                  onResolve={handleResolve}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
