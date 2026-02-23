'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowLeft,
  Edit,
  Share2,
  BookOpen,
  FileText,
  MessageSquare,
  GripVertical,
  Plus,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  MoreHorizontal,
} from 'lucide-react';
import {
  getBookById,
  getChaptersByBookId,
  getCollectionsByBookId,
} from '@/lib/sample/books.sample';
import type { Chapter } from '@/lib/types/books';

const BOOK_ID = '1';

export default function BookPage() {
  const book = getBookById(BOOK_ID)!;
  const chapters = getChaptersByBookId(BOOK_ID);
  const collections = getCollectionsByBookId(BOOK_ID);

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
    <div className="px-4 py-6 md:px-8">
      <Link
        href="/library"
        className="inline-flex items-center gap-1.5 text-sm text-white/45 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        My Library
      </Link>

      <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] shadow-xl p-6 mb-6">
        <div className="flex gap-5">
          <div className="hidden sm:flex w-28 shrink-0 aspect-2/3 rounded-xl bg-[#1e1e1e] border border-[#333] items-center justify-center">
            <BookOpen className="w-8 h-8 text-white/10" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-xl md:text-2xl font-bold text-white leading-tight">
                  {book.title}
                </h1>
                <p className="text-sm text-white/50 mt-1">by {book.author}</p>
              </div>

              <div className="hidden sm:flex items-center gap-2 shrink-0">
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-white/50 border border-[#333] hover:border-[#FFC300]/40 hover:text-[#FFC300] transition-all">
                  <Share2 className="w-3.5 h-3.5" />
                  Share
                </button>
                <Link
                  href={`/library/${book.id}/edit`}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-[#FFC300] text-[#1a1a1a] hover:bg-[#FFD740] transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit
                </Link>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-2.5 py-1 rounded-full bg-[#FFC300]/10 text-[#FFC300] text-xs font-medium">
                {book.genre}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/6 text-white/50 text-xs">
                {book.category}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/6 text-white/50 text-xs capitalize">
                {book.privacy.toLowerCase()}
              </span>
            </div>

            <p className="text-sm text-white/55 mt-3 leading-relaxed line-clamp-3">
              {book.description}
            </p>

            <div className="flex items-center gap-5 mt-4">
              <div className="flex items-center gap-1.5 text-sm text-white/40">
                <FileText className="w-3.5 h-3.5" />
                <span>{chapters.length} chapters</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-white/40">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{book.wordCount.toLocaleString()} words</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-white/40">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{book.commentCount} comments</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile actions */}
        <div className="flex sm:hidden gap-2 mt-4">
          <Link
            href={`/library/${book.id}/edit`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium bg-[#FFC300] text-[#1a1a1a] hover:bg-[#FFD740] transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit Book
          </Link>
          <button className="px-4 py-2.5 rounded-xl text-sm text-white/50 border border-[#333] hover:border-[#FFC300]/40 hover:text-[#FFC300] transition-all">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a]">
          <h2 className="text-base font-semibold text-white">Chapters</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setReorderMode((r) => !r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                reorderMode
                  ? 'bg-[#FFC300] text-[#1a1a1a]'
                  : 'text-white/45 border border-[#333] hover:border-[#FFC300]/30 hover:text-white/70'
              }`}
            >
              {reorderMode ? 'Done' : 'Reorder'}
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white/45 border border-[#333] hover:border-[#333] hover:text-white/70 transition-all">
              <FolderOpen className="w-3.5 h-3.5" />
              Add Collection
            </button>
            <Link
              href={`/library/${book.id}/create-chapter`}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FFC300] text-[#1a1a1a] hover:bg-[#FFD740] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Chapter
            </Link>
          </div>
        </div>

        <div className="divide-y divide-[#2a2a2a]">
          {soloChapters.map((chapter) => (
            <ChapterRow
              key={chapter.id}
              chapter={chapter}
              bookId={book.id}
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
                <span className="text-xs text-white/30 ml-1">
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
                    bookId={book.id}
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
              <Link
                href={`/library/${book.id}/create-chapter`}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-[#FFC300] text-[#1a1a1a] hover:bg-[#FFD740] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add first chapter
              </Link>
            </div>
          )}
        </div>
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
        <GripVertical className="w-4 h-4 text-white/20 cursor-grab shrink-0" />
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white/80 truncate group-hover:text-white transition-colors">
          {chapter.title}
        </p>
        <p className="text-xs text-white/30 mt-0.5">
          {chapter.wordCount.toLocaleString()} words
        </p>
      </div>

      {!reorderMode && (
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/library/${bookId}/${chapter.id}`}
            className="px-3 py-1.5 rounded-lg text-xs text-white/45 border border-[#2e2e2e] hover:border-[#FFC300]/30 hover:text-[#FFC300] transition-all"
          >
            Read
          </Link>
          <Link
            href={`/library/${bookId}/${chapter.id}/edit`}
            className="px-3 py-1.5 rounded-lg text-xs text-white/45 border border-[#2e2e2e] hover:border-[#FFC300]/30 hover:text-[#FFC300] transition-all"
          >
            Edit
          </Link>
          <button className="p-1.5 rounded-lg text-white/25 hover:text-white/60 hover:bg-white/5 transition-all">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
