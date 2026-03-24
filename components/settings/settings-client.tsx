'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { signOut } from '@/lib/auth-client';
import { Camera, Loader2, Trash2, User, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeleteDialog } from '@/components/shared/delete-dialog';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { PremiumStatusCard } from '@/components/settings/premium-status-card';
import { useCloudinaryUpload } from '@/hooks/use-cloudinary-upload';
import {
  updateUserAvatarAction,
  updateUserBioAction,
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
    bio: string | null;
  };
}

export function SettingsClient({ user }: SettingsClientProps) {
  const { upload, uploading } = useCloudinaryUpload('avatars', user.id);
  const [imageUrl, setImageUrl] = useState(user.image);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [bio, setBio] = useState(user.bio ?? '');
  const [bioSaving, setBioSaving] = useState(false);
  const [bioSuccess, setBioSuccess] = useState(false);
  const [bioError, setBioError] = useState('');

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

  async function handleSaveBio() {
    setBioSaving(true);
    setBioError('');
    setBioSuccess(false);
    const result = await updateUserBioAction(bio);
    if (!result.success) {
      setBioError(result.message ?? 'Failed to save bio.');
    } else {
      setBioSuccess(true);
      setTimeout(() => setBioSuccess(false), 3000);
    }
    setBioSaving(false);
  }

  const initial =
    user.username?.[0]?.toUpperCase() ?? user.email[0]?.toUpperCase() ?? '?';

  return (
    <div className="space-y-5">
      {/* Section 1 — Account */}
      <div>
        <h2 className="text-sm font-semibold text-white mainFont mb-3">Account</h2>
        <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] divide-y divide-[#2a2a2a]">
          <div className="flex items-center gap-3 px-5 py-4">
            <User className="w-4 h-4 text-white/40 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-white/50 mb-0.5">Username</p>
              <p className="text-sm text-white font-medium truncate">
                {user.username ?? '—'}
              </p>
            </div>
            <span className="text-white/40 text-xs shrink-0">(not editable yet)</span>
          </div>
          <div className="flex items-center gap-3 px-5 py-4">
            <Mail className="w-4 h-4 text-white/40 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-white/50 mb-0.5">Email</p>
              <p className="text-sm text-white font-medium truncate">
                {user.email}
              </p>
            </div>
          </div>
          <div className="px-5 py-4 space-y-2">
            <label className="block text-xs text-white/50 mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={200}
              rows={3}
              placeholder="Tell the community a little about yourself..."
              className="w-full rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-4 py-3 text-sm text-white placeholder-white/30 resize-none focus:outline-none focus:ring-1 focus:ring-[#FFC300]/30 transition-colors"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/30">{bio.length}/200</span>
              <div className="flex items-center gap-2">
                {bioSuccess && <span className="text-xs text-green-400">Saved</span>}
                {bioError && <span className="text-xs text-red-400">{bioError}</span>}
                <button
                  onClick={handleSaveBio}
                  disabled={bioSaving}
                  className="text-xs px-3 py-1.5 rounded-lg bg-[#FFC300] text-black font-semibold hover:bg-[#FFD040] disabled:opacity-50 transition-colors"
                >
                  {bioSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-5 py-4">
            <Lock className="w-4 h-4 text-white/40 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-white/50 mb-0.5">Password</p>
              <p className="text-sm text-white/50">••••••••</p>
            </div>
            <Link
              href="/forgot-password"
              className="text-xs text-[#FFC300]/70 hover:text-[#FFC300] transition-colors shrink-0"
            >
              Change
            </Link>
          </div>
        </div>
      </div>

      {/* Section 2 — Profile Photo */}
      <div>
        <h2 className="text-sm font-semibold text-white mainFont mb-3">Profile Photo</h2>
        <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] p-6">
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
      </div>

      {/* Section 3 — Subscription */}
      <div>
        <h2 className="text-sm font-semibold text-white mainFont mb-3">Subscription</h2>
        <PremiumStatusCard
          premium={user.premium}
          stripeCurrentPeriodEnd={user.stripeCurrentPeriodEnd}
        />
      </div>

      {/* Section 4 — Preferences */}
      <div>
        <h2 className="text-sm font-semibold text-white mainFont mb-3">Preferences</h2>
        <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-white">Language</p>
            <p className="text-xs text-white/50 mt-0.5">
              Choose your preferred language
            </p>
          </div>
          <LocaleSwitcher />
        </div>
      </div>

      {/* Section 5 — Danger Zone */}
      <div>
        <h2 className="text-sm font-semibold text-red-400 mainFont mb-3">Danger Zone</h2>
        <div className="rounded-2xl bg-[#252525] border border-red-900/25 p-6">
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
    </div>
  );
}
