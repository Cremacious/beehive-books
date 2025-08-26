'use client';
import { useState } from 'react';
import { Button } from '../ui/button';
import { useNotificationStore } from '@/store/notifications.store';
import {
  AlertDialog,
  // AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { FriendRequestType } from '@/lib/types/friend.type';
import {
  acceptFriendRequest,
  rejectFriendRequest,
} from '@/lib/actions/friend.actions';
import Image from 'next/image';
import defaultProfileImage from '@/assets/stock/stockProfile.png';

export default function ViewFriendRequestsButton({
  pendingFriendRequests,
}: {
  pendingFriendRequests: FriendRequestType[];
}) {
  const pendingCount =
    useNotificationStore((s) => s.pendingFriendRequestsCount()) ||
    pendingFriendRequests.filter((r) => r.status === 'PENDING').length;

  const setFriendRequests = useNotificationStore((s) => s.setFriendRequests);

  const [requests, setRequests] = useState<FriendRequestType[]>(
    pendingFriendRequests
  );

  const handleAccept = async (id: string) => {
    await acceptFriendRequest(id);
    setRequests((prev) => prev.filter((req) => req.id !== id));
    setFriendRequests(requests.filter((req) => req.id !== id));
  };

  const handleReject = async (id: string) => {
    await rejectFriendRequest(id);
    setRequests((prev) => prev.filter((req) => req.id !== id));
    setFriendRequests(requests.filter((req) => req.id !== id));
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <Button
          size={'sm'}
          className="relative pr-8 shadow-md bg-yellow-100 text-yellow-700 font-semibold hover:bg-yellow-200 transition text-sm"
        >
          View All Friend Requests
          <span className="absolute top-0 right-2 -translate-y-1/2 bg-yellow-500 text-white text-xs font-bold rounded-full px-2 py-0.5 shadow-md">
            {pendingCount}
          </span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Pending Friend Requests</AlertDialogTitle>
          <AlertDialogDescription>
            {requests.length === 0 ? (
              <div className="text-gray-500 text-sm">
                No pending friend requests.
              </div>
            ) : (
              <ul className="mt-2 space-y-4">
                {requests.map((request) => (
                  <li key={request.id} className="flex items-center gap-3">
                    <div className="border-b p-2 border-gray-200 w-full rounded-lg flex items-center gap-3 bg-white shadow-sm">
                      <Image
                        src={request.image ?? defaultProfileImage}
                        alt={request.sender}
                        width={40}
                        height={40}
                        className="rounded-full border border-yellow-300"
                      />
                      <span className="font-medium text-gray-800">
                        {request.sender}
                      </span>
                      <Button
                        size="sm"
                        variant="acceptFriend"
                        className="ml-auto "
                        onClick={() => handleAccept(request.id)}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(request.id)}
                      >
                        Reject
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
