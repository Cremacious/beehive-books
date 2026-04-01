export type Privacy = 'PUBLIC' | 'PRIVATE' | 'FRIENDS';

export type ReadingList = {
  id: string;
  userId: string;
  title: string;
  description: string;
  curatorNote?: string | null;
  privacy: Privacy;
  bookCount: number;
  readCount: number;
  followerCount: number;
  likeCount: number;
  currentlyReadingId: string | null;
  currentlyReadingTitle: string | null;
  currentlyReadingAuthor: string | null;
  explorable: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type ReadingListBook = {
  id: string;
  readingListId: string;
  bookId?: string | null;
  title: string;
  author: string;
  isRead: boolean;
  addedAt: Date;
  order: number;
  rating?: string | null;
  commentary?: string | null;
};

export type ReadingListWithBooks = ReadingList & {
  books: ReadingListBook[];
};

export type ReadingListFormData = {
  title: string;
  description: string;
  curatorNote?: string;
  privacy: Privacy;
  explorable: boolean;
  tags: string[];
};

export type BookEntryData = {
  title: string;
  author: string;
  bookId?: string;
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
  curator: { username: string | null; image: string | null };
  isFollowing: boolean;
  isLiked: boolean;
  currentUserId: string | null;
}

export type ActionResult = { success: boolean; message: string };
