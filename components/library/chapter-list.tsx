'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
  type DragOverEvent,
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
  // MoreHorizontal,
  FileText,
  Loader2,
} from 'lucide-react';
import type { Chapter, Collection } from '@/lib/types/books';
import { useBookStore } from '@/lib/stores/book-store';

type Props = {
  bookId: string;
  chapters: Chapter[];
  collections: Collection[];
};

export default function ChapterList({ bookId, chapters, collections }: Props) {
  const router = useRouter();
  const {
    reorderMode,
    setReorderMode,
    reorderChapters,
    createCollection,
    assignChapterToCollection,
  } = useBookStore();

  const [localChapters, setLocalChapters] = useState(chapters);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [showColInput, setShowColInput] = useState(false);
  const [addingCol, setAddingCol] = useState(false);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const toggleCollapse = (id: string) =>
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));

  function handleAssignCollection(
    chapterId: string,
    collectionId: string | null,
  ) {
    setLocalChapters((prev) =>
      prev.map((c) => (c.id === chapterId ? { ...c, collectionId } : c)),
    );
    assignChapterToCollection(bookId, chapterId, collectionId).then(() =>
      router.refresh(),
    );
  }

  function handleDragOver(event: DragOverEvent) {
    const id = event.over?.id as string | undefined;
    const isZone = id === 'uncategorized' || (id?.startsWith('col:') ?? false);
    setDragOverId(isZone ? (id ?? null) : null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setDragOverId(null);
    if (!over || active.id === over.id) return;

    const id = over.id as string;

    if (id.startsWith('col:')) {
      handleAssignCollection(active.id as string, id.slice(4));
      return;
    }

    if (id === 'uncategorized') {
      handleAssignCollection(active.id as string, null);
      return;
    }

    const oldIndex = localChapters.findIndex((c) => c.id === active.id);
    const newIndex = localChapters.findIndex((c) => c.id === over.id);
    setLocalChapters(arrayMove(localChapters, oldIndex, newIndex));
  }

  async function handleSaveOrder() {
    setSaving(true);
    const result = await reorderChapters(
      bookId,
      localChapters.map((c) => c.id),
    );
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

  const soloChapters = localChapters.filter((c) => !c.collectionId);
  const collectionGroups = collections.map((col) => ({
    ...col,
    chapters: localChapters.filter((c) => c.collectionId === col.id),
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
                  {saving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    'Save Order'
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setReorderMode(false);
                    setLocalChapters(chapters);
                  }}
                >
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
                  onClick={() => setShowColInput((v) => !v)}
                >
                  <FolderOpen />
                  Add Collection
                </Button>
                {chapters.length > 0 && (
                  <Button asChild size="sm">
                    <Link href={`/library/${bookId}/create-chapter`}>
                      <Plus />
                      Chapter
                    </Link>
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {reorderMode && (
          <div className="mt-3 p-3 rounded-lg bg-[#FFC300]/10 border border-[#FFC300]/20">
            <p className="text-sm text-white/80 font-medium">
              Reorder Mode Active
            </p>
            <p className="text-xs text-white/60 mt-1">
              Drag and drop chapters to reorganize them. You can move chapters
              into or out of collections by dropping them on the collection
              zones.
            </p>
          </div>
        )}
        {!reorderMode && (
          <div className="flex sm:hidden items-center gap-2 mt-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setReorderMode(true)}
            >
              Reorder
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowColInput((v) => !v)}
            >
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
              onChange={(e) => setNewColName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddCollection();
              }}
              placeholder="Collection name…"
              autoFocus
              className="flex-1 rounded-xl bg-[#1e1e1e] border border-[#333] px-3 py-1.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#FFC300]/50 transition-all"
            />
            <Button
              size="sm"
              onClick={handleAddCollection}
              disabled={addingCol || !newColName.trim()}
            >
              {addingCol ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                'Add'
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setShowColInput(false);
                setNewColName('');
              }}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="divide-y divide-[#2a2a2a]">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={localChapters.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            {reorderMode && collections.length > 0 && (
              <DroppableZone
                id="uncategorized"
                label="Uncategorized"
                isOver={dragOverId === 'uncategorized'}
              />
            )}

            {soloChapters.map((chapter) => (
              <SortableChapterRow
                key={chapter.id}
                chapter={chapter}
                bookId={bookId}
                reorderMode={reorderMode}
                collections={collections}
                onAssignCollection={(colId) =>
                  handleAssignCollection(chapter.id, colId)
                }
              />
            ))}

            {collectionGroups.map((col) => (
              <div key={col.id}>
                {reorderMode ? (
                  <DroppableZone
                    id={`col:${col.id}`}
                    label={col.name}
                    isOver={dragOverId === `col:${col.id}`}
                    isCollection
                  />
                ) : (
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
                    <span className="text-sm font-semibold text-white/80">
                      {col.name}
                    </span>
                    <span className="text-xs text-white/70 ml-1">
                      {col.chapters.length} chapter
                      {col.chapters.length !== 1 ? 's' : ''}
                    </span>
                  </button>
                )}

                {(!collapsed[col.id] || reorderMode) &&
                  col.chapters.map((chapter) => (
                    <SortableChapterRow
                      key={chapter.id}
                      chapter={chapter}
                      bookId={bookId}
                      reorderMode={reorderMode}
                      indent
                      collections={collections}
                      onAssignCollection={(colId) =>
                        handleAssignCollection(chapter.id, colId)
                      }
                    />
                  ))}
              </div>
            ))}
          </SortableContext>
        </DndContext>

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

function DroppableZone({
  id,
  label,
  isOver,
  isCollection = false,
}: {
  id: string;
  label: string;
  isOver: boolean;
  isCollection?: boolean;
}) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`flex items-center gap-3 px-6 py-3 transition-all border-y ${
        isOver
          ? 'border-[#FFC300]/40 bg-[#FFC300]/10'
          : 'border-transparent bg-[#1e1e1e]'
      }`}
    >
      {isCollection ? (
        <FolderOpen
          className={`w-4 h-4 transition-colors ${isOver ? 'text-[#FFC300]' : 'text-[#FFC300]/40'}`}
        />
      ) : (
        <FileText
          className={`w-4 h-4 transition-colors ${isOver ? 'text-white/60' : 'text-white/20'}`}
        />
      )}
      <span
        className={`text-sm font-semibold transition-colors ${isOver ? 'text-white/80' : 'text-white/30'}`}
      >
        {label}
      </span>
      {isOver && (
        <span className="text-xs text-[#FFC300]/60 ml-1">
          drop to move here
        </span>
      )}
    </div>
  );
}

function SortableChapterRow({
  chapter,
  bookId,
  reorderMode,
  indent = false,
  collections,
  onAssignCollection,
}: {
  chapter: Chapter;
  bookId: string;
  reorderMode: boolean;
  indent?: boolean;
  collections: Collection[];
  onAssignCollection: (collectionId: string | null) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: chapter.id });

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showMenu) return;
    function onMouseDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [showMenu]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const currentCollection = collections.find(
    (c) => c.id === chapter.collectionId,
  );
  const otherCollections = collections.filter(
    (c) => c.id !== chapter.collectionId,
  );
  const hasMenuItems = !!chapter.collectionId || otherCollections.length > 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(reorderMode ? { ...attributes, ...listeners } : {})}
      className={`flex items-center gap-3 px-6 py-4 hover:bg-white/2 transition-colors group ${indent ? 'pl-14' : ''} ${reorderMode ? 'cursor-grab active:cursor-grabbing' : ''}`}
    >
      {reorderMode && (
        <div className="shrink-0">
          <GripVertical className="w-4 h-4 text-white/50" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">
          {chapter.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-xs text-white/70">
            {chapter.wordCount.toLocaleString()} words
          </p>
          {reorderMode && currentCollection && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FFC300]/10 text-[#FFC300]/70 border border-[#FFC300]/20">
              {currentCollection.name}
            </span>
          )}
        </div>
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
          {hasMenuItems && (
            <div className="relative" ref={menuRef}>
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 z-50 min-w-42 rounded-xl bg-[#1e1e1e] border border-[#333] shadow-xl py-1 overflow-hidden">
                  <p className="px-3 py-1.5 text-[10px] text-white/30 uppercase tracking-wider">
                    Move to
                  </p>
                  {chapter.collectionId && (
                    <button
                      onClick={() => {
                        onAssignCollection(null);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-white/50 hover:bg-white/5 hover:text-white/80 transition-colors"
                    >
                      Remove from collection
                    </button>
                  )}
                  {otherCollections.map((col) => (
                    <button
                      key={col.id}
                      onClick={() => {
                        onAssignCollection(col.id);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-white/60 hover:bg-white/5 hover:text-white/80 transition-colors flex items-center gap-2"
                    >
                      <FolderOpen className="w-3 h-3 text-[#FFC300]/50 shrink-0" />
                      {col.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
