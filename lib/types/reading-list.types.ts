export type Privacy = 'PUBLIC' | 'PRIVATE' | 'FRIENDS';

export type ReadingList = {
  id:                     string;
  userId:                 string;
  title:                  string;
  description:            string;
  privacy:                Privacy;
  bookCount:              number;
  readCount:              number;
  currentlyReadingId:     string | null;
  currentlyReadingTitle:  string | null;
  currentlyReadingAuthor: string | null;
  createdAt:              Date;
  updatedAt:              Date;
};

export type ReadingListBook = {
  id:            string;
  readingListId: string;
  title:         string;
  author:        string;
  isRead:        boolean;
  addedAt:       Date;
  order:         number;
};

export type ReadingListWithBooks = ReadingList & {
  books: ReadingListBook[];
};
