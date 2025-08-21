import { create } from 'zustand';
import { NotificationType } from '@/lib/types/message.type';
import { FriendRequestType } from '@/lib/types/friend.type';

type NotificationStore = {
  notifications: NotificationType[];
  friendRequests: FriendRequestType[];
  setNotifications: (notifications: NotificationType[]) => void;
  setFriendRequests: (requests: FriendRequestType[]) => void;
  markAsRead: (id: string) => void;
  unreadCount: () => number;
  pendingFriendRequestsCount: () => number;
};

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  friendRequests: [],
  setNotifications: (notifications) => set({ notifications }),
  setFriendRequests: (friendRequests) => set({ friendRequests }),
  markAsRead: (id) =>
    set({
      notifications: get().notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }),
  unreadCount: () => get().notifications.filter((n) => !n.read).length,
  pendingFriendRequestsCount: () =>
    get().friendRequests.filter((r) => r.status === 'PENDING').length,
}));