export type Privacy = 'PUBLIC' | 'PRIVATE' | 'FRIENDS';

export type ReadingList = {
  id: string;
  userId: string;
  title: string;
  description: string;
  privacy: Privacy;
  bookCount: number;
  readCount: number;
  currentlyReadingId: string | null;
  currentlyReadingTitle: string | null;
  currentlyReadingAuthor: string | null;
  explorable: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ReadingListBook = {
  id: string;
  readingListId: string;
  title: string;
  author: string;
  isRead: boolean;
  addedAt: Date;
  order: number;
};

export type ReadingListWithBooks = ReadingList & {
  books: ReadingListBook[];
};

export type ReadingListFormData = {
  title: string;
  description: string;
  privacy: Privacy;
  explorable: boolean;
};

export type BookEntryData = {
  title: string;
  author: string;
};

export type ReadingListFormMode = 'create' | 'edit';

export interface ReadingListFormProps {
  mode: ReadingListFormMode;
  listId?: string;
  defaultValues?: Partial<ReadingList>;
}

export interface BookListViewProps {
  books: ReadingListBook[];
  listId: string;
  isOwner: boolean;
  currentlyReadingId: string | null;
}

export interface ListStatsProps {
  bookCount: number;
  readCount: number;
}

export interface ReadingListHeaderProps {
  list: ReadingList;
  isOwner: boolean;
}

export type ActionResult = { success: boolean; message: string };
