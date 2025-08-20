'use client';
import { useState } from 'react';
import { uploadUserImage } from '../../lib/actions/user.actions';
import { toast } from 'sonner';
import Image from 'next/image';
import { Button } from '../ui/button';
import defaultProfileImage from '@/assets/stock/stockProfile.png';
export default function ImageUpload({ image }: { image?: string | null }) {
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function resizeAndConvertToBase64(
    file: File,
    maxWidth = 1600,
    maxBytes = 700 * 1024
  ) {
    if (file.size <= maxBytes) {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });
    }

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = (e) => reject(e);
      r.readAsDataURL(file);
    });

    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = document.createElement('img') as HTMLImageElement;
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Image failed to load'));
      image.src = dataUrl;
    });

    const ratio = Math.min(1, maxWidth / img.width);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * ratio);
    canvas.height = Math.round(img.height * ratio);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    let quality = 0.9;
    let blob: Blob | null = null;
    while (quality >= 0.35) {
      blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/jpeg', quality)
      );
      if (!blob) break;
      if (blob.size <= maxBytes) break;
      quality -= 0.1;
    }

    if (!blob) throw new Error('Image compression failed');

    return new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = (e) => reject(e);
      r.readAsDataURL(blob as Blob);
    });
  }

  function onCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setCoverPreview(null);
      setCoverFile(null);
    }
  }

  async function onUploadClick() {
    if (!coverFile) {
      toast.error('Please choose a file first');
      return;
    }

    try {
      setIsUploading(true);
   
      if (coverFile.size > 12 * 1024 * 1024) {
        toast.error('Image too large (max 12MB)');
        setIsUploading(false);
        return;
      }

      const base64 = await resizeAndConvertToBase64(
        coverFile,
        1600,
        700 * 1024
      );

      const saved = await uploadUserImage(base64);

      setCoverPreview(saved);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('user:image:updated', { detail: { image: saved } })
        );
      }
      toast.success('Profile image updated');
    } catch (err: any) {
      console.error('Upload failed', err);
      toast.error(err?.message ?? 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div>
      <form onSubmit={(e) => e.preventDefault()} className="w-full">
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 w-full">
          {/* Controls (left on desktop, top on mobile) */}
          <div className="flex-1 min-w-0 flex items-center gap-3">
            <input
              id="user-image-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onCoverChange}
            />

            <label
              htmlFor="user-image-input"
              className="inline-flex items-center gap-2 px-4 py-2 border border-slate-700 rounded-md text-sm font-medium text-slate-800 bg-white/95 hover:bg-white cursor-pointer shadow-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="w-4 h-4 text-slate-700"
              >
                <path
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 15a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4V8a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v7z"
                />
                <path
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 11l2 2 4-4"
                />
              </svg>
              <span>Choose file</span>
            </label>

            <div className="truncate text-sm text-white max-w-[45%]">
              {coverFile?.name ?? 'No file selected'}
            </div>

            <div className="ml-auto md:ml-0">
              <Button
                type="button"
                onClick={onUploadClick}
                disabled={isUploading || !coverFile}
                className="px-4 py-2 bg-yellow-400 text-white rounded-md shadow-md hover:brightness-95 disabled:opacity-60"
              >
                {isUploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </div>

          {/* Preview (right on desktop, bottom on mobile) */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-yellow-400 shadow-sm bg-yellow-50 flex items-center justify-center">
              {coverPreview ? (
                <Image
                  src={coverPreview}
                  alt="Preview"
                  className="object-cover w-full h-full"
                  width={112}
                  height={112}
                />
              ) : (
                  <Image
                  src={image ?? defaultProfileImage}
                  alt="Preview"
                  className="object-cover w-full h-full"
                  width={112}
                  height={112}
                />
              )}
            </div>
          </div>
        </div>

        <p className="mt-3 text-xs text-white">
          Allowed formats: JPG, PNG. Max 12MB. We will resize and compress
          automatically.
        </p>
      </form>
    </div>
  );
}
