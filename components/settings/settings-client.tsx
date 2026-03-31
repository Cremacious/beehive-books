'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { signOut, authClient } from '@/lib/auth-client';
import { Camera, Loader2, Trash2, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
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
  hasPasswordAccount: boolean;
}

export function SettingsClient({ user, hasPasswordAccount }: SettingsClientProps) {
  const { upload, uploading } = useCloudinaryUpload('avatars', user.id);
  const [imageUrl, setImageUrl] = useState(user.image);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [bio, setBio] = useState(user.bio ?? '');
  const [bioSaving, setBioSaving] = useState(false);
  const [bioSuccess, setBioSuccess] = useState(false);
  const [bioError, setBioError] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

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

  async function handleChangePassword() {
    setPasswordError('');
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      return;
    }
    setPasswordSaving(true);
    const result = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: false,
    });
    setPasswordSaving(false);
    if (result.error) {
      setPasswordError(result.error.message ?? 'Failed to change password.');
    } else {
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
      setTimeout(() => setPasswordSuccess(false), 3000);
    }
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
          <div className="px-5 py-4 space-y-1.5">
            <label className="block text-base font-medium text-white">
              Bio <span className="text-white/80 text-sm font-normal">(optional)</span>
            </label>
            <p className="text-sm text-white/80">A short intro — who you are, what you write.</p>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={200}
              rows={3}
              placeholder="Tell the community a little about yourself..."
              className="w-full rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-4 py-3 text-base text-white placeholder-white/30 resize-none focus:outline-none focus:ring-1 focus:ring-[#FFC300]/30 transition-colors"
            />
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/80">{bio.length} / 200</span>
              <div className="flex items-center gap-2">
                {bioSuccess && <span className="text-sm text-white/80">Saved</span>}
                {bioError && <span className="text-sm text-white/80">{bioError}</span>}
                <button
                  onClick={handleSaveBio}
                  disabled={bioSaving}
                  className="text-sm px-3 py-1.5 rounded-lg bg-[#FFC300] text-black font-semibold hover:bg-[#FFD040] disabled:opacity-50 transition-colors"
                >
                  {bioSaving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </div>
          </div>
          {hasPasswordAccount ? (
            <div className="px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className="w-4 h-4 text-white/40 shrink-0" />
                  <div>
                    <p className="text-xs text-white/50">Password</p>
                    <p className="text-sm text-white/40">••••••••</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPasswordForm((v) => !v)}
                  className="text-xs text-[#FFC300]/70 hover:text-[#FFC300] transition-colors"
                >
                  {showPasswordForm ? 'Cancel' : 'Change'}
                </button>
              </div>

              {showPasswordForm && (
                <div className="mt-4 space-y-3">
                  <div className="relative">
                    <input
                      type={showCurrentPw ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Current password"
                      className="w-full rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-4 py-3 pr-11 text-base text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#FFC300]/30 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                      tabIndex={-1}
                    >
                      {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showNewPw ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New password"
                      className="w-full rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-4 py-3 pr-11 text-base text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#FFC300]/30 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                      tabIndex={-1}
                    >
                      {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-4 py-3 text-base text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#FFC300]/30 transition-colors"
                  />
                  {passwordError && (
                    <p className="text-sm text-white/80 bg-white/5 border border-white/10 rounded-lg px-3 py-2">{passwordError}</p>
                  )}
                  {passwordSuccess && (
                    <p className="text-sm text-green-400 bg-green-900/20 border border-green-500/20 rounded-lg px-3 py-2">Password changed successfully.</p>
                  )}
                  <button
                    onClick={handleChangePassword}
                    disabled={passwordSaving || !currentPassword || !newPassword || !confirmPassword}
                    className="w-full py-3 rounded-full bg-[#FFC300] text-black text-base font-bold hover:bg-[#FFD040] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {passwordSaving ? 'Saving...' : 'Update Password'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 px-5 py-4">
              <Lock className="w-4 h-4 text-white/40 shrink-0" />
              <div>
                <p className="text-xs text-white/50">Password</p>
                <p className="text-xs text-white/30 mt-0.5">Signed in with Google</p>
              </div>
            </div>
          )}
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
                <p className="text-sm text-white/80 mb-3 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                  {uploadError}
                </p>
              )}
              {uploadSuccess && (
                <p className="text-sm text-green-400 mb-3 bg-green-950/30 border border-green-800/30 rounded-lg px-3 py-2">
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

      {/* Section 5 — Legal */}
      <div>
        <h2 className="text-sm font-semibold text-white/80 mainFont mb-3">Legal</h2>
        <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] px-6 py-4">
          <p className="text-sm">
            <Link href="/terms" className="text-yellow-500 hover:text-white transition-colors">Terms of Service</Link>
            <span className="text-white/80"> · </span>
            <Link href="/privacy" className="text-yellow-500 hover:text-white transition-colors">Privacy Policy</Link>
            <span className="text-white/80"> · </span>
            <Link href="/cookies" className="text-yellow-500 hover:text-white transition-colors">Cookie Policy</Link>
            <span className="text-white/80"> · </span>
            <Link href="/dmca" className="text-yellow-500 hover:text-white transition-colors">DMCA</Link>
          </p>
        </div>
      </div>

      {/* Section 6 — Danger Zone */}
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
