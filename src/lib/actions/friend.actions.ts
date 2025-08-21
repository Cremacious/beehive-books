'use server';
// import { FriendshipStatus } from '@prisma/client';
import prisma from '../prisma';
import { getAuthenticatedUser } from '../server-utils';

export async function getUserFriends() {
  try {
    const { user, error } = await getAuthenticatedUser();
    console.log('Fetching user friends for:', user?.id);
    if (error) throw new Error(error);
    if (!user) throw new Error('User not found');

    const friends = await prisma.friendship.findMany({
      where: {
        OR: [
          { userId: user.id, status: 'ACCEPTED' },
          { friendId: user.id, status: 'ACCEPTED' },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        friend: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return friends.map((f) => ({
      id: f.userId === user.id ? f.friend.id : f.user.id,
      name: f.userId === user.id ? f.friend.name : f.user.name,
      image:
        f.userId === user.id
          ? f.friend.image ?? undefined
          : f.user.image ?? undefined,
    }));
  } catch (error) {
    console.log('Error fetching user friends:', error);
    return [];
  }
}

export async function checkFriendshipStatus(friendId: string) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return { isFriend: false, status: 'ERROR', message: error };
    if (!user)
      return { isFriend: false, status: 'ERROR', message: 'User not found' };
    if (user.id === friendId) {
      return {
        isFriend: false,
        status: 'SELF',
        message: 'You are viewing your own profile',
      };
    }

    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: user.id, friendId },
          { userId: friendId, friendId: user.id },
        ],
      },
    });

    if (!friendship)
      return { isFriend: false, status: 'NONE', message: 'No relationship' };

    return {
      isFriend: friendship.status === 'ACCEPTED',
      status: friendship.status,
      message:
        friendship.status === 'ACCEPTED'
          ? 'You are friends'
          : 'Friend request pending',
    };
  } catch (error) {
    console.error('Error checking friendship status:', error);
    throw new Error('Failed to check friendship status');
  }
}

export async function getPendingFriendRequests() {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) throw new Error(error);
    if (!user) throw new Error('User not found');

    const requests = await prisma.friendship.findMany({
      where: {
        friendId: user.id,
        status: 'PENDING',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log('Fetched Friend Requests:', requests);

    if (!requests || requests.length === 0) return [];

   
    return requests.map((r) => ({
      id: r.id,
      sender: r.user?.name ?? '',
      name: r.user?.name ?? '',
      fromId: r.userId,
      fromName: r.user?.name ?? '',
      image: r.user?.image ?? undefined,
      status: r.status,
      createdAt:
        r.createdAt instanceof Date
          ? r.createdAt.toISOString()
          : String(r.createdAt),
    }));
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    return [];
  }
}

export async function sendFriendRequest(friendId: string) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) throw new Error(error);
    if (!user) throw new Error('User not found');
    if (user.id === friendId) {
      throw new Error('Cannot send friend request to yourself');
    }
    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: user.id, friendId },
          { userId: friendId, friendId: user.id },
        ],
      },
    });

    if (existing) {
      if (existing.status === 'PENDING')
        throw new Error('Friend request already pending');
      if (existing.status === 'ACCEPTED')
        throw new Error('You are already friends');
    }
    await prisma.friendship.create({
      data: {
        userId: user.id,
        friendId,
        status: 'PENDING',
      },
    });
    return { success: true, message: 'Friend request sent successfully' };
  } catch (error) {
    console.error('Error sending friend request:', error);
    throw new Error('Failed to send friend request');
  }
}

export async function acceptFriendRequest(requestId: string) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) throw new Error(error);
    if (!user) throw new Error('User not found');

    const friendship = await prisma.friendship.findUnique({
      where: { id: requestId },
    });

    if (
      !friendship ||
      friendship.friendId !== user.id ||
      friendship.status !== 'PENDING'
    )
      throw new Error('No pending friend request found from this user');

    await prisma.friendship.update({
      where: { id: requestId },
      data: { status: 'ACCEPTED' },
    });

    return { success: true };
  } catch (error) {
    console.error('Error accepting friend request:', error);
    throw new Error('Failed to accept friend request');
  }
}

export async function rejectFriendRequest(requestId: string) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) throw new Error(error);
    if (!user) throw new Error('User not found');

    const friendship = await prisma.friendship.findUnique({
      where: { id: requestId },
    });

    if (
      !friendship ||
      friendship.friendId !== user.id ||
      friendship.status !== 'PENDING'
    )
      throw new Error('No pending friend request found from this user');

    await prisma.friendship.delete({
      where: { id: requestId },
    });

    return { success: true };
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    throw new Error('Failed to reject friend request');
  }
}
