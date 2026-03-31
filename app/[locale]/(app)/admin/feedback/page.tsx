import { getFeedbackAdminAction } from '@/lib/actions/feedback.actions';
import type { FeedbackStatus } from '@/lib/actions/feedback.actions';
import FeedbackTable from '@/components/admin/feedback-table';

interface Props {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function AdminFeedbackPage({ searchParams }: Props) {
  const { status, page } = await searchParams;
  const currentStatus = (status as FeedbackStatus) || undefined;
  const currentPage = Math.max(1, parseInt(page ?? '1', 10));

  const { items, total } = await getFeedbackAdminAction(currentPage, 25, currentStatus);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Feedback</h1>
        <p className="text-sm text-white/80 mt-1">
          User-submitted feedback, suggestions, and support requests.
        </p>
      </div>
      <FeedbackTable items={items} total={total} currentStatus={currentStatus} currentPage={currentPage} />
    </div>
  );
}
