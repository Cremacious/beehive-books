'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import {
  GripVertical,
  Plus,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  MoreHorizontal,
  FileText,
  Loader2,
} from 'lucide-react';
import type { Chapter, Collection } from '@/lib/types/books';
import { useBookStore } from '@/lib/stores/book-store';

type Props = {
  bookId:      string;
  chapters:    Chapter[];
  collections: Collection[];
};

export default function ChapterList({ bookId, chapters, collections }: Props) {
  const router = useRouter();
  const { reorderMode, setReorderMode, reorderChapters, createCollection } = useBookStore();

  const [localChapters, setLocalChapters] = useState(chapters);
  const [collapsed, setCollapsed]         = useState<Record<string, boolean>>({});
  const [saving, setSaving]               = useState(false);
  const [newColName, setNewColName]       = useState('');
  const [showColInput, setShowColInput]   = useState(false);
  const [addingCol, setAddingCol]         = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const toggleCollapse = (id: string) =>
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = localChapters.findIndex(c => c.id === active.id);
    const newIndex = localChapters.findIndex(c => c.id === over.id);
    setLocalChapters(arrayMove(localChapters, oldIndex, newIndex));
  }

  async function handleSaveOrder() {
    setSaving(true);
    const result = await reorderChapters(bookId, localChapters.map(c => c.id));
    setSaving(false);
    if (result.success) {
      setReorderMode(false);
      router.refresh();
    }
  }

  async function handleAddCollection() {
    if (!newColName.trim()) return;
    setAddingCol(true);
    const result = await createCollection(bookId, newColName.trim());
    setAddingCol(false);
    if (result.success) {
      setNewColName('');
      setShowColInput(false);
      router.refresh();
    }
  }

  const soloChapters = localChapters.filter(c => !c.collectionId);
  const collectionChapters = collections.map(col => ({
    ...col,
    chapters: localChapters.filter(c => c.collectionId === col.id),
  }));

  return (
    <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] shadow-xl">
      <div className="px-4 py-4 border-b border-[#2a2a2a] sm:px-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Chapters</h2>
          <div className="flex items-center gap-2">
            {reorderMode ? (
              <>
                <Button size="sm" onClick={handleSaveOrder} disabled={saving}>
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Order'}
                </Button>
                <Button size="sm" variant="outline" onClick={() => { setReorderMode(false); setLocalChapters(chapters); }}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="hidden sm:flex"
                  onClick={() => setReorderMode(true)}
                >
                  Reorder
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="hidden sm:flex"
                  onClick={() => setShowColInput(v => !v)}
                >
                  <FolderOpen />
                  Add Collection
                </Button>
                <Button asChild size="sm">
                  <Link href={`/library/${bookId}/create-chapter`}>
                    <Plus />
                    Chapter
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>


        {!reorderMode && (
          <div className="flex sm:hidden items-center gap-2 mt-3">
            <Button size="sm" variant="outline" onClick={() => setReorderMode(true)}>
              Reorder
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowColInput(v => !v)}>
              <FolderOpen />
              Collection
            </Button>
          </div>
        )}

      
        {showColInput && (
          <div className="flex items-center gap-2 mt-3">
            <input
              type="text"
              value={newColName}
              onChange={e => setNewColName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddCollection(); }}
              placeholder="Collection name…"
              autoFocus
              className="flex-1 rounded-xl bg-[#1e1e1e] border border-[#333] px-3 py-1.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#FFC300]/50 transition-all"
            />
            <Button size="sm" onClick={handleAddCollection} disabled={addingCol || !newColName.trim()}>
              {addingCol ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Add'}
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setShowColInput(false); setNewColName(''); }}>
              Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="divide-y divide-[#2a2a2a]">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={soloChapters.map(c => c.id)} strategy={verticalListSortingStrategy}>
            {soloChapters.map(chapter => (
              <SortableChapterRow
                key={chapter.id}
                chapter={chapter}
                bookId={bookId}
                reorderMode={reorderMode}
              />
            ))}
          </SortableContext>
        </DndContext>

        {collectionChapters.map(col => (
          <div key={col.id}>
            <button
              onClick={() => toggleCollapse(col.id)}
              className="w-full flex items-center gap-3 px-6 py-3.5 bg-[#1e1e1e] hover:bg-[#1c1c1c] transition-colors text-left"
            >
              {collapsed[col.id] ? (
                <ChevronRight className="w-4 h-4 text-[#FFC300]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#FFC300]" />
              )}
              <FolderOpen className="w-4 h-4 text-[#FFC300]/70" />
              <span className="text-sm font-semibold text-white/80">{col.name}</span>
              <span className="text-xs text-white/70 ml-1">
                {col.chapters.length} chapter{col.chapters.length !== 1 ? 's' : ''}
              </span>
            </button>

            {!collapsed[col.id] &&
              col.chapters.map(chapter => (
                <SortableChapterRow
                  key={chapter.id}
                  chapter={chapter}
                  bookId={bookId}
                  reorderMode={reorderMode}
                  indent
                />
              ))}
          </div>
        ))}

        {chapters.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center">
            <FileText className="w-10 h-10 text-white/10 mb-3" />
            <p className="text-sm text-white/35 mb-4">No chapters yet</p>
            <Button asChild>
              <Link href={`/library/${bookId}/create-chapter`}>
                <Plus />
                Add first chapter
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function SortableChapterRow({
  chapter,
  bookId,
  reorderMode,
  indent = false,
}: {
  chapter:     Chapter;
  bookId:      string;
  reorderMode: boolean;
  indent?:     boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: chapter.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 px-6 py-4 hover:bg-white/2 transition-colors group ${indent ? 'pl-14' : ''}`}
    >
      {reorderMode && (
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing touch-none shrink-0"
          type="button"
        >
          <GripVertical className="w-4 h-4 text-white/50" />
        </button>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">
          {chapter.title}
        </p>
        <p className="text-xs text-white/70 mt-0.5">
          {chapter.wordCount.toLocaleString()} words
        </p>
      </div>

      {!reorderMode && (
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/library/${bookId}/${chapter.id}`}
            className="px-3 py-1.5 rounded-lg text-xs text-white border border-[#2e2e2e] hover:border-[#FFC300]/30 hover:text-[#FFC300] transition-all"
          >
            Read
          </Link>
          <Link
            href={`/library/${bookId}/${chapter.id}/edit`}
            className="px-3 py-1.5 rounded-lg text-xs text-white border border-[#2e2e2e] hover:border-[#FFC300]/30 hover:text-[#FFC300] transition-all"
          >
            Edit
          </Link>
          <button className="p-1.5 rounded-lg text-white hover:text-white/60 hover:bg-white/5 transition-all">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
