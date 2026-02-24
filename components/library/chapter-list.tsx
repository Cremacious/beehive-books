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
  MoreHorizontal,
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
    reorderCollections,
    createCollection,
    assignChapterToCollection,
  } = useBookStore();

  const [localChapters, setLocalChapters] = useState(chapters);
  const [localCollections, setLocalCollections] = useState(collections);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [showColInput, setShowColInput] = useState(false);
  const [addingCol, setAddingCol] = useState(false);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
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
    const { active, over } = event;
    const overId = over?.id as string | undefined;
    const activeIsChapter = localChapters.some((c) => c.id === active.id);
    const overIsCollection = overId
      ? localCollections.some((c) => c.id === overId)
      : false;
    const overIsUncategorized = overId === 'uncategorized';
    if (activeIsChapter && (overIsCollection || overIsUncategorized)) {
      setDragOverId(overId ?? null);
    } else {
      setDragOverId(null);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setDragOverId(null);
    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (localCollections.some((c) => c.id === activeId)) {
      const oldIndex = localCollections.findIndex((c) => c.id === activeId);
      const newIndex = localCollections.findIndex((c) => c.id === overId);
      if (oldIndex !== -1 && newIndex !== -1) {
        setLocalCollections(arrayMove(localCollections, oldIndex, newIndex));
      }
      return;
    }

    const overIsCollection = localCollections.some((c) => c.id === overId);
    const overIsUncategorized = overId === 'uncategorized';

    if (overIsCollection) {
      handleAssignCollection(activeId, overId);
      return;
    }
    if (overIsUncategorized) {
      handleAssignCollection(activeId, null);
      return;
    }

    const oldIndex = localChapters.findIndex((c) => c.id === activeId);
    const newIndex = localChapters.findIndex((c) => c.id === overId);
    setLocalChapters(arrayMove(localChapters, oldIndex, newIndex));
  }

  async function handleSaveOrder() {
    setSaving(true);
    const [chapterResult, collectionResult] = await Promise.all([
      reorderChapters(
        bookId,
        localChapters.map((c) => c.id),
      ),
      reorderCollections(
        bookId,
        localCollections.map((c) => c.id),
      ),
    ]);
    setSaving(false);
    if (chapterResult.success && collectionResult.success) {
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
  const collectionGroups = localCollections.map((col) => ({
    ...col,
    chapters: localChapters.filter((c) => c.collectionId === col.id),
  }));

  return (
    <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] shadow-xl">
      {/* Header */}
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
                    setLocalCollections(collections);
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
            <p className="text-sm text-white leading-relaxed">
              Drag chapters and collections into your preferred order. Drop a
              chapter onto a collection header to move it into that collection,
              or onto Uncategorized to remove it from a collection.
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
              className="flex-1 rounded-xl bg-[#1e1e1e] border border-[#333] px-3 py-1.5 text-sm text-white placeholder-white/50 focus:outline-none focus:border-[#FFC300]/50 transition-all"
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
            items={localCollections.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            {reorderMode && localCollections.length > 0 && (
              <UncategorizedZone isOver={dragOverId === 'uncategorized'} />
            )}

            <SortableContext
              items={soloChapters.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              {soloChapters.map((chapter) => (
                <SortableChapterRow
                  key={chapter.id}
                  chapter={chapter}
                  bookId={bookId}
                  reorderMode={reorderMode}
                  collections={localCollections}
                  onAssignCollection={(colId) =>
                    handleAssignCollection(chapter.id, colId)
                  }
                />
              ))}
            </SortableContext>

            {collectionGroups.map((col) => (
              <div key={col.id}>
                <SortableCollectionHeader
                  col={col}
                  bookId={bookId}
                  isChapterDragOver={dragOverId === col.id}
                  isReordering={reorderMode}
                  collapsed={!!collapsed[col.id]}
                  onToggleCollapse={() => toggleCollapse(col.id)}
                  onUpdated={() => router.refresh()}
                />

                {(!collapsed[col.id] || reorderMode) && (
                  <SortableContext
                    items={col.chapters.map((c) => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {col.chapters.map((chapter) => (
                      <SortableChapterRow
                        key={chapter.id}
                        chapter={chapter}
                        bookId={bookId}
                        reorderMode={reorderMode}
                        indent
                        collections={localCollections}
                        onAssignCollection={(colId) =>
                          handleAssignCollection(chapter.id, colId)
                        }
                      />
                    ))}
                  </SortableContext>
                )}
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

function UncategorizedZone({ isOver }: { isOver: boolean }) {
  const { setNodeRef } = useDroppable({ id: 'uncategorized' });
  return (
    <div
      ref={setNodeRef}
      className={`flex items-center gap-3 px-6 py-3 transition-all border-y ${
        isOver
          ? 'border-[#FFC300]/40 bg-[#FFC300]/10'
          : 'border-transparent bg-[#1e1e1e]'
      }`}
    >
      <FileText
        className={`w-4 h-4 transition-colors ${isOver ? 'text-white/60' : 'text-white/20'}`}
      />
      <span
        className={`text-sm font-semibold transition-colors ${isOver ? 'text-white/80' : 'text-white/30'}`}
      >
        Uncategorized
      </span>
      {isOver && (
        <span className="text-xs text-[#FFC300]/60 ml-1">
          drop to move here
        </span>
      )}
    </div>
  );
}

function SortableCollectionHeader({
  col,
  bookId,
  isChapterDragOver,
  isReordering,
  collapsed,
  onToggleCollapse,
  onUpdated,
}: {
  col: Collection & { chapters: Chapter[] };
  bookId: string;
  isChapterDragOver: boolean;
  isReordering: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onUpdated: () => void;
}) {
  const { updateCollection, deleteCollection } = useBookStore();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: col.id });

  const [showMenu, setShowMenu] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [nameInput, setNameInput] = useState(col.name);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);
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

  async function handleRename() {
    if (!nameInput.trim() || nameInput.trim() === col.name) {
      setRenaming(false);
      setNameInput(col.name);
      return;
    }
    setSaving(true);
    await updateCollection(bookId, col.id, nameInput.trim());
    setSaving(false);
    setRenaming(false);
    onUpdated();
  }

  async function handleDelete() {
    setSaving(true);
    await deleteCollection(bookId, col.id);
    setSaving(false);
    setConfirmDelete(false);
    onUpdated();
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  if (renaming) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="flex items-center gap-3 px-6 py-3 bg-[#1e1e1e] border-y border-[#FFC300]/30"
      >
        <FolderOpen className="w-4 h-4 text-[#FFC300]/70 shrink-0" />
        <input
          autoFocus
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleRename();
            if (e.key === 'Escape') {
              setRenaming(false);
              setNameInput(col.name);
            }
          }}
          className="flex-1 min-w-0 bg-transparent text-sm font-semibold text-white/80 focus:outline-none border-b border-[#FFC300]/40"
        />
        <button
          onClick={handleRename}
          disabled={saving}
          className="text-xs text-[#FFC300] hover:text-[#FFD54F] transition-colors shrink-0"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save'}
        </button>
        <button
          onClick={() => {
            setRenaming(false);
            setNameInput(col.name);
          }}
          className="text-xs text-white/40 hover:text-white/70 transition-colors shrink-0"
        >
          Cancel
        </button>
      </div>
    );
  }

  /* ── Delete confirmation mode ── */
  if (confirmDelete) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="flex items-center gap-3 px-6 py-3 bg-[#323232] border-y border-red-500/20"
      >
        <p className="flex-1 min-w-0 text-sm font-bold text-white leading-relaxed">
          Delete <span className="font-bold text-sm text-yellow-500">{col.name}</span>?
          {col.chapters.length > 0 && (
            <span className="text-white font-bold text-sm">
              {' '}
              {col.chapters.length} chapter
              {col.chapters.length !== 1 ? 's' : ''} will also be deleted.
            </span>
          )}
        </p>
        <Button
          onClick={handleDelete}
          disabled={saving}
          size={'sm'}
          variant={'destructive'}
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Delete'}
        </Button>
        <Button onClick={() => setConfirmDelete(false)} variant={'outline'}>
          Cancel
        </Button>
      </div>
    );
  }

  /* ── Normal mode ── */
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isReordering ? { ...attributes, ...listeners } : {})}
      className={`flex items-center gap-3 px-6 py-3.5 transition-all border-y ${
        isReordering
          ? `cursor-grab active:cursor-grabbing ${
              isChapterDragOver
                ? 'border-[#FFC300]/40 bg-[#FFC300]/10'
                : 'border-transparent bg-[#1e1e1e] hover:bg-[#1c1c1c]'
            }`
          : 'border-transparent bg-[#1e1e1e] hover:bg-[#1c1c1c]'
      }`}
    >
      {isReordering ? (
        <GripVertical
          className={`w-4 h-4 shrink-0 ${isChapterDragOver ? 'text-[#FFC300]/60' : 'text-white/25'}`}
        />
      ) : (
        <div
          className="flex items-center cursor-pointer"
          onClick={onToggleCollapse}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-[#FFC300]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#FFC300]" />
          )}
        </div>
      )}
      <FolderOpen
        className={`w-4 h-4 shrink-0 transition-colors ${isReordering && isChapterDragOver ? 'text-[#FFC300]' : 'text-[#FFC300]/70'}`}
      />
      <div
        className="flex items-baseline gap-2 flex-1 min-w-0"
        onClick={!isReordering ? onToggleCollapse : undefined}
        style={{ cursor: !isReordering ? 'pointer' : undefined }}
      >
        <span
          className={`text-sm font-semibold truncate transition-colors ${isReordering && isChapterDragOver ? 'text-white/90' : 'text-white/80'}`}
        >
          {col.name}
        </span>
        <span className="text-xs text-white shrink-0">
          - {col.chapters.length} chapter{col.chapters.length !== 1 ? 's' : ''}
        </span>
        {isReordering && isChapterDragOver && (
          <span className="text-xs text-[#FFC300]/60 shrink-0">drop here</span>
        )}
      </div>
      <div
        className="relative shrink-0"
        ref={menuRef}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setShowMenu((v) => !v)}
          className="p-1 rounded text-yellow-500 hover:text-yellow-400 hover:bg-white/5 transition-all"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
        {showMenu && (
          <div className="absolute right-0 top-full mt-1 z-50 min-w-36 rounded-xl bg-[#1a1a1a] border border-[#333] shadow-xl py-1 overflow-hidden">
            <button
              onClick={() => {
                setRenaming(true);
                setShowMenu(false);
              }}
              className="w-full text-left px-3 py-2 text-xs text-white/60 hover:bg-white/5 hover:text-white/80 transition-colors"
            >
              Rename
            </button>
            <button
              onClick={() => {
                setConfirmDelete(true);
                setShowMenu(false);
              }}
              className="w-full text-left px-3 py-2 text-xs text-red-400/80 hover:bg-red-500/10 hover:text-red-300 transition-colors"
            >
              Delete collection
            </button>
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
      className={`flex items-center gap-3 px-6 py-4 hover:bg-white/2 transition-colors group ${
        indent ? 'pl-14' : ''
      } ${reorderMode ? 'cursor-grab active:cursor-grabbing' : ''}`}
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
              <button
                onClick={() => setShowMenu((v) => !v)}
                className="p-1.5 rounded-lg text-yellow-500 hover:text-yellow-400 hover:bg-white/5 transition-all"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 z-50 min-w-42 rounded-xl bg-[#1e1e1e] border border-[#333] shadow-xl py-1 overflow-hidden">
                  <p className="px-3 py-1.5 text-[10px] text-white uppercase tracking-wider">
                    Move to
                  </p>
                  {chapter.collectionId && (
                    <button
                      onClick={() => {
                        onAssignCollection(null);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-white hover:bg-white/5 hover:text-white/80 transition-colors"
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
                      className="w-full text-left px-3 py-2 text-xs text-white hover:bg-white/5 hover:text-white/80 transition-colors flex items-center gap-2"
                    >
                      <FolderOpen className="w-3 h-3 text-yellow-500 shrink-0" />
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
