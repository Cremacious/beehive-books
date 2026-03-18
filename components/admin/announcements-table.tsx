'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ConfirmDeleteDialog from '@/components/admin/confirm-delete-dialog';
import {
  createAnnouncementAction,
  deleteAnnouncementAdminAction,
} from '@/lib/actions/admin.actions';
import type { AnnouncementItem } from '@/lib/actions/admin.actions';

interface Props {
  announcements: AnnouncementItem[];
}

export default function AnnouncementsTable({ announcements }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [createError, setCreateError] = useState('');

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, startDeleting] = useTransition();

  function handleCreate() {
    setCreateError('');
    startTransition(async () => {
      const result = await createAnnouncementAction(title, content);
      if (result.success) {
        setTitle('');
        setContent('');
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

  return (
    <div className="space-y-8">

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
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/80 focus:outline-none focus:border-[#FFC300]/40"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/80 mb-1">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Announcement content…"
              rows={4}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/80 focus:outline-none focus:border-[#FFC300]/40 resize-none"
            />
          </div>
          {createError && <p className="text-xs text-red-400">{createError}</p>}
          <Button
            onClick={handleCreate}
            disabled={isPending || !title.trim() || !content.trim()}
            className="bg-[#FFC300] text-black hover:bg-[#FFD040] font-semibold"
          >
            {isPending ? 'Posting…' : 'Post Announcement'}
          </Button>
        </div>
      </div>


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
                  <p className="text-sm font-semibold text-white">{a.title}</p>
                  <p className="text-xs text-white/80 mt-0.5 leading-relaxed line-clamp-2">
                    {a.content}
                  </p>
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
                <button
                  onClick={() => setDeleteId(a.id)}
                  className="shrink-0 text-white/80 hover:text-red-400 transition-colors mt-0.5"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
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
