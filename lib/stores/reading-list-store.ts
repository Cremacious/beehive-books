import { create } from 'zustand';
import {
  createReadingListAction,
  updateReadingListAction,
  deleteReadingListAction,
  addBookToListAction,
  removeBookFromListAction,
  toggleBookReadStatusAction,
  setCurrentlyReadingAction,
} from '@/lib/actions/reading-list.actions';
import type {
  ReadingListFormData,
  BookEntryData,
  ActionResult,
} from '@/lib/types/reading-list.types';

interface ReadingListStore {
  optimisticReadStatus: Record<string, boolean>;
  optimisticCurrentlyReading: Record<string, string | null>;

  createList: (
    data: ReadingListFormData,
    initialBooks: BookEntryData[],
    currentlyReadingIdx?: number | null,
  ) => Promise<ActionResult & { listId?: string }>;
  updateList: (
    listId: string,
    data: ReadingListFormData,
  ) => Promise<ActionResult>;
  deleteList: (listId: string) => Promise<ActionResult>;
  addBook: (listId: string, bookData: BookEntryData) => Promise<ActionResult>;
  removeBook: (listId: string, bookId: string) => Promise<ActionResult>;
  toggleReadStatus: (
    listId: string,
    bookId: string,
    currentStatus: boolean,
  ) => Promise<void>;
  setCurrentlyReading: (
    listId: string,
    bookId: string | null,
    previousBookId: string | null,
  ) => Promise<void>;
}

export const useReadingListStore = create<ReadingListStore>((set) => ({
  optimisticReadStatus: {},
  optimisticCurrentlyReading: {},

  createList: (data, initialBooks, currentlyReadingIdx = null) =>
    createReadingListAction(data, initialBooks, currentlyReadingIdx),

  updateList: (listId, data) => updateReadingListAction(listId, data),

  deleteList: (listId) => deleteReadingListAction(listId),

  addBook: (listId, bookData) => addBookToListAction(listId, bookData),

  removeBook: (listId, bookId) => removeBookFromListAction(listId, bookId),

  toggleReadStatus: async (listId, bookId, currentStatus) => {
    const nextStatus = !currentStatus;
    set((s) => ({
      optimisticReadStatus: { ...s.optimisticReadStatus, [bookId]: nextStatus },
    }));
    const result = await toggleBookReadStatusAction(listId, bookId, nextStatus);
    if (!result.success) {
      set((s) => ({
        optimisticReadStatus: {
          ...s.optimisticReadStatus,
          [bookId]: currentStatus,
        },
      }));
    }
  },

  setCurrentlyReading: async (listId, bookId, previousBookId) => {
    set((s) => ({
      optimisticCurrentlyReading: {
        ...s.optimisticCurrentlyReading,
        [listId]: bookId,
      },
    }));
    const result = await setCurrentlyReadingAction(listId, bookId);
    if (!result.success) {
      set((s) => ({
        optimisticCurrentlyReading: {
          ...s.optimisticCurrentlyReading,
          [listId]: previousBookId,
        },
      }));
    }
  },
}));
