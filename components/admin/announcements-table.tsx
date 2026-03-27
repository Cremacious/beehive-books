'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Megaphone, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ConfirmDeleteDialog from '@/components/admin/confirm-delete-dialog';
import {
  createAnnouncementAction,
  deleteAnnouncementAdminAction,
  toggleAnnouncementActiveAction,
} from '@/lib/actions/admin.actions';
import type { AnnouncementItem, AnnouncementType } from '@/lib/actions/admin.actions';

const TYPE_OPTIONS: { value: AnnouncementType; label: string }[] = [
  { value: 'new_feature', label: 'New Feature' },
  { value: 'coming_soon', label: 'Coming Soon' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'community_update', label: 'Community Update' },
];

const TYPE_BADGE: Record<AnnouncementType, string> = {
  new_feature: 'bg-[#FFC300]/15 text-yellow-500',
  coming_soon: 'bg-white/10 text-white/80',
  maintenance: 'bg-white/10 text-white/80',
  community_update: 'bg-white/10 text-white/80',
};

interface Props {
  announcements: AnnouncementItem[];
}

export default function AnnouncementsTable({ announcements }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [, startToggling] = useTransition();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<AnnouncementType>('community_update');
  const [link, setLink] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [createError, setCreateError] = useState('');

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, startDeleting] = useTransition();

  function handleCreate() {
    setCreateError('');
    startTransition(async () => {
      const result = await createAnnouncementAction(title, content, type, link || undefined, isActive);
      if (result.success) {
        setTitle('');
        setContent('');
        setType('community_update');
        setLink('');
        setIsActive(true);
        router.refresh();
      } else {
        setCreateError(result.message);
      }
    });
  }

  function handleDelete(id: string) {
    startDeleting(async () => {
      await deleteAnnouncementAdminAction(id);
      setDeleteId(null);
      router.refresh();
    });
  }

  function handleToggle(id: string) {
    setTogglingId(id);
    startToggling(async () => {
      await toggleAnnouncementActiveAction(id);
      setTogglingId(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      {/* Create form */}
      <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] p-6">
        <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-[#FFC300]" />
          New Announcement
        </h2>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-white/80 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Announcement title"
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FFC300]/40"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/80 mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as AnnouncementType)}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFC300]/40"
            >
              {TYPE_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/80 mb-1">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Announcement content..."
              rows={4}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FFC300]/40 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/80 mb-1">
              Link <span className="font-normal text-white/80">(optional — shown as a button on the announcement)</span>
            </label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://..."
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FFC300]/40"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-[#2a2a2a]"
            />
            <span className="text-xs text-white/80">Active — shown to users</span>
          </label>

          {createError && <p className="text-xs text-red-400">{createError}</p>}

          <Button
            onClick={handleCreate}
            disabled={isPending || !title.trim() || !content.trim()}
            className="bg-[#FFC300] text-black hover:bg-[#FFD040] font-semibold"
          >
            {isPending ? 'Posting...' : 'Post Announcement'}
          </Button>
        </div>
      </div>

      {/* List */}
      <div>
        <h2 className="text-base font-semibold text-white mb-4">
          All Announcements ({announcements.length})
        </h2>
        {announcements.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#2a2a2a] py-12 text-center">
            <p className="text-sm text-white/80">No announcements yet.</p>
          </div>
        ) : (
          <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] divide-y divide-[#2a2a2a] overflow-hidden">
            {announcements.map((a) => (
              <div key={a.id} className="flex items-start gap-4 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${TYPE_BADGE[a.type]}`}
                    >
                      {TYPE_OPTIONS.find((t) => t.value === a.type)?.label ?? a.type}
                    </span>
                    {!a.isActive && (
                      <span className="text-[11px] text-white/80 bg-white/5 px-2 py-0.5 rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-white">{a.title}</p>
                  <p className="text-xs text-white/80 mt-0.5 leading-relaxed line-clamp-2">
                    {a.content}
                  </p>
                  {a.link && (
                    <p className="text-xs text-yellow-500 mt-1 truncate">{a.link}</p>
                  )}
                  <p className="text-xs text-white/80 mt-1.5">
                    {new Date(a.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                    {a.createdBy?.username && (
                      <span className="ml-1">· by @{a.createdBy.username}</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggle(a.id)}
                    disabled={togglingId === a.id}
                    className="text-white/80 hover:text-white transition-colors disabled:opacity-50"
                    aria-label={a.isActive ? 'Deactivate' : 'Activate'}
                    title={a.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {a.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setDeleteId(a.id)}
                    className="text-white/80 hover:text-red-400 transition-colors mt-0.5"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDeleteDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Delete Announcement"
        description="This will permanently remove the announcement from the feed."
        loading={isDeleting}
      />
    </div>
  );
}
