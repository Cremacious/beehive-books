'use client';

import { useEffect } from 'react';
import { useNotificationStore } from '@/store/notifications.store';
import { mockUser } from '@/lib/sampleData';

export default function NotificationInitializer() {
  const setNotifications = useNotificationStore((s) => s.setNotifications);
  const setFriendRequests = useNotificationStore((s) => s.setFriendRequests);

  useEffect(() => {
    setNotifications(mockUser.notifications);
    setFriendRequests(mockUser.receivedRequests);
  }, [setNotifications, setFriendRequests]);

  return null;
}
