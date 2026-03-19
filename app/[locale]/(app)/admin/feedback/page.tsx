import { getFeedbackAdminAction } from '@/lib/actions/feedback.actions';
import FeedbackTable from '@/components/admin/feedback-table';

export default async function AdminFeedbackPage() {
  const items = await getFeedbackAdminAction();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Feedback</h1>
        <p className="text-sm text-white/60 mt-1">
          User-submitted feedback, suggestions, and support requests.
        </p>
      </div>
      <FeedbackTable items={items} />
    </div>
  );
}
