export type FriendType = {
  id: number;
  name: string;
  avatar: string;
};

export type FriendRequestType = {
  id: string;
  status: string;
  sender: string;
  name: string;
  image?: string;
};
