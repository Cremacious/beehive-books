export type Privacy = 'PUBLIC' | 'PRIVATE' | 'FRIENDS';

export type Book = {
  id:           string;
  title:        string;
  author:       string;
  genre:        string;
  category:     string;
  description:  string;
  privacy:      Privacy;
  wordCount:    number;
  commentCount: number;
  chapterCount: number;
  coverUrl:     string | null;
};

export type Collection = {
  id:     string;
  bookId: string;
  name:   string;
  order:  number;
};

export type Chapter = {
  id:           string;
  bookId:       string;
  title:        string;
  wordCount:    number;
  order:        number;
  collectionId: string | null;
  authorNotes:  string | null;
  content:      string | null;
};

// Lightweight shape used for prev/next navigation
export type ChapterNav = Pick<Chapter, 'id' | 'title' | 'order'>;

// In production this would come from the users table joined to comments.
// colorClass is a Tailwind bg+text pair derived from user data (e.g. hashed from userId).
export type CommentUser = {
  name:       string;
  initials:   string;
  colorClass: string;
};

export type Reply = {
  id:        string;
  user:      CommentUser;
  text:      string;
  likeCount: number;
  likedByMe: boolean;
  createdAt: string;
};

export type Comment = {
  id:        string;
  chapterId: string;
  user:      CommentUser;
  text:      string;
  likeCount: number;
  likedByMe: boolean;
  createdAt: string;
  replies:   Reply[];
};
