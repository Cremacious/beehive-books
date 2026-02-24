'use server';

import { auth } from '@clerk/nextjs/server';
import { cloudinary } from '@/lib/cloudinary';

type UploadFolder = 'covers' | 'avatars';

export async function generateUploadSignatureAction(folder: UploadFolder, entityId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const cloudFolder = folder === 'covers' ? 'hive-covers' : 'hive-avatars';
  const timestamp   = Math.round(Date.now() / 1000);

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, public_id: entityId, folder: cloudFolder },
    process.env.CLOUDINARY_API_SECRET!,
  );

  return {
    signature,
    timestamp,
    publicId:   entityId,
    cloudFolder,
    cloudName:  process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey:     process.env.CLOUDINARY_API_KEY!,
  };
}

export async function deleteImageAction(publicId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch {
  }
}
