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
  type DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { Plus, FolderOpen, FileText, Loader2 } from 'lucide-react';
import type { Chapter, Collection } from '@/lib/types/books.types';
import { useBookStore } from '@/lib/stores/book-store';
import { UncategorizedZone } from './uncategorized-zone';
import { SortableCollectionHeader } from './collection-header';
import { SortableChapterRow } from './chapter-row';

type Props = {
  bookId: string;
  chapters: Chapter[];
  collections: Collection[];
  isOwner?: boolean;
};

type TopLevelItem =
  | { type: 'chapter'; id: string; order: number }
  | { type: 'collection'; id: string; order: number };

function buildTopLevelItems(
  soloChapters: Chapter[],
  collections: Collection[],
): TopLevelItem[] {
  const items: TopLevelItem[] = [
    ...soloChapters.map((c) => ({ type: 'chapter' as const, id: c.id, order: c.order })),
    ...collections.map((c) => ({ type: 'collection' as const, id: c.id, order: c.order })),
  ];
  items.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return a.type === 'chapter' ? -1 : 1;
  });
  return items;
}


function buildFlatList(
  topLevelItems: TopLevelItem[],
  collectionGroups: { id: string; chapters: Chapter[] }[],
  collapsed: Record<string, boolean>,
): string[] {
  const result: string[] = [];
  for (const item of topLevelItems) {
    result.push(item.id);
    if (item.type === 'collection' && !collapsed[item.id]) {
      const col = collectionGroups.find((g) => g.id === item.id);
      if (col) col.chapters.forEach((c) => result.push(c.id));
    }
  }
  return result;
}

export default function ChapterList({
  bookId,
  chapters,
  collections,
  isOwner = true,
}: Props) {
  const router = useRouter();
  const basePath: '/library' | '/books' = isOwner ? '/library' : '/books';
  const {
    reorderMode,
    setReorderMode,
    reorderBookItems,
    createCollection,
    deleteChapter,
    assignChapterToCollection,
  } = useBookStore();


  const [pendingFlatList, setPendingFlatList] = useState<string[] | null>(null);

  const [pendingChapters, setPendingChapters] = useState<Chapter[] | null>(null);

  const [hiddenChapters, setHiddenChapters] = useState<Record<string, string[]>>({});

  const localChapters = reorderMode && pendingChapters !== null ? pendingChapters : chapters;
  const soloChapters = localChapters.filter((c) => !c.collectionId);
  const collectionGroups = collections.map((col) => ({
    ...col,
    chapters: localChapters.filter((c) => c.collectionId === col.id),
  }));
  const topLevelItems = buildTopLevelItems(soloChapters, collections);

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    collections.forEach((col) => { init[col.id] = true; });
    return init;
  });
  const [saving, setSaving] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [showColInput, setShowColInput] = useState(false);
  const [addingCol, setAddingCol] = useState(false);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );


  const activeFlatList: string[] =
    reorderMode && pendingFlatList !== null
      ? pendingFlatList
      : buildFlatList(topLevelItems, collectionGroups, collapsed);


  const allIds = [...chapters.map((c) => c.id), ...collections.map((c) => c.id)];

  const chapterMap = new Map(localChapters.map((c) => [c.id, c]));
  const collectionGroupMap = new Map(collectionGroups.map((g) => [g.id, g]));

  function enterReorderMode() {
    const flat = buildFlatList(topLevelItems, collectionGroups, collapsed);
    setPendingFlatList(flat);
    setPendingChapters([...chapters]);
    setHiddenChapters({});
    setReorderMode(true);
  }

  function cancelReorderMode() {
    setReorderMode(false);
    setPendingFlatList(null);
    setPendingChapters(null);
    setHiddenChapters({});
  }

  function toggleCollapse(collectionId: string) {
    if (!reorderMode) {
      setCollapsed((prev) => ({ ...prev, [collectionId]: !prev[collectionId] }));
      return;
    }


    const isCollapsed = !!collapsed[collectionId];
    const list = pendingFlatList ?? [];

    if (isCollapsed) {

      const chaptersToInsert =
        hiddenChapters[collectionId] ??
        collectionGroups.find((g) => g.id === collectionId)?.chapters.map((c) => c.id) ??
        [];
      const colIdx = list.indexOf(collectionId);
      const newList = [...list];
      if (colIdx !== -1) newList.splice(colIdx + 1, 0, ...chaptersToInsert);
      setPendingFlatList(newList);
      setHiddenChapters((prev) => {
        const next = { ...prev };
        delete next[collectionId];
        return next;
      });
      setCollapsed((prev) => ({ ...prev, [collectionId]: false }));
    } else {

      const col = collectionGroups.find((g) => g.id === collectionId);
      const chapterIdSet = new Set(col?.chapters.map((c) => c.id) ?? []);
      const chaptersInOrder = list.filter((id) => chapterIdSet.has(id));
      const newList = list.filter((id) => !chapterIdSet.has(id));
      setPendingFlatList(newList);
      setHiddenChapters((prev) => ({ ...prev, [collectionId]: chaptersInOrder }));
      setCollapsed((prev) => ({ ...prev, [collectionId]: true }));
    }
  }

  function handleAssignCollection(chapterId: string, collectionId: string | null) {
    setPendingChapters((prev) =>
      (prev ?? chapters).map((c) =>
        c.id === chapterId ? { ...c, collectionId } : c,
      ),
    );

    if (reorderMode) {
      if (collectionId) {
    
        setPendingFlatList((prev) => {
          const list = prev ?? activeFlatList;
          const filtered = list.filter((id) => id !== chapterId);
          const colIdx = filtered.indexOf(collectionId);
          const newList = [...filtered];
          newList.splice(colIdx !== -1 ? colIdx + 1 : newList.length, 0, chapterId);
          return newList;
        });
        setCollapsed((prev) => ({ ...prev, [collectionId]: false }));
      } else {

        setPendingFlatList((prev) => {
          const list = prev ?? activeFlatList;
          const filtered = list.filter((id) => id !== chapterId);
          const firstColIdx = filtered.findIndex((id) => collections.some((c) => c.id === id));
          const newList = [...filtered];
          newList.splice(firstColIdx === -1 ? newList.length : firstColIdx, 0, chapterId);
          return newList;
        });
      }
    }

    assignChapterToCollection(bookId, chapterId, collectionId).then(() => router.refresh());
  }

  function handleDeleteChapter(chapterId: string) {
    deleteChapter(bookId, chapterId).then(() => router.refresh());
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    const overId = over?.id as string | undefined;
    const activeId = active.id as string;
    const activeIsChapter = localChapters.some((c) => c.id === activeId);
    const overIsCollection = overId ? collections.some((c) => c.id === overId) : false;
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
    const activeIsChapter = localChapters.some((c) => c.id === activeId);
    const overIsCollection = collections.some((c) => c.id === overId);
    const overIsUncategorized = overId === 'uncategorized';


    if (activeIsChapter && overIsCollection) {
      handleAssignCollection(activeId, overId);
      return;
    }


    if (activeIsChapter && overIsUncategorized) {
      handleAssignCollection(activeId, null);
      return;
    }


    const oldIndex = activeFlatList.indexOf(activeId);
    const newIndex = activeFlatList.indexOf(overId);
    if (oldIndex !== -1 && newIndex !== -1) {
      setPendingFlatList(arrayMove(activeFlatList, oldIndex, newIndex));
    }
  }

  async function handleSaveOrder() {
    setSaving(true);

    const flatList = pendingFlatList ?? activeFlatList;
    const collectionIdSet = new Set(collections.map((c) => c.id));

    const chapterOrders: { id: string; order: number }[] = [];
    const collectionOrders: { id: string; order: number }[] = [];

 
    flatList.forEach((id, index) => {
      const globalOrder = index + 1;
      if (collectionIdSet.has(id)) {
        collectionOrders.push({ id, order: globalOrder });
      } else {
        const chapter = localChapters.find((c) => c.id === id);
        if (chapter && !chapter.collectionId) {
          chapterOrders.push({ id, order: globalOrder });
        }
      }
    });


    for (const col of collections) {
      const colGroup = collectionGroups.find((g) => g.id === col.id);
      if (!colGroup) continue;
      const colChapterIds = new Set(colGroup.chapters.map((c) => c.id));

      if (collapsed[col.id]) {

        const orderedIds = hiddenChapters[col.id] ?? colGroup.chapters.map((c) => c.id);
        orderedIds.forEach((id, idx) => {
          if (colChapterIds.has(id)) chapterOrders.push({ id, order: idx + 1 });
        });
      } else {
      
        const orderedInFlat = flatList.filter((id) => colChapterIds.has(id));
        orderedInFlat.forEach((id, idx) => {
          chapterOrders.push({ id, order: idx + 1 });
        });
      }
    }

    const result = await reorderBookItems(bookId, chapterOrders, collectionOrders);
    setSaving(false);
    if (result.success) {
      cancelReorderMode();
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

  return (
    <div className="rounded-xl bg-[#252525] border border-[#2a2a2a] shadow-xl">
      <div className="px-5 py-4 border-b border-[#2a2a2a]">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-yellow-500 mainFont">Chapters</h2>
          {isOwner && (
            <div className="flex items-center gap-2">
              {reorderMode ? (
                <>
                  <Button size="sm" onClick={handleSaveOrder} disabled={saving}>
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Order'}
                  </Button>
                  <Button size="sm" variant="outline" onClick={cancelReorderMode}>
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button size="sm" variant="outline" className="hidden sm:flex" onClick={enterReorderMode}>
                    Reorder
                  </Button>
                  <Button size="sm" variant="outline" className="hidden sm:flex" onClick={() => setShowColInput((v) => !v)}>
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
          )}
        </div>
        {reorderMode && (
          <div className="mt-3 p-3 rounded-lg bg-[#FFC300]/10 border border-[#FFC300]/20">
            <p className="text-sm text-white leading-relaxed">
              Drag chapters and collections into your preferred order. Drop a chapter onto a
              collection header to assign it, or onto Uncategorized to remove it from a
              collection. Collapse a collection to drag it as a unit.
            </p>
          </div>
        )}
        {isOwner && !reorderMode && (
          <div className="flex sm:hidden items-center gap-2 mt-3">
            <Button size="sm" variant="outline" onClick={enterReorderMode}>Reorder</Button>
            <Button size="sm" variant="outline" onClick={() => setShowColInput((v) => !v)}>
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
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddCollection(); }}
              placeholder="Collection name…"
              autoFocus
              className="flex-1 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-1.5 text-sm text-white placeholder-white/50 focus:outline-none focus:border-[#FFC300]/50 transition-all"
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={reorderMode ? activeFlatList : allIds}
            strategy={verticalListSortingStrategy}
          >
            {reorderMode ? (
        
              <>
                {collections.length > 0 && (
                  <UncategorizedZone isOver={dragOverId === 'uncategorized'} />
                )}
                {activeFlatList.map((id) => {
                  const chapter = chapterMap.get(id);
                  if (chapter) {
                    return (
                      <SortableChapterRow
                        key={chapter.id}
                        chapter={chapter}
                        bookId={bookId}
                        reorderMode={true}
                        indent={!!chapter.collectionId}
                        collections={collections}
                        isOwner={isOwner}
                        basePath={basePath}
                        onAssignCollection={(colId) => handleAssignCollection(chapter.id, colId)}
                        onDeleteChapter={() => handleDeleteChapter(chapter.id)}
                      />
                    );
                  }
                  const col = collectionGroupMap.get(id);
                  if (col) {
                    return (
                      <SortableCollectionHeader
                        key={col.id}
                        col={col}
                        bookId={bookId}
                        isChapterDragOver={dragOverId === col.id}
                        isReordering={true}
                        collapsed={!!collapsed[col.id]}
                        onToggleCollapse={() => toggleCollapse(col.id)}
                        onUpdated={() => router.refresh()}
                        isOwner={isOwner}
                      />
                    );
                  }
                  return null;
                })}
              </>
            ) : (
         
              <>
                {topLevelItems.map((item) => {
                  if (item.type === 'chapter') {
                    const chapter = chapterMap.get(item.id);
                    if (!chapter) return null;
                    return (
                      <SortableChapterRow
                        key={chapter.id}
                        chapter={chapter}
                        bookId={bookId}
                        reorderMode={false}
                        collections={collections}
                        isOwner={isOwner}
                        basePath={basePath}
                        onAssignCollection={(colId) => handleAssignCollection(chapter.id, colId)}
                        onDeleteChapter={() => handleDeleteChapter(chapter.id)}
                      />
                    );
                  }
                  const col = collectionGroupMap.get(item.id);
                  if (!col) return null;
                  return (
                    <div key={col.id}>
                      <SortableCollectionHeader
                        col={col}
                        bookId={bookId}
                        isChapterDragOver={false}
                        isReordering={false}
                        collapsed={!!collapsed[col.id]}
                        onToggleCollapse={() => toggleCollapse(col.id)}
                        onUpdated={() => router.refresh()}
                        isOwner={isOwner}
                      />
                      {!collapsed[col.id] &&
                        col.chapters.map((chapter) => (
                          <SortableChapterRow
                            key={chapter.id}
                            chapter={chapter}
                            bookId={bookId}
                            reorderMode={false}
                            indent
                            collections={collections}
                            isOwner={isOwner}
                            basePath={basePath}
                            onAssignCollection={(colId) => handleAssignCollection(chapter.id, colId)}
                            onDeleteChapter={() => handleDeleteChapter(chapter.id)}
                          />
                        ))}
                    </div>
                  );
                })}
              </>
            )}
          </SortableContext>
        </DndContext>

        {chapters.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-xl border-2 border-dashed border-[#FFC300]/20 bg-[#FFC300]/5 flex items-center justify-center mb-8">
              <FileText className="w-8 h-8 text-[#FFC300]/20" />
            </div>
            <h2 className="text-2xl font-bold text-[#FFC300] mb-2 mainFont">No chapters yet!</h2>
            <p className="text-white/80 mb-8 max-w-sm">
              Start writing your story by adding your first chapter.
            </p>
            {isOwner && (
              <Button asChild size="lg">
                <Link href={`/library/${bookId}/create-chapter`}>
                  <Plus className="w-5 h-5" />
                  Add first chapter
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
