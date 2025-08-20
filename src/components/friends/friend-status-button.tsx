'use client';

import { Button } from '../ui/button';
import { sendFriendRequest } from '@/lib/actions/friend.actions';

export default function FriendStatusButton({
  isFriend,
  friendId,
}: {
  isFriend: boolean;
  friendId: string;
}) {
  const handleFriendRequest = async () => {
    if (isFriend) {
      
    } else {
      const response = await sendFriendRequest(friendId);
      console.log('Friend request response:', response);
    }
  };

  return (
    <Button onClick={handleFriendRequest}>
      {isFriend ? 'Unfriend' : 'Send Friend Request'}
    </Button>
  );
}
