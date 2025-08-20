'use client';
import { useState, useEffect } from 'react';
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
  const [status, setStatus] = useState<string>(friendshipStatus ?? 'NONE');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setStatus(friendshipStatus ?? 'NONE');
  }, [friendshipStatus]);

  const handleFriendRequest = async () => {
    try {
      setIsLoading(true);

      const response = await sendFriendRequest(friendId);

      if (response?.success) {
        setStatus('PENDING');
        toast.success(response.message ?? 'Friend request sent');
      } else {
        return;
      }
    } catch (err: any) {
      console.error('Error sending friend request:', err);
      toast.error(err?.message ?? 'Failed to send friend request');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'ACCEPTED') {
    return (
      <Button variant="secondary" disabled>
        Friends
      </Button>
    );
  }

  if (status === 'PENDING') {
    return (
      <Button variant="secondary" disabled>
        Request Sent
      </Button>
    );
  }

  return (
    <Button onClick={handleFriendRequest} disabled={isLoading}>
      {isLoading ? 'Sending…' : 'Add Friend'}
    </Button>
  );
}
