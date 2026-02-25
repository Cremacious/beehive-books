export type Privacy = 'PUBLIC' | 'PRIVATE' | 'FRIENDS';

export type Book = {
  id: string;
  title: string;
  author: string;
  genre: string;
  category: string;
  description: string;
  privacy: Privacy;
  wordCount: number;
  commentCount: number;
  chapterCount: number;
  coverUrl: string | null;
};

export type Collection = {
  id: string;
  bookId: string;
  name: string;
  order: number;
};

export type Chapter = {
  id: string;
  bookId: string;
  title: string;
  wordCount: number;
  order: number;
  collectionId: string | null;
  authorNotes: string | null;
  content: string | null;
};

export type ExistingBook = {
  id: string;
  title: string;
  author: string;
  category: string;
  genre: string;
  description: string;
  privacy: string;
  coverUrl?: string | null;
};

export type BookFormProps = {
  mode: 'create' | 'edit';
  cancelHref?: string;
  book?: ExistingBook;
};

export type ChapterNav = Pick<Chapter, 'id' | 'title' | 'order'>;

type ExistingChapter = {
  id: string;
  title: string;
  authorNotes: string | null;
  content: string | null;
  collectionId: string | null;
};

export type ChapterFormProps = {
  mode: 'create' | 'edit';
  cancelHref: string;
  bookId: string;
  chapter?: ExistingChapter;
  collections?: { id: string; name: string }[];
};

