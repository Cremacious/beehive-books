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
  Type,
  GitBranch,
  Package,
  Landmark,
  Globe,
  MessageSquare,
  Leaf,
  Layers,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Popup from '@/components/ui/popup';
import { RichTextEditor } from '@/components/editor/rich-text-editor';
import { DeleteDialog } from '@/components/shared/delete-dialog';
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

const WIKI_TEMPLATES: Partial<Record<WikiCategory, string>> = {
  CHARACTER: `<h2>Overview</h2><p></p><h2>Appearance</h2><p></p><h2>Personality</h2><p></p><h2>Backstory</h2><p></p><h2>Relationships</h2><p></p><h2>Notes</h2><p></p>`,
  LOCATION: `<h2>Description</h2><p></p><h2>Geography</h2><p></p><h2>History</h2><p></p><h2>Notable Residents</h2><p></p><h2>Notes</h2><p></p>`,
  FACTION: `<h2>Purpose</h2><p></p><h2>Members</h2><p></p><h2>Allegiances</h2><p></p><h2>History</h2><p></p><h2>Notes</h2><p></p>`,
  TIMELINE: `<h2>Date / Period</h2><p></p><h2>Description</h2><p></p><h2>Participants</h2><p></p><h2>Consequences</h2><p></p><h2>Notes</h2><p></p>`,
  LORE: `<h2>Overview</h2><p></p><h2>Origins</h2><p></p><h2>Significance</h2><p></p><h2>Notes</h2><p></p>`,
  ARTIFACT: `<h2>Description</h2><p></p><h2>Origin</h2><p></p><h2>Abilities / Properties</h2><p></p><h2>Current Location</h2><p></p><h2>Notes</h2><p></p>`,
  BIOLOGY: `<h2>Overview</h2><p></p><h2>Appearance</h2><p></p><h2>Habitat</h2><p></p><h2>Behavior</h2><p></p><h2>Notes</h2><p></p>`,
  CULTURE: `<h2>Overview</h2><p></p><h2>Traditions</h2><p></p><h2>Values</h2><p></p><h2>Notes</h2><p></p>`,
  PLOT: `<h2>Summary</h2><p></p><h2>Key Beats</h2><p></p><h2>Characters Involved</h2><p></p><h2>Resolution</h2><p></p><h2>Notes</h2><p></p>`,
  THEME: `<h2>Overview</h2><p></p><h2>How It Appears</h2><p></p><h2>Key Moments</h2><p></p><h2>Notes</h2><p></p>`,
};
// LANGUAGE, ECONOMY, TERMINOLOGY, OTHER → no template (free-form)

const CATEGORIES: {
  value: WikiCategory;
  label: string;
  Icon: React.ElementType;
  tooltip: string;
}[] = [
  { value: 'CHARACTER', label: 'Characters', Icon: User, tooltip: 'People, protagonists, antagonists, and supporting cast' },
  { value: 'LOCATION', label: 'Locations', Icon: MapPin, tooltip: 'Places, maps, settings, and geography' },
  { value: 'TIMELINE', label: 'Timeline', Icon: Clock, tooltip: 'Chronological events, dates, and historical context' },
  { value: 'LORE', label: 'Lore', Icon: Scroll, tooltip: 'World history, myths, legends, and backstory' },
  { value: 'PLOT', label: 'Plot', Icon: GitBranch, tooltip: 'Story arcs, act structures, subplots, and narrative beats' },
  { value: 'ARTIFACT', label: 'Artifacts', Icon: Package, tooltip: 'Important objects, relics, weapons, and tools with plot significance' },
  { value: 'FACTION', label: 'Factions', Icon: Landmark, tooltip: 'Governments, organizations, wars, and power structures' },
  { value: 'CULTURE', label: 'Culture', Icon: Globe, tooltip: 'Rituals, holidays, societal norms, traditions, and taboos' },
  { value: 'LANGUAGE', label: 'Languages', Icon: MessageSquare, tooltip: 'Fictional languages, unique slang, and dialects' },
  { value: 'BIOLOGY', label: 'Biology', Icon: Leaf, tooltip: 'Races, creatures, species, traits, and habitats' },
  { value: 'THEME', label: 'Themes', Icon: Layers, tooltip: 'Recurring ideas, symbols, and philosophical elements' },
  { value: 'ECONOMY', label: 'Economy', Icon: TrendingUp, tooltip: 'Wealth, commerce, resources, and currency systems' },
  { value: 'TERMINOLOGY', label: 'Terminology', Icon: Type, tooltip: 'Glossary of unique terms, jargon, and concepts' },
  { value: 'OTHER', label: 'Other', Icon: MoreHorizontal, tooltip: 'Anything that doesn\'t fit another category' },
];

const CATEGORY_COLORS: Record<WikiCategory, string> = {
  CHARACTER: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  LOCATION: 'text-green-400 bg-green-400/10 border-green-400/20',
  TIMELINE: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  LORE: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  PLOT: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  ARTIFACT: 'text-teal-400 bg-teal-400/10 border-teal-400/20',
  FACTION: 'text-red-400 bg-red-400/10 border-red-400/20',
  CULTURE: 'text-violet-400 bg-violet-400/10 border-violet-400/20',
  LANGUAGE: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
  BIOLOGY: 'text-lime-400 bg-lime-400/10 border-lime-400/20',
  THEME: 'text-sky-400 bg-sky-400/10 border-sky-400/20',
  ECONOMY: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  TERMINOLOGY: 'text-pink-400 bg-pink-400/10 border-pink-400/20',
  OTHER: 'text-white/80 bg-white/5 border-white/10',
};


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
          className="p-1 text-white hover:text-white/80 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Entry title…"
        maxLength={200}
        className="w-full rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFC300]/40 transition-all"
      />

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(({ value, label, Icon, tooltip }) => (
          <button
            key={value}
            type="button"
            title={tooltip}
            onClick={() => {
              setCategory(value);
              if (!initial && !content.trim()) {
                const template = WIKI_TEMPLATES[value];
                if (template) setContent(template);
              }
            }}
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

      {!initial && (
        <p className="text-xs text-white/80">
          Select a category to load a starter template. You can edit or remove any section.
        </p>
      )}

      <div className="rounded-2xl border border-[#2a2a2a] overflow-hidden">
        <RichTextEditor key={content === '' ? 'empty' : category} content={content} onChange={setContent} editable />
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
            className="flex-1 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-1.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFC300]/40 transition-all"
          />
          <button
            type="button"
            onClick={addTag}
            className="p-1.5 text-white/80 hover:text-white/80 transition-colors"
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
  const catConf = CATEGORIES.find((c) => c.value === entry.category) ?? CATEGORIES[CATEGORIES.length - 1];
  const CatIcon = catConf.Icon;
  const canEdit =
    entry.authorId === currentUserId ||
    myRole === 'OWNER' ||
    myRole === 'MODERATOR';

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
              className="p-1 text-white hover:text-white/80 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <DeleteDialog
              itemType="entry"
              itemName={entry.title}
              onDelete={async () => {
                await deleteWikiEntryAction(entry.id);
                onDelete(entry.id);
              }}
              trigger={
                <button className="p-1 text-white hover:text-red-400 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              }
            />
          </div>
        )}
      </div>

      {entry.content && (
        <div className="space-y-1">
          {preview && (
            <p className="text-sm text-white/80 leading-relaxed line-clamp-3">
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
              className="text-[10px] px-2 py-0.5 rounded-full bg-[#1e1e1e] border border-[#2a2a2a] text-white/80"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-1.5 pt-0.5">
        {entry.author.image ? (
          <Image
            src={entry.author.image}
            alt={entry.author.username ?? 'User'}
            width={16}
            height={16}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="w-4 h-4 rounded-full bg-[#FFC300]/15 flex items-center justify-center text-[#FFC300] font-bold text-[9px]">
            {(entry.author.username ?? 'U')[0]?.toUpperCase()}
          </div>
        )}
        <span className="text-[12px] text-white/90">
          {entry.author.username ?? 'User'}
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
          className="flex-1 min-w-45 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-1.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFC300]/40 transition-all"
        />
        <Button size="sm" onClick={() => setEditorMode({ mode: 'create' })}>
          <Plus className="w-3.5 h-3.5" />
          New Entry
        </Button>
      </div>

      <div className="relative">
        {(() => {
          const selected = activeCategory === 'ALL'
            ? null
            : CATEGORIES.find((c) => c.value === activeCategory);
          const SelectedIcon = selected?.Icon ?? BookOpen;
          return (
            <>
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                <SelectedIcon className="w-3.5 h-3.5 text-[#FFC300]" />
              </div>
              <select
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value as WikiCategory | 'ALL')}
                className="w-full appearance-none pl-8 pr-8 py-2 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] text-sm font-medium text-white focus:outline-none focus:border-[#FFC300]/40 cursor-pointer transition-colors"
              >
                <option value="ALL" className="bg-[#1e1e1e]">
                  All Categories ({counts.ALL})
                </option>
                {CATEGORIES.map(({ value, label }) => (
                  <option key={value} value={value} className="bg-[#1e1e1e]">
                    {label}{counts[value] > 0 ? ` (${counts[value]})` : ''}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <svg className="w-3.5 h-3.5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </>
          );
        })()}
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
            ) ?? CATEGORIES[CATEGORIES.length - 1];
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
                  {viewingEntry.author.image ? (
                    <Image
                      src={viewingEntry.author.image}
                      alt={viewingEntry.author.username ?? 'User'}
                      width={20}
                      height={20}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-[#FFC300]/15 flex items-center justify-center text-[#FFC300] font-bold text-[10px]">
                      {(viewingEntry.author.username ?? 'U')[0]?.toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs text-white/80">
                    {viewingEntry.author.username ?? 'User'}
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
