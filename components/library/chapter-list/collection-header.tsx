'use client';

import { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import {
  GripVertical,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  MoreHorizontal,
  Loader2,
} from 'lucide-react';
import type { Chapter, Collection } from '@/lib/types/books.types';
import { useBookStore } from '@/lib/stores/book-store';

export function SortableCollectionHeader({
  col,
  bookId,
  isChapterDragOver,
  isReordering,
  collapsed,
  onToggleCollapse,
  onUpdated,
  isOwner = true,
}: {
  col: Collection & { chapters: Chapter[] };
  bookId: string;
  isChapterDragOver: boolean;
  isReordering: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onUpdated: () => void;
  isOwner?: boolean;
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

  if (isOwner && renaming) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="flex items-center gap-3 px-4 py-3 bg-[#1e1e1e] border-y border-[#FFC300]/30"
      >
        <FolderOpen className="w-4 h-4 text-yellow-500 shrink-0" />
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

  if (isOwner && confirmDelete) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="flex items-center gap-3 px-4 py-3 bg-[#323232] border-y border-red-500/20"
      >
        <p className="flex-1 min-w-0 text-sm font-bold text-white leading-relaxed">
          Delete{' '}
          <span className="font-bold text-sm text-yellow-500">{col.name}</span>?
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isReordering ? { ...attributes, ...listeners } : {})}
      className={`flex items-center gap-4 px-5 py-4 transition-all border-y ${
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
            <ChevronRight className="w-5 h-5 text-[#FFC300]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[#FFC300]" />
          )}
        </div>
      )}
      <FolderOpen
        className={`w-5 h-5 shrink-0 transition-colors ${isReordering && isChapterDragOver ? 'text-yellow-500' : 'text-yellow-500'}`}
      />
      <div
        className="flex flex-col flex-1 min-w-0"
        onClick={!isReordering ? onToggleCollapse : undefined}
        style={{ cursor: !isReordering ? 'pointer' : undefined }}
      >
        <span
          className={`text-base font-semibold truncate transition-colors ${isReordering && isChapterDragOver ? 'text-white/90' : 'text-white'}`}
        >
          {col.name}
        </span>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-sm text-white/70 shrink-0">
            {col.chapters.length} chapter{col.chapters.length !== 1 ? 's' : ''}
          </span>
          <span className="text-sm text-white/70 shrink-0">
            ·{' '}
            {col.chapters
              .reduce((sum, chapter) => sum + chapter.wordCount, 0)
              .toLocaleString()}{' '}
            words
          </span>
          {isReordering && isChapterDragOver && (
            <span className="text-sm text-[#FFC300]/60 shrink-0">
              drop here
            </span>
          )}
        </div>
      </div>
      {isOwner && (
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
                className="w-full text-left px-3 py-2 text-xs text-white hover:bg-white/5 hover:text-white/80 transition-colors"
              >
                Rename
              </button>
              <button
                onClick={() => {
                  setConfirmDelete(true);
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
              >
                Delete collection
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
