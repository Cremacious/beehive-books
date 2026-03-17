'use client';

import { useState } from 'react';
import Image from 'next/image';
import { signOut } from '@/lib/auth-client';
import { Camera, Loader2, Trash2, User, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeleteDialog } from '@/components/shared/delete-dialog';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { PremiumStatusCard } from '@/components/settings/premium-status-card';
import { useCloudinaryUpload } from '@/hooks/use-cloudinary-upload';
import {
  updateUserAvatarAction,
  deleteUserAccountAction,
} from '@/lib/actions/user.actions';

interface SettingsClientProps {
  user: {
    id: string;
    username: string | null;
    email: string;
    image: string | null;
    premium: boolean;
    stripeCurrentPeriodEnd: Date | null;
  };
}

export function SettingsClient({ user }: SettingsClientProps) {
  const { upload, uploading } = useCloudinaryUpload('avatars', user.id);
  const [imageUrl, setImageUrl] = useState(user.image);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    setUploadSuccess(false);

    const url = await upload(file);
    if (!url) {
      setUploadError('Upload failed. Please try again.');
      return;
    }

    const result = await updateUserAvatarAction(url);
    if (!result.success) {
      setUploadError(result.message);
    } else {
      setImageUrl(url);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    }

    e.target.value = '';
  }

  const initial =
    user.username?.[0]?.toUpperCase() ?? user.email[0]?.toUpperCase() ?? '?';

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] divide-y divide-[#2a2a2a]">
        <div className="flex items-center gap-3 px-5 py-4">
          <User className="w-4 h-4 text-white/80 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-white/80 mb-0.5">Username</p>
            <p className="text-sm text-white font-medium truncate">
              {user.username ?? '—'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-5 py-4">
          <Mail className="w-4 h-4 text-white/80 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-white/80 mb-0.5">Email</p>
            <p className="text-sm text-white font-medium truncate">
              {user.email}
            </p>
          </div>
        </div>
      </div>
      <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] p-6">
        <h2 className="text-xs font-semibold text-white/80 uppercase tracking-wider mb-5">
          Profile Photo
        </h2>

        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-[#1e1e1e] border-2 border-[#FFC300]/20 shrink-0">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={user.username ?? 'Avatar'}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#2a2000]">
                <span className="text-2xl font-bold text-[#FFC300]">
                  {initial}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm text-white/80 mb-3 leading-relaxed">
              JPEG, PNG or WebP. Max 5 MB.
            </p>

            {uploadError && (
              <p className="text-xs text-red-400 mb-3 bg-red-950/30 border border-red-800/30 rounded-lg px-3 py-2">
                {uploadError}
              </p>
            )}
            {uploadSuccess && (
              <p className="text-xs text-green-400 mb-3 bg-green-950/30 border border-green-800/30 rounded-lg px-3 py-2">
                Photo updated!
              </p>
            )}

            <label className="cursor-pointer inline-block">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={handleFileChange}
                disabled={uploading}
              />
              <Button
                variant="secondary"
                size="sm"
                disabled={uploading}
                asChild
              >
                <span>
                  {uploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Uploading…
                    </>
                  ) : (
                    <>
                      <Camera className="w-3.5 h-3.5" />
                      Change Photo
                    </>
                  )}
                </span>
              </Button>
            </label>
          </div>
        </div>
      </div>
      <PremiumStatusCard
        premium={user.premium}
        stripeCurrentPeriodEnd={user.stripeCurrentPeriodEnd}
      />

      <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] p-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-white">Language</p>
          <p className="text-xs text-white/60 mt-0.5">
            Choose your preferred language
          </p>
        </div>
        <LocaleSwitcher />
      </div>

      <div className="rounded-2xl bg-[#252525] border border-red-900/25 p-6">
        <h2 className="text-xs font-semibold text-red-400/60 uppercase tracking-wider mb-2">
          Danger Zone
        </h2>
        <p className="text-sm text-white/80 mb-5 leading-relaxed">
          Permanently deletes your account and all associated data — books,
          reading lists, clubs, hives, and prompts. This cannot be undone.
        </p>
        <DeleteDialog
          itemType="account"
          onDelete={async () => {
            const result = await deleteUserAccountAction();
            if (!result.success) throw new Error(result.message);
            await signOut({
              fetchOptions: {
                onSuccess: () => {
                  window.location.href = '/';
                },
              },
            });
          }}
          trigger={
            <Button variant="destructive" size="sm" type="button">
              <Trash2 className="w-3.5 h-3.5" />
              Delete Account
            </Button>
          }
        />
      </div>
    </div>
  );
}
