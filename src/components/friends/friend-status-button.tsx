'use client';

import { Button } from '../ui/button';
import { sendFriendRequest } from '@/lib/actions/friend.actions';
import { toast } from 'sonner';

export default function FriendStatusButton({
  friendId,
  friendshipStatus,
}: {
  friendId: string;
  friendshipStatus: string;
}) {
  const handleFriendRequest = async () => {
    const response = await sendFriendRequest(friendId);
    if (response.success) {
      toast.success('Friend request sent successfully');
    } else {
      toast.error(response.message || 'Failed to send friend request');
    }
  };

  if (friendshipStatus === 'ACCEPTED') {
    return (
      <Button variant="secondary" disabled>
        Friends
      </Button>
    );
  }

  if (friendshipStatus === 'PENDING') {
    return (
      <Button variant="secondary" disabled>
        Request Sent
      </Button>
    );
  }

  return <Button onClick={handleFriendRequest}>Add Friend</Button>;
}
