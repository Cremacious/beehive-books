'use server';

import prisma from '../prisma';
import { getAuthenticatedUser } from '../types/server-utils';

export async function checkFriendshipStatus(friendId: string) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) throw new Error(error);
    if (!user) throw new Error('User not found');
    if (user.id === friendId) {
      return { isFriend: true, message: 'You are viewing your own profile' };
    }

    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: user.id, friendId },
          { userId: friendId, friendId: user.id },
        ],
      },
    });

    if (friendship) {
      return { isFriend: true, message: 'You are friends' };
    } else {
      return { isFriend: false, message: 'You are not friends' };
    }
  } catch (error) {
    console.error('Error checking friendship status:', error);
    throw new Error('Failed to check friendship status');
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
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: user.id, friendId },
          { userId: friendId, friendId: user.id },
        ],
      },
    });

    if (existingFriendship) {
      throw new Error(
        'Friend request already exists or you are already friends'
      );
    }
    await prisma.friendship.create({
      data: {
        userId: user.id,
        friendId,
      },
    });

    return { success: true, message: 'Friend request sent successfully' };
  } catch (error) {
    console.error('Error sending friend request:', error);
    throw new Error('Failed to send friend request');
  }
}
