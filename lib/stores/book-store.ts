import { create } from 'zustand';
import {
  deleteBookAction,
  deleteChapterAction,
  reorderChaptersAction,
  reorderCollectionsAction,
  deleteCollectionAction,
  createCollectionAction,
  updateCollectionAction,
  assignChapterToCollectionAction,
  type ActionResult,
} from '@/lib/actions/book.actions';

interface BookStore {
  reorderMode:    boolean;
  pendingOrder:   string[];
  setReorderMode: (v: boolean) => void;
  setPendingOrder:(ids: string[]) => void;
  
  deleteBook:                 (bookId: string) => Promise<ActionResult>;
  deleteChapter:              (bookId: string, chapterId: string) => Promise<ActionResult>;
  reorderChapters:            (bookId: string, orderedIds: string[]) => Promise<ActionResult>;
  reorderCollections:         (bookId: string, orderedIds: string[]) => Promise<ActionResult>;
  createCollection:           (bookId: string, name: string) => Promise<ActionResult>;
  updateCollection:           (bookId: string, collectionId: string, name: string) => Promise<ActionResult>;
  deleteCollection:           (bookId: string, collectionId: string) => Promise<ActionResult>;
  assignChapterToCollection:  (bookId: string, chapterId: string, collectionId: string | null) => Promise<ActionResult>;
}

export const useBookStore = create<BookStore>((set) => ({
  reorderMode:    false,
  pendingOrder:   [],
  setReorderMode: (v) => set({ reorderMode: v }),
  setPendingOrder:(ids) => set({ pendingOrder: ids }),

  deleteBook:                (bookId) => deleteBookAction(bookId),
  deleteChapter:             (bookId, chapterId) => deleteChapterAction(bookId, chapterId),
  reorderChapters:           (bookId, orderedIds) => reorderChaptersAction(bookId, orderedIds),
  reorderCollections:        (bookId, orderedIds) => reorderCollectionsAction(bookId, orderedIds),
  createCollection:          (bookId, name) => createCollectionAction(bookId, name),
  updateCollection:          (bookId, collectionId, name) => updateCollectionAction(bookId, collectionId, name),
  deleteCollection:          (bookId, collectionId) => deleteCollectionAction(bookId, collectionId),
  assignChapterToCollection: (bookId, chapterId, collectionId) => assignChapterToCollectionAction(bookId, chapterId, collectionId),
}));
