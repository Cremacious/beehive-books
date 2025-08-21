export type BookType = {
  id: number;
  title: string;
  author: string;
  genre?: string;
  category?: string;
  description?: string;
  privacy: string;
  cover?: string;
  lastEditedBy?: string;
  createdAt: string;
  publishedAt?: string;
  updatedAt: string;
  status: string;
  wordCount: number;
  chapters: ChapterType[];
  comments: CommentType[];
  collaborators: BookUserType[];
};

export type ChapterType = {
  id: number;
  author: string;
  title: string;
  notes?: string;
  content: string;
  privacy: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  wordCount: number;
  comments: CommentType[];
};

export type CommentType = {
  id: number;
  authorId: string;
  content: string;
  createdAt: string;
  chapterId: number;
  author: BookUserType;
  parentId?: number;
  replies: CommentType[];
};

export type BookUserType = {
  id: string;
  name: string;
  image?: string; 
};
