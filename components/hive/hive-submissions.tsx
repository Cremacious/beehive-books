'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { RichTextEditor } from '@/components/editor/rich-text-editor';
import {
  createSubmissionAction,
  approveSubmissionAction,
  rejectSubmissionAction,
  getHiveSubmissionsAction,
} from '@/lib/actions/hive-submissions.actions';
import type { HiveSubmissionWithAuthor, HiveRole } from '@/lib/types/hive.types';
import { ChevronDown, ChevronUp, Upload } from 'lucide-react';

interface SubmissionsData {
  pending: HiveSubmissionWithAuthor[];
  approved: HiveSubmissionWithAuthor[];
  rejected: HiveSubmissionWithAuthor[];
  myRole: HiveRole;
  currentUserId: string;
}

interface Props {
  hiveId: string;
  bookId: string | null;
  data: SubmissionsData;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function StatusBadge({ status }: { status: HiveSubmissionWithAuthor['status'] }) {
  if (status === 'PENDING') {
    return (
      <span className="text-xs font-medium px-2 py-0.5 rounded-full border bg-[#FFC300]/10 border-[#FFC300]/30 text-yellow-500">
        Pending
      </span>
    );
  }
  if (status === 'APPROVED') {
    return (
      <span className="text-xs font-medium px-2 py-0.5 rounded-full border bg-green-500/10 border-green-500/20 text-white">
        Approved
      </span>
    );
  }
  return (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full border bg-red-500/10 border-red-500/20 text-white">
      Rejected
    </span>
  );
}

function AuthorAvatar({ author }: { author: HiveSubmissionWithAuthor['author'] }) {
  return (
    <div className="w-7 h-7 rounded-full bg-[#252525] shrink-0 overflow-hidden ring-1 ring-[#2a2a2a]">
      {author.image ? (
        <Image src={author.image} alt={author.username ?? 'user'} width={28} height={28} className="object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-[10px] font-medium text-white/80">
          {(author.username ?? '?')[0].toUpperCase()}
        </div>
      )}
    </div>
  );
}

function SubmissionCard({
  submission,
  isMod,
  hiveId,
  bookId,
  onApprove,
  onReject,
}: {
  submission: HiveSubmissionWithAuthor;
  isMod: boolean;
  hiveId: string;
  bookId: string | null;
  onApprove?: (id: string) => void;
  onReject?: (id: string, note: string) => void;
}) {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectNote, setRejectNote] = useState('');

  const plainText = stripHtml(submission.content);
  const preview = plainText.slice(0, 150);
  const hasMore = plainText.length > 150;

  return (
    <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <AuthorAvatar author={submission.author} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-white">
              {submission.author.username ?? 'Unknown'}
            </span>
            <span className="text-xs text-white/80">{timeAgo(submission.createdAt)}</span>
          </div>
          <h3 className="text-sm font-semibold text-white mt-0.5">{submission.title}</h3>
          <p className="text-xs text-white/80 mt-0.5">
            {submission.targetChapterOrder != null
              ? `For chapter ${submission.targetChapterOrder}`
              : 'No position specified'}
          </p>
        </div>
        <StatusBadge status={submission.status} />
      </div>

      {/* Content preview */}
      <div className="mb-3">
        <p className="text-sm text-white/80 leading-relaxed">
          {preview}{hasMore ? '…' : ''}
        </p>
        {hasMore && (
          <Link
            href={`/hive/${hiveId}/submissions/${submission.id}`}
            className="mt-1.5 inline-block text-xs text-yellow-500 hover:text-white transition-colors"
          >
            View Full
          </Link>
        )}
      </div>

      {/* Rejection note shown to submitter */}
      {submission.status === 'REJECTED' && submission.reviewNote && (
        <div className="mb-3 text-xs text-white/80 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          Note: {submission.reviewNote}
        </div>
      )}

      {/* Mod actions for pending */}
      {isMod && submission.status === 'PENDING' && (
        <div className="flex flex-col gap-2 pt-3 border-t border-[#2a2a2a]">
          {!showRejectForm ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onApprove?.(submission.id)}
                disabled={!bookId}
                className="px-3 py-1.5 rounded-lg bg-[#FFC300] text-black text-xs font-semibold hover:bg-[#FFC300]/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => setShowRejectForm(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1a1a1a] border border-[#2a2a2a] text-white/80 hover:text-white hover:border-[#333] transition-colors"
              >
                Reject
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <textarea
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                placeholder="Optional rejection reason..."
                rows={2}
                className="w-full px-3 py-2 rounded-lg bg-[#252525] border border-[#333] text-sm text-white/80 placeholder:text-white/80 resize-none focus:outline-none focus:border-yellow-500/40"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { onReject?.(submission.id, rejectNote); setShowRejectForm(false); setRejectNote(''); }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 border border-red-500/20 text-white hover:bg-red-500/20 transition-colors"
                >
                  Confirm Reject
                </button>
                <button
                  type="button"
                  onClick={() => { setShowRejectForm(false); setRejectNote(''); }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1a1a1a] border border-[#2a2a2a] text-white/80 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CollapsibleSection({
  title,
  count,
  children,
  defaultOpen = false,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 mb-3 group"
      >
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        {count > 0 && (
          <span className="text-xs font-bold bg-[#252525] border border-[#2a2a2a] text-white/80 rounded-full px-1.5 py-0.5 leading-none">
            {count}
          </span>
        )}
        {open ? (
          <ChevronUp className="w-3.5 h-3.5 text-white/80" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-white/80" />
        )}
      </button>
      {open && children}
    </section>
  );
}

export default function HiveSubmissions({ hiveId, bookId, data: initialData }: Props) {
  const [data, setData] = useState(initialData);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetChapterOrder, setTargetChapterOrder] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isMod = data.myRole === 'OWNER' || data.myRole === 'MODERATOR';

  async function refreshData() {
    const fresh = await getHiveSubmissionsAction(hiveId);
    setData(fresh);
  }

  function resetForm() {
    setTitle('');
    setContent('');
    setTargetChapterOrder('');
    setFormError(null);
    setShowForm(false);
  }

  function handleSubmit() {
    setFormError(null);
    const order = targetChapterOrder ? parseInt(targetChapterOrder, 10) : null;
    if (targetChapterOrder && (isNaN(order!) || order! < 1)) {
      setFormError('Chapter position must be a positive number.');
      return;
    }
    startTransition(async () => {
      const result = await createSubmissionAction(hiveId, { title, content, targetChapterOrder: order });
      if (!result.success) {
        setFormError(result.message);
        return;
      }
      resetForm();
      await refreshData();
    });
  }

  function handleApprove(submissionId: string) {
    startTransition(async () => {
      await approveSubmissionAction(submissionId);
      await refreshData();
    });
  }

  function handleReject(submissionId: string, note: string) {
    startTransition(async () => {
      await rejectSubmissionAction(submissionId, note);
      await refreshData();
    });
  }

  return (
    <div className="max-w-3xl">
      {!bookId && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-white/80">
            This hive has no linked book. Submissions can be collected but chapters cannot be approved until a book is linked in{' '}
            <a href={`/hive/${hiveId}/settings`} className="text-yellow-500 hover:text-white transition-colors">
              hive settings
            </a>.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Submissions</h1>
          <p className="text-sm text-white/80 mt-0.5">
            {isMod
              ? 'Review chapter submissions from hive members.'
              : 'Submit a chapter for review.'}
          </p>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FFC300]/10 border border-[#FFC300]/20 text-yellow-500 text-sm font-medium hover:bg-[#FFC300]/15 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Submit Chapter
          </button>
        )}
      </div>

      {/* Submission form (members only) */}
      {showForm && (
        <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-2xl p-5 mb-6">
          <h2 className="text-sm font-semibold text-white mb-4">New Submission</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-white/80 mb-1.5">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Chapter title..."
                maxLength={120}
                className="w-full px-3 py-2 rounded-lg bg-[#1e1e1e] border border-[#2a2a2a] text-sm text-white placeholder:text-white/80 focus:outline-none focus:border-yellow-500/40"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/80 mb-1.5">
                Chapter Position
              </label>
              <input
                type="number"
                value={targetChapterOrder}
                onChange={(e) => setTargetChapterOrder(e.target.value)}
                placeholder="Leave blank for no preference"
                min={1}
                className="w-full px-3 py-2 rounded-lg bg-[#1e1e1e] border border-[#2a2a2a] text-sm text-white placeholder:text-white/80 focus:outline-none focus:border-yellow-500/40"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/80 mb-1.5">Content</label>
              <RichTextEditor content={content} onChange={setContent} />
            </div>

            {formError && <p className="text-xs text-white/80">{formError}</p>}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isPending || !title.trim() || !content.trim()}
                className="px-4 py-2 rounded-xl bg-[#FFC300] text-black text-sm font-semibold hover:bg-[#FFC300]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? 'Submitting…' : 'Submit'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                disabled={isPending}
                className="px-4 py-2 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] text-white/80 text-sm font-medium hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mod view */}
      {isMod && (
        <div className="flex flex-col gap-8">
          {/* Pending — always open */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-semibold text-white">Pending</h2>
              {data.pending.length > 0 && (
                <span className="text-xs font-bold bg-yellow-500 text-black rounded-full px-1.5 py-0.5 leading-none">
                  {data.pending.length}
                </span>
              )}
            </div>
            {data.pending.length === 0 ? (
              <p className="text-sm text-white/80">No pending submissions.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {data.pending.map((sub) => (
                  <SubmissionCard
                    key={sub.id}
                    submission={sub}
                    isMod={true}
                    hiveId={hiveId}
                    bookId={bookId}
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Approved — collapsed by default */}
          {data.approved.length > 0 && (
            <CollapsibleSection title="Approved" count={data.approved.length}>
              <div className="flex flex-col gap-3">
                {data.approved.map((sub) => (
                  <SubmissionCard key={sub.id} submission={sub} isMod={true} hiveId={hiveId} bookId={bookId} />
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* Rejected — collapsed by default */}
          {data.rejected.length > 0 && (
            <CollapsibleSection title="Rejected" count={data.rejected.length}>
              <div className="flex flex-col gap-3">
                {data.rejected.map((sub) => (
                  <SubmissionCard key={sub.id} submission={sub} isMod={true} hiveId={hiveId} bookId={bookId} />
                ))}
              </div>
            </CollapsibleSection>
          )}
        </div>
      )}

      {/* Member view: their own submissions */}
      {!isMod && !showForm && (
        <section>
          {data.pending.length === 0 && data.approved.length === 0 && data.rejected.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-12 h-12 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] flex items-center justify-center mx-auto mb-3">
                <Upload className="w-5 h-5 text-white/80" />
              </div>
              <p className="text-sm font-medium text-white/80">No submissions yet</p>
              <p className="text-xs text-white/80 mt-1">Submit a chapter for review by the hive owner.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {[...data.pending, ...data.approved, ...data.rejected].map((sub) => (
                <SubmissionCard key={sub.id} submission={sub} isMod={false} hiveId={hiveId} bookId={bookId} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
