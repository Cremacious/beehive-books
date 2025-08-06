export type BookType = {
  id: number;
  title: string;
  author: string;
  genre?: string;
  category?: string;
  privacy: string;
  cover?: string;
  lastEditedBy?: number; 
  createdAt: string;
  publishedAt?: string;
  updatedAt: string;
  status: string; 
  wordCount: number;
  chapters: ChapterType[];
  comments: CommentType[];
  collaborators: UserType[]; 
};

export type ChapterType = {
  id: number;
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
  content: string;
  createdAt: string;
  chapterId: number;
  author: BookUserType;
  parentId?: number;
  replies: CommentType[];
};

export type BookUserType = {
  id: number;
  name: string;
};