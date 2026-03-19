'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { DeleteDialog } from '@/components/shared/delete-dialog';
import {
  GripVertical,
  FolderOpen,
  MoreHorizontal,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import type { Chapter, Collection } from '@/lib/types/books.types';

export function SortableChapterRow({
  chapter,
  bookId,
  reorderMode,
  indent = false,
  collections,
  isOwner = true,
  basePath = '/library',
  onAssignCollection,
  onDeleteChapter,
  isRead,
  onToggleRead,
}: {
  chapter: Chapter;
  bookId: string;
  reorderMode: boolean;
  indent?: boolean;
  collections: Collection[];
  isOwner?: boolean;
  basePath?: '/library' | '/books';
  onAssignCollection: (collectionId: string | null) => void;
  onDeleteChapter: () => void;
  isRead?: boolean;
  onToggleRead?: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: chapter.id });

  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
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
  const hasMoveItems = !!chapter.collectionId || otherCollections.length > 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(reorderMode ? { ...attributes, ...listeners } : {})}
      onClick={
        !reorderMode && !showMenu
          ? () => router.push(`${basePath}/${bookId}/${chapter.id}`)
          : undefined
      }
      className={`flex items-center gap-4 px-5 py-4  hover:bg-[#2e2e2e] transition-colors group border-b border-[#2a2a2a] ${
        indent ? 'pl-12' : ''
      } ${reorderMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`}
    >
      {reorderMode && (
        <div className="shrink-0">
          <GripVertical className="w-4 h-4 text-white/80" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-base font-medium text-white truncate">
          {chapter.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-sm text-white/80">
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
        <div
          className="flex items-center gap-2 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <>
            {onToggleRead !== undefined && (
              <button
                onClick={onToggleRead}
                role="checkbox"
                aria-checked={!!isRead}
                aria-label={isRead ? 'Mark as unread' : 'Mark as read'}
                className={`p-1.5 rounded-lg transition-all ${
                  isRead
                    ? 'text-[#FFC300] hover:text-[#FFC300]/70 hover:bg-[#FFC300]/10'
                    : 'text-white/20 hover:text-white/50 hover:bg-white/5'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
            <Link
              href={`${basePath}/${bookId}/${chapter.id}`}
              className="hidden sm:block px-3 py-1.5 rounded-lg text-xs text-white border border-[#2a2a2a] hover:border-[#FFC300]/30 hover:text-[#FFC300] transition-all"
            >
              Read
            </Link>
            {isOwner && (
              <>
                <Link
                  href={`/library/${bookId}/${chapter.id}/edit`}
                  className="hidden sm:block px-3 py-1.5 rounded-lg text-xs text-white border border-[#2a2a2a] hover:border-[#FFC300]/30 hover:text-[#FFC300] transition-all"
                >
                  Edit
                </Link>
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setShowMenu((v) => !v)}
                    className="p-1.5 rounded-lg text-yellow-500 hover:text-yellow-400 hover:bg-white/5 transition-all"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  {showMenu && (
                    <div className="absolute right-0 top-full mt-1 z-50 min-w-42 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] shadow-xl py-1 overflow-hidden">
                      <Link
                        href={`${basePath}/${bookId}/${chapter.id}`}
                        className="sm:hidden w-full text-left px-3 py-2 text-xs text-white hover:bg-white/5 hover:text-white/80 transition-colors flex items-center gap-2"
                      >
                        Read
                      </Link>
                      <Link
                        href={`/library/${bookId}/${chapter.id}/edit`}
                        className="sm:hidden w-full text-left px-3 py-2 text-xs text-white hover:bg-white/5 hover:text-white/80 transition-colors flex items-center gap-2"
                      >
                        Edit
                      </Link>
                      <div className="sm:hidden my-1 border-t border-[#2a2a2a]" />
                      {hasMoveItems && (
                        <>
                          <p className="px-3 py-1.5 text-[10px] text-white/80 uppercase tracking-wider">
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
                          <div className="my-1 border-t border-[#2a2a2a]" />
                        </>
                      )}
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          setDeleteDialogOpen(true);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center gap-2"
                      >
                        <Trash2 className="w-3 h-3 shrink-0" />
                        Delete chapter
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        </div>
      )}

      {isOwner && (
        <DeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          itemType="chapter"
          itemName={chapter.title}
          onDelete={async () => { onDeleteChapter(); }}
        />
      )}
    </div>
  );
}
