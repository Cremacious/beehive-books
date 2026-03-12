export type CommentUser = {
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  image: string | null;
};

export type Reply = {
  id: string;
  content: string;
  likeCount: number;
  likedByMe: boolean;
  createdAt: Date;
  user: CommentUser;
};

export type Comment = {
  id: string;
  content: string;
  likeCount: number;
  likedByMe: boolean;
  createdAt: Date;
  user: CommentUser;
  replies: Reply[];
};

export type CommentSectionProps = {
  chapterId: string;
  comments: Comment[];
  currentUserId: string | null;
};
