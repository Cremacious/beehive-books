'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, MessageSquarePlus, Mail, Tag } from 'lucide-react';
import ConfirmDeleteDialog from '@/components/admin/confirm-delete-dialog';
import { deleteFeedbackAdminAction } from '@/lib/actions/feedback.actions';
import type { FeedbackItem } from '@/lib/actions/feedback.actions';

const typeLabels: Record<FeedbackItem['type'], string> = {
  content_suggestion: 'Content Suggestion',
  general_feedback: 'General Feedback',
  technical_support: 'Technical Support',
};

const typeBadgeClass: Record<FeedbackItem['type'], string> = {
  content_suggestion: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  general_feedback: 'bg-[#FFC300]/10 text-[#FFC300] border-[#FFC300]/20',
  technical_support: 'bg-red-500/10 text-red-400 border-red-500/20',
};

interface Props {
  items: FeedbackItem[];
}

export default function FeedbackTable({ items }: Props) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, startDeleting] = useTransition();

  function handleDelete(id: string) {
    startDeleting(async () => {
      await deleteFeedbackAdminAction(id);
      setDeleteId(null);
      router.refresh();
    });
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#2a2a2a] py-16 text-center">
        <MessageSquarePlus className="w-8 h-8 text-white/20 mx-auto mb-3" />
        <p className="text-sm text-white/40">No feedback submissions yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] divide-y divide-[#2a2a2a] overflow-hidden">
        {items.map((item) => (
          <div key={item.id} className="px-5 py-4 flex items-start gap-4">
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${typeBadgeClass[item.type]}`}
                >
                  <Tag className="w-3 h-3" />
                  {typeLabels[item.type]}
                </span>
                {item.email && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-white/50">
                    <Mail className="w-3 h-3" />
                    {item.email}
                  </span>
                )}
                <span className="text-[11px] text-white/30 ml-auto shrink-0">
                  {new Date(item.createdAt).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap break-words">
                {item.content}
              </p>
            </div>
            <button
              onClick={() => setDeleteId(item.id)}
              className="shrink-0 text-white/30 hover:text-red-400 transition-colors mt-0.5"
              aria-label="Delete feedback"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

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
