'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  GripVertical,
  Plus,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  MoreHorizontal,
  FileText,
} from 'lucide-react';
import type { Chapter, Collection } from '@/lib/types/books';

type Props = {
  bookId: string;
  chapters: Chapter[];
  collections: Collection[];
};

export default function ChapterList({ bookId, chapters, collections }: Props) {
  const [reorderMode, setReorderMode] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleCollapse = (id: string) =>
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));

  const soloChapters = chapters.filter((c) => !c.collectionId);
  const collectionChapters = collections.map((col) => ({
    ...col,
    chapters: chapters.filter((c) => c.collectionId === col.id),
  }));

  return (
    <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] shadow-xl">
      <div className="px-4 py-4 border-b border-[#2a2a2a] sm:px-6">

        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Chapters</h2>
          <div className="flex items-center gap-2">
         
            <Button
              size="sm"
              variant={reorderMode ? 'default' : 'outline'}
              className="hidden sm:flex"
              onClick={() => setReorderMode((r) => !r)}
            >
              {reorderMode ? 'Done' : 'Reorder'}
            </Button>
            <Button size="sm" variant="outline" className="hidden sm:flex">
              <FolderOpen />
              Add Collection
            </Button>
            <Button asChild size="sm">
              <Link href={`/library/${bookId}/create-chapter`}>
                <Plus />
                Chapter
              </Link>
            </Button>
          </div>
        </div>


        <div className="flex sm:hidden items-center gap-2 mt-3">
          <Button
            size="sm"
            variant={reorderMode ? 'default' : 'outline'}
            onClick={() => setReorderMode((r) => !r)}
          >
            {reorderMode ? 'Done' : 'Reorder'}
          </Button>
          <Button size="sm" variant="outline">
            <FolderOpen />
            Collection
          </Button>
        </div>
      </div>

      <div className="divide-y divide-[#2a2a2a]">
        {soloChapters.map((chapter) => (
          <ChapterRow
            key={chapter.id}
            chapter={chapter}
            bookId={bookId}
            reorderMode={reorderMode}
          />
        ))}

        {collectionChapters.map((col) => (
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
              <span className="text-sm font-semibold text-white/80">
                {col.name}
              </span>
              <span className="text-xs text-white/70 ml-1">
                {col.chapters.length} chapter
                {col.chapters.length !== 1 ? 's' : ''}
              </span>
              {reorderMode && (
                <GripVertical className="w-4 h-4 text-white/25 ml-auto" />
              )}
            </button>

            {!collapsed[col.id] &&
              col.chapters.map((chapter) => (
                <ChapterRow
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

function ChapterRow({
  chapter,
  bookId,
  reorderMode,
  indent = false,
}: {
  chapter: Chapter;
  bookId: string;
  reorderMode: boolean;
  indent?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-6 py-4 hover:bg-white/2 transition-colors group ${indent ? 'pl-14' : ''}`}
    >
      {reorderMode && (
        <GripVertical className="w-4 h-4 text-white cursor-grab shrink-0" />
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate group-hover:text-white transition-colors">
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
