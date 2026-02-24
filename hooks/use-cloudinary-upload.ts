'use client';

import { useState } from 'react';
import { generateUploadSignatureAction } from '@/lib/actions/cloudinary.actions';

type UploadFolder = 'covers' | 'avatars';

export function useCloudinaryUpload(folder: UploadFolder, entityId: string) {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl]   = useState<string | null>(null);

  async function upload(file: File): Promise<string | null> {
    setUploading(true);
    try {
      const { signature, timestamp, publicId, cloudFolder, cloudName, apiKey } =
        await generateUploadSignatureAction(folder, entityId);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', String(timestamp));
      formData.append('signature', signature);
      formData.append('public_id', publicId);
      formData.append('folder', cloudFolder);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData },
      );

      if (!res.ok) throw new Error('Upload failed');

      const data = await res.json() as { secure_url: string };
      setImageUrl(data.secure_url);
      return data.secure_url;
    } catch (err) {
      console.error('Cloudinary upload error:', err);
      return null;
    } finally {
      setUploading(false);
    }
  }

  return { upload, uploading, imageUrl, setImageUrl };
}
