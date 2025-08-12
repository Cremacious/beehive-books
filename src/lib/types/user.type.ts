export type UserType = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  createdAt: string;
  updatedAt: string;
  //   sessions: SessionType[];
  //   accounts: AccountType[];
  //   books: BookType[];
  //   comments: CommentType[];
  //   notifications: NotificationType[];
  //   sentRequests: FriendRequestType[];
  //   receivedRequests: FriendRequestType[];
  //   friends: FriendshipType[];
  //   friendOf: FriendshipType[];
  //   lastEditedBooks: BookType[];
  //   collaboratedBooks: BookType[];
  isFriend?: boolean;
  bio: string
};
