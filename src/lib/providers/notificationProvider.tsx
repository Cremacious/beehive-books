'use client';

import { useEffect } from 'react';
import { useNotificationStore } from '@/store/notifications.store';
import { getPendingFriendRequests } from '../actions/friend.actions';
import { FriendRequestType } from '@/lib/types/friend.type';
import { getUserMessages } from '@/lib/actions/message.actions';
import { usePathname } from 'next/navigation';

export default function NotificationInitializer({
  initialFriendRequests = [],
}: {
  initialFriendRequests?: FriendRequestType[];
}) {
  const setNotifications = useNotificationStore((s) => s.setNotifications);
  const setFriendRequests = useNotificationStore((s) => s.setFriendRequests);
  const pathname = usePathname();

  useEffect(() => {
    setFriendRequests(initialFriendRequests);
  }, [initialFriendRequests, setFriendRequests]);

  useEffect(() => {
    const fetchFriendRequests = async () => {
      const friendRequests = await getPendingFriendRequests();
      setFriendRequests(friendRequests.length > 0 ? friendRequests : []);
      const messages = await getUserMessages();
      const unreadMessages = messages.filter((msg) => !msg.read);
      setNotifications(unreadMessages.length > 0 ? unreadMessages : []);
    };
    fetchFriendRequests();
  }, [setNotifications, setFriendRequests, pathname]);

  return null;
}
