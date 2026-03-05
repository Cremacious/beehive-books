'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import {
  Plus,
  BookOpen,
  User,
  MapPin,
  Clock,
  Scroll,
  MoreHorizontal,
  Pencil,
  Trash2,
  Loader2,
  X,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Popup from '@/components/ui/popup';
import { RichTextEditor } from '@/components/editor/rich-text-editor';
import {
  getWikiEntriesAction,
  createWikiEntryAction,
  updateWikiEntryAction,
  deleteWikiEntryAction,
} from '@/lib/actions/hive-wiki.actions';
import type {
  WikiEntryWithAuthor,
  WikiCategory,
  HiveRole,
} from '@/lib/types/hive.types';

interface HiveWikiProps {
  hiveId: string;
  initialEntries: WikiEntryWithAuthor[];
  currentUserId: string;
  myRole: HiveRole;
}

const CATEGORIES: {
  value: WikiCategory;
  label: string;
  Icon: React.ElementType;
}[] = [
  { value: 'CHARACTER', label: 'Characters', Icon: User },
  { value: 'LOCATION', label: 'Locations', Icon: MapPin },
  { value: 'TIMELINE', label: 'Timeline', Icon: Clock },
  { value: 'LORE', label: 'Lore', Icon: Scroll },
  // { value: 'TERMINOLOGY', label: 'Terms', Icon: BookMarked },
  { value: 'OTHER', label: 'Other', Icon: MoreHorizontal },
];

const CATEGORY_COLORS: Record<WikiCategory, string> = {
  CHARACTER: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  LOCATION: 'text-green-400 bg-green-400/10 border-green-400/20',
  TIMELINE: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  LORE: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  TERMINOLOGY: 'text-pink-400 bg-pink-400/10 border-pink-400/20',
  OTHER: 'text-white/40 bg-white/5 border-white/10',
};

// const DEFAULT_COLORS = [
//   '#FFC300', '#8B5CF6', '#10B981', '#3B82F6', '#F97316', '#EC4899',
// ];

type EditorMode =
  | { mode: 'create' }
  | { mode: 'edit'; entry: WikiEntryWithAuthor };

function EntryForm({
  hiveId,
  initial,
  onDone,
  onCancel,
}: {
  hiveId: string;
  initial?: WikiEntryWithAuthor;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [content, setContent] = useState(initial?.content ?? '');
  const [category, setCategory] = useState<WikiCategory>(
    initial?.category ?? 'OTHER',
  );
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t) && tags.length < 10) {
      setTags((prev) => [...prev, t]);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) =>
    setTags((prev) => prev.filter((t) => t !== tag));

  const handleSubmit = () => {
    setError('');
    startTransition(async () => {
      const result = initial
        ? await updateWikiEntryAction(
            initial.id,
            title,
            content,
            category,
            tags,
          )
        : await createWikiEntryAction(hiveId, title, content, category, tags);
      if (!result.success) {
        setError(result.message);
        return;
      }
      onDone();
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">
          {initial ? 'Edit Entry' : 'New Wiki Entry'}
        </h3>
        <button
          onClick={onCancel}
          className="p-1 text-white hover:text-white/70 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Entry title…"
        maxLength={200}
        className="w-full rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-white/75 focus:outline-none focus:border-[#FFC300]/40 transition-all"
      />

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(({ value, label, Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setCategory(value)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
              category === value
                ? 'border-[#FFC300]/50 bg-[#FFC300]/10 text-[#FFC300]'
                : 'border-[#2a2a2a] bg-[#1e1e1e] text-white hover:border-white/20'
            }`}
          >
            <Icon className="w-3 h-3" />
            {label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-[#2a2a2a] overflow-hidden">
        <RichTextEditor content={content} onChange={setContent} editable />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="Add tag (Enter to add)…"
            className="flex-1 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-1.5 text-sm text-white placeholder-white/75 focus:outline-none focus:border-[#FFC300]/40 transition-all"
          />
          <button
            type="button"
            onClick={addTag}
            className="p-1.5 text-white/40 hover:text-white/70 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1  px-2 py-0.5 rounded-full bg-[#1e1e1e] border border-[#2a2a2a] text-yellow-500"
              >
                <Tag className="w-3 h-3" />
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-0.5 text-white hover:text-red-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-400/10 rounded-xl px-4 py-2.5">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 justify-end pt-1">
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
          disabled={isPending || !title.trim()}
        >
          {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {initial ? 'Save Changes' : 'Create Entry'}
        </Button>
      </div>
    </div>
  );
}

function EntryCard({
  entry,
  currentUserId,
  myRole,
  onEdit,
  onDelete,
  onReadMore,
}: {
  entry: WikiEntryWithAuthor;
  currentUserId: string;
  myRole: HiveRole;
  onEdit: (entry: WikiEntryWithAuthor) => void;
  onDelete: (id: string) => void;
  onReadMore: (entry: WikiEntryWithAuthor) => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const catConf = CATEGORIES.find((c) => c.value === entry.category)!;
  const CatIcon = catConf.Icon;
  const canEdit =
    entry.authorId === currentUserId ||
    myRole === 'OWNER' ||
    myRole === 'MODERATOR';

  const handleDelete = async () => {
    if (!confirm(`Delete "${entry.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    await deleteWikiEntryAction(entry.id);
    onDelete(entry.id);
    setDeleting(false);
  };

  const preview = entry.content.replace(/<[^>]+>/g, '').slice(0, 160);

  return (
    <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] p-4 space-y-3 group">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
          <span
            className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0 mt-0.5 ${CATEGORY_COLORS[entry.category]}`}
          >
            <CatIcon className="w-3 h-3" />
            {catConf.label}
          </span>
          <h3 className="text-sm font-semibold text-white leading-snug">
            {entry.title}
          </h3>
        </div>
        {canEdit && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              onClick={() => onEdit(entry)}
              className="p-1 text-white hover:text-white/70 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-1 text-white hover:text-red-400 transition-colors"
            >
              {deleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        )}
      </div>

      {entry.content && (
        <div className="space-y-1">
          {preview && (
            <p className="text-sm text-white/70 leading-relaxed line-clamp-3">
              {preview}
            </p>
          )}
          <button
            onClick={() => onReadMore(entry)}
            className="text-xs text-[#FFC300] hover:text-[#FFC300]/70 transition-colors"
          >
            Read more →
          </button>
        </div>
      )}

      {entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {entry.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded-full bg-[#1e1e1e] border border-[#2a2a2a] text-white/40"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-1.5 pt-0.5">
        {entry.author.imageUrl ? (
          <Image
            src={entry.author.imageUrl}
            alt={entry.author.username ?? 'User'}
            width={16}
            height={16}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="w-4 h-4 rounded-full bg-[#FFC300]/15 flex items-center justify-center text-[#FFC300] font-bold text-[9px]">
            {(entry.author.username ??
              entry.author.firstName ??
              'U')[0]?.toUpperCase()}
          </div>
        )}
        <span className="text-[12px] text-white/90">
          {entry.author.username ?? entry.author.firstName ?? 'User'}
          {' · '}
          {new Date(entry.updatedAt).toLocaleDateString([], {
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </div>
    </div>
  );
}

export default function HiveWiki({
  hiveId,
  initialEntries,
  currentUserId,
  myRole,
}: HiveWikiProps) {
  const [entries, setEntries] = useState<WikiEntryWithAuthor[]>(initialEntries);
  const [activeCategory, setActiveCategory] = useState<WikiCategory | 'ALL'>(
    'ALL',
  );
  const [editorMode, setEditorMode] = useState<EditorMode | null>(null);
  const [viewingEntry, setViewingEntry] = useState<WikiEntryWithAuthor | null>(
    null,
  );
  const [search, setSearch] = useState('');
  const [, startTransition] = useTransition();

  const refresh = () => {
    startTransition(async () => {
      const fresh = await getWikiEntriesAction(hiveId);
      setEntries(fresh);
    });
  };

  const filtered = entries.filter((e) => {
    const matchCat = activeCategory === 'ALL' || e.category === activeCategory;
    const matchSearch =
      !search ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.tags.some((t) => t.includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  const counts: Record<string, number> = { ALL: entries.length };
  for (const cat of CATEGORIES) {
    counts[cat.value] = entries.filter((e) => e.category === cat.value).length;
  }

  if (editorMode) {
    return (
      <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] p-5">
        <EntryForm
          hiveId={hiveId}
          initial={editorMode.mode === 'edit' ? editorMode.entry : undefined}
          onDone={() => {
            setEditorMode(null);
            refresh();
          }}
          onCancel={() => setEditorMode(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search entries…"
          className="flex-1 min-w-45 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-1.5 text-sm text-white placeholder-white/75 focus:outline-none focus:border-[#FFC300]/40 transition-all"
        />
        <Button size="sm" onClick={() => setEditorMode({ mode: 'create' })}>
          <Plus className="w-3.5 h-3.5" />
          New Entry
        </Button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setActiveCategory('ALL')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
            activeCategory === 'ALL'
              ? 'bg-[#FFC300]/15 text-[#FFC300]'
              : 'text-white/50 hover:text-white/70'
          }`}
        >
          <BookOpen className="w-3 h-3" />
          All
          <span className="text-[10px] text-white/30 ml-0.5">
            ({counts.ALL})
          </span>
        </button>

        {CATEGORIES.map(({ value, label, Icon }) => (
          <button
            key={value}
            onClick={() => setActiveCategory(value)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium transition-all ${
              activeCategory === value
                ? 'bg-[#FFC300]/15 text-[#FFC300]'
                : 'text-white/90 hover:text-white/70'
            }`}
          >
            <Icon className="w-3 h-3" />
            {label}
            {counts[value] > 0 && (
              <span className="text-[10px] text-white/90 ml-0.5">
                ({counts[value]})
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-xl border-2 border-dashed border-[#FFC300]/20 bg-[#FFC300]/5 flex items-center justify-center mb-8">
            <BookOpen className="w-8 h-8 text-[#FFC300]/20" />
          </div>
          <h2 className="text-2xl font-bold text-[#FFC300] mb-2 mainFont">
            {search || activeCategory !== 'ALL'
              ? 'No entries match your filter.'
              : 'No wiki entries yet!'}
          </h2>
          <p className="text-white/80 mb-8 max-w-sm">
            {search || activeCategory !== 'ALL'
              ? 'Try adjusting your search or category filter.'
              : 'Start building your world by creating your first wiki entry.'}
          </p>
          {!(search || activeCategory !== 'ALL') && (
            <Button size="lg" onClick={() => setEditorMode({ mode: 'create' })}>
              <Plus className="w-5 h-5" />
              Create your first entry
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              currentUserId={currentUserId}
              myRole={myRole}
              onEdit={(e) => setEditorMode({ mode: 'edit', entry: e })}
              onDelete={(id) =>
                setEntries((prev) => prev.filter((e) => e.id !== id))
              }
              onReadMore={setViewingEntry}
            />
          ))}
        </div>
      )}

      <Popup
        open={viewingEntry !== null}
        onClose={() => setViewingEntry(null)}
        title={viewingEntry?.title}
        maxWidth="xl"
      >
        {viewingEntry &&
          (() => {
            const catConf = CATEGORIES.find(
              (c) => c.value === viewingEntry.category,
            )!;
            const CatIcon = catConf.Icon;
            return (
              <div className="space-y-4">
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[viewingEntry.category]}`}
                >
                  <CatIcon className="w-3 h-3" />
                  {catConf.label}
                </span>

                <div
                  className="text-sm text-white/80 leading-relaxed prose prose-invert prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: viewingEntry.content }}
                />

                {viewingEntry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {viewingEntry.tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[#1e1e1e] border border-[#2a2a2a] text-yellow-500"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2 border-t border-[#2a2a2a]">
                  {viewingEntry.author.imageUrl ? (
                    <Image
                      src={viewingEntry.author.imageUrl}
                      alt={viewingEntry.author.username ?? 'User'}
                      width={20}
                      height={20}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-[#FFC300]/15 flex items-center justify-center text-[#FFC300] font-bold text-[10px]">
                      {(viewingEntry.author.username ??
                        viewingEntry.author.firstName ??
                        'U')[0]?.toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs text-white/50">
                    {viewingEntry.author.username ??
                      viewingEntry.author.firstName ??
                      'User'}
                    {' · '}
                    {new Date(viewingEntry.updatedAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            );
          })()}
      </Popup>
    </div>
  );
}
