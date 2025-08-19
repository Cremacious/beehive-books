'use server';

import prisma from '../prisma';
import { getAuthenticatedUser } from '../types/server-utils';

export async function uploadUserImage(imageBase64: string) {
  // Ensure caller provided a value
  if (!imageBase64) throw new Error('No image provided');

  // Validate the base64 string format (data URL)
  if (!/^data:image\/[a-zA-Z]+;base64,/.test(imageBase64)) {
    throw new Error('Invalid base64 image format');
  }

  const { user, error } = await getAuthenticatedUser();
  if (error) throw new Error(error);
  if (!user) throw new Error('User not found');

  // Store the base64 data URL directly on the user.image string column.
  const imageUrl = imageBase64;

  await prisma.user.update({
    where: { id: user.id },
    data: { image: imageUrl },
  });

  return imageUrl;
}
