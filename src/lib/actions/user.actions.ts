'use server';

import prisma from '../prisma';
import { getAuthenticatedUser } from '../types/server-utils';

export async function uploadUserImage(imageBase64: string) {
  if (!imageBase64) throw new Error('No image provided');
  if (!/^data:image\/[a-zA-Z]+;base64,/.test(imageBase64)) {
    throw new Error('Invalid base64 image format');
  }

  const { user, error } = await getAuthenticatedUser();
  if (error) throw new Error(error);
  if (!user) throw new Error('User not found');
  const imageUrl = imageBase64;

  await prisma.user.update({
    where: { id: user.id },
    data: { image: imageUrl },
  });

  return imageUrl;
}

export async function getDatabaseUserById(userId: string) {
  if (!userId) throw new Error('User ID is required');

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      friends: {
        include: {
          friend: true,
        },
      },
      friendOf: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!user) throw new Error('User not found');

  const friendUsers = [
    ...(user.friends ?? []).map((f: any) => f.friend),
    ...(user.friendOf ?? []).map((f: any) => f.user),
  ];

  const uniqueFriendsMap = new Map<string, any>();
  friendUsers.forEach((fu: any) => {
    if (!fu) return;
    uniqueFriendsMap.set(fu.id, {
      id: String(fu.id),
      name: fu.name,
      image: fu.image ?? undefined,
      bio: fu.bio ?? undefined,
      createdAt:
        fu.createdAt instanceof Date
          ? fu.createdAt.toISOString()
          : fu.createdAt,
    });
  });
  const friends = Array.from(uniqueFriendsMap.values());

  return {
    id: user.id,
    name: user.name,
    image: user.image ?? undefined,
    bio: user.bio ?? undefined,
    createdAt:
      user.createdAt instanceof Date
        ? user.createdAt.toISOString()
        : user.createdAt,
    updatedAt:
      user.updatedAt instanceof Date
        ? user.updatedAt.toISOString()
        : user.updatedAt,
    friends,
  };
}
