'use client';

import { useEffect } from 'react';
import { useNotificationStore } from '@/store/notifications.store';
import { getPendingFriendRequests } from '../actions/friend.actions';

export default function NotificationInitializer() {
  const setNotifications = useNotificationStore((s) => s.setNotifications);
  const setFriendRequests = useNotificationStore((s) => s.setFriendRequests);

  useEffect(() => {
    const fetchFriendRequests = async () => {
      const friendRequests = await getPendingFriendRequests();
      setFriendRequests(friendRequests.length > 0 ? friendRequests : []);
    };
    // setNotifications(mockUser.notifications);
    // setFriendRequests(mockUser.receivedRequests);
    fetchFriendRequests();
  }, [setNotifications, setFriendRequests]);

  return null;
}
