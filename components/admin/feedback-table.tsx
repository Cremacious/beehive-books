'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, MessageSquarePlus, Mail } from 'lucide-react';
import ConfirmDeleteDialog from '@/components/admin/confirm-delete-dialog';
import {
  deleteFeedbackAdminAction,
  updateFeedbackStatusAction,
} from '@/lib/actions/feedback.actions';
import type { FeedbackItem, FeedbackStatus } from '@/lib/actions/feedback.actions';

const CATEGORY_LABELS: Record<FeedbackItem['category'], string> = {
  feature_request: 'Feature Request',
  bug_report: 'Bug Report',
  general: 'General Feedback',
  content_concern: 'Content Concern',
};

const CATEGORY_CLASS: Record<FeedbackItem['category'], string> = {
  feature_request: 'bg-[#FFC300]/10 text-yellow-500',
  bug_report: 'bg-white/10 text-white/80',
  general: 'bg-white/10 text-white/80',
  content_concern: 'bg-white/10 text-white/80',
};

const STATUS_LABELS: Record<FeedbackStatus, string> = {
  pending: 'Pending',
  reviewed: 'Reviewed',
  in_progress: 'In Progress',
  shipped: 'Shipped',
  declined: 'Declined',
};

const STATUS_CLASS: Record<FeedbackStatus, string> = {
  pending: 'bg-white/10 text-white/80',
  reviewed: 'bg-white/10 text-white/80',
  in_progress: 'bg-[#FFC300]/10 text-yellow-500',
  shipped: 'bg-white/20 text-white',
  declined: 'bg-white/5 text-white/80',
};

const FILTER_TABS: { label: string; value?: FeedbackStatus }[] = [
  { label: 'All' },
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Shipped', value: 'shipped' },
];

interface Props {
  items: FeedbackItem[];
  total: number;
  currentStatus?: FeedbackStatus;
  currentPage: number;
}

export default function FeedbackTable({ items, total, currentStatus, currentPage }: Props) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, startDeleting] = useTransition();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [, startUpdating] = useTransition();

  function handleDelete(id: string) {
    startDeleting(async () => {
      await deleteFeedbackAdminAction(id);
      setDeleteId(null);
      router.refresh();
    });
  }

  function handleStatusChange(id: string, status: FeedbackStatus) {
    setUpdatingId(id);
    startUpdating(async () => {
      await updateFeedbackStatusAction(id, status);
      setUpdatingId(null);
      router.refresh();
    });
  }

  function setFilter(value?: FeedbackStatus) {
    const params = new URLSearchParams();
    if (value) params.set('status', value);
    router.push(`/admin/feedback${params.toString() ? '?' + params.toString() : ''}`);
  }

  return (
    <>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {FILTER_TABS.map(({ label, value }) => (
          <button
            key={label}
            onClick={() => setFilter(value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              currentStatus === value
                ? 'bg-[#FFC300] text-black'
                : 'bg-[#1e1e1e] border border-[#2a2a2a] text-white/80 hover:text-white hover:border-[#FFC300]/30'
            }`}
          >
            {label}
          </button>
        ))}
        <span className="ml-auto text-xs text-white/80 self-center">{total} total</span>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#2a2a2a] py-16 text-center">
          <MessageSquarePlus className="w-8 h-8 text-white/20 mx-auto mb-3" />
          <p className="text-sm text-white/80">No feedback submissions.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] divide-y divide-[#2a2a2a] overflow-hidden">
          {items.map((item) => (
            <div key={item.id} className="px-5 py-4 flex items-start gap-4">
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Category badge */}
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${CATEGORY_CLASS[item.category]}`}
                  >
                    {CATEGORY_LABELS[item.category]}
                  </span>

                  {/* Status badge */}
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_CLASS[item.status]}`}
                  >
                    {STATUS_LABELS[item.status]}
                  </span>

                  {/* User */}
                  <span className="text-[11px] text-white/80">
                    {item.user?.username ? `@${item.user.username}` : 'Anonymous'}
                  </span>

                  {item.email && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-white/80">
                      <Mail className="w-3 h-3" />
                      {item.email}
                    </span>
                  )}

                  <span className="text-[11px] text-white/80 ml-auto shrink-0">
                    {new Date(item.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap wrap-break-word">
                  {item.content}
                </p>

                {/* Status dropdown */}
                <select
                  value={item.status}
                  disabled={updatingId === item.id}
                  onChange={(e) => handleStatusChange(item.id, e.target.value as FeedbackStatus)}
                  className="text-xs bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-2 py-1 text-white/80 focus:outline-none focus:border-[#FFC300]/40 disabled:opacity-50"
                >
                  {(Object.keys(STATUS_LABELS) as FeedbackStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setDeleteId(item.id)}
                className="shrink-0 text-white/80 hover:text-red-400 transition-colors mt-0.5"
                aria-label="Delete feedback"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDeleteDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Delete Feedback"
        description="This will permanently remove this feedback submission."
        loading={isDeleting}
      />
    </>
  );
}
