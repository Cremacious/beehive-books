import FeedbackForm from '@/components/feedback/feedback-form';

export default function FeedbackPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Share Feedback</h1>
        <p className="text-sm text-white/80 mt-1">
          Have a suggestion, found a bug, or just want to say something? I read every submission personally.
        </p>
      </div>

      <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] p-6">
        <FeedbackForm />
      </div>
    </div>
  );
}
