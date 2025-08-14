'use client';
import { Button } from '../ui/button';
import { useNotificationStore } from '@/store/notifications.store';

export default function ViewFriendRequestsButton() {
  const friendRequests = useNotificationStore((s) => s.friendRequests);

  return (
    <Button
      size={'sm'}
      className="relative pr-8 shadow-md bg-yellow-100 text-yellow-700 font-semibold hover:bg-yellow-200 transition text-sm"
    >
      View All Friend Requests
      <span className="absolute top-0 right-2 -translate-y-1/2 bg-yellow-500 text-white text-xs font-bold rounded-full px-2 py-0.5 shadow-md">
        {friendRequests.length}
      </span>
    </Button>
  );
}
