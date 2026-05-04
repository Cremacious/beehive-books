import type { Chapter, DraftStatus } from '@/lib/types/books.types';
import { DRAFT_STATUS_LABELS } from '@/lib/types/books.types';

export type WorkspaceMode = 'plan' | 'draft';
export type PublishingStatus = 'draft' | 'self_published' | 'submitted' | 'published';

export type WorkspaceBook = {
  id: string;
  title: string;
  author: string;
  genre: string;
  category: string;
  description: string;
  privacy: string;
  draftStatus: DraftStatus;
  publishingStatus: PublishingStatus;
  wordCount: number;
  chapterCount: number;
  commentCount: number;
  updatedAt?: Date;
  chapters: Chapter[];
  collections: { id: string; name: string; order: number }[];
};

export function getAdaptiveWorkspaceMode(
  book: Pick<WorkspaceBook, 'chapterCount' | 'wordCount' | 'chapters'>,
): WorkspaceMode {
  if (book.chapterCount > 0 || book.wordCount > 0 || book.chapters.length > 0) {
    return 'draft';
  }

  return 'plan';
}

export function getLatestChapter(chapters: Chapter[]) {
  return [...chapters].sort((a, b) => b.order - a.order)[0] ?? null;
}

export function getWorkspaceStats(
  book: Pick<WorkspaceBook, 'chapterCount' | 'wordCount' | 'commentCount' | 'collections'>,
) {
  return [
    { label: 'chapters', value: book.chapterCount },
    { label: 'words', value: book.wordCount },
    { label: 'collections', value: book.collections.length },
    { label: 'comments', value: book.commentCount },
  ];
}

export function getDraftStatusLabel(status: DraftStatus) {
  return DRAFT_STATUS_LABELS[status] ?? 'Draft';
}

export function getPublishingStatusLabel(status: PublishingStatus) {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'self_published':
      return 'Self published';
    case 'submitted':
      return 'Submitted';
    case 'published':
      return 'Published';
  }
}

export function formatWorkspaceDate(date?: Date) {
  if (!date) return 'Not updated yet';

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}
