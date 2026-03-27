'use client';

import { useState, useTransition } from 'react';
import { submitFeedbackAction } from '@/lib/actions/feedback.actions';
import { Button } from '@/components/ui/button';

const CATEGORIES = [
  {
    value: 'feature_request',
    label: 'Feature Request',
    description: "I'd love to see...",
  },
  {
    value: 'bug_report',
    label: 'Bug Report',
    description: 'Something is broken...',
  },
  {
    value: 'general',
    label: 'General Feedback',
    description: 'Just want to say something...',
  },
  {
    value: 'content_concern',
    label: 'Content Concern',
    description: 'Flag something problematic...',
  },
] as const;

type Category = (typeof CATEGORIES)[number]['value'];

export default function FeedbackForm() {
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');
  const [category, setCategory] = useState<Category | null>(null);
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [contentError, setContentError] = useState('');

  if (submitted) {
    return (
      <div className="text-center py-8 space-y-3">
        <p className="text-white font-medium">Thanks for the feedback.</p>
        <p className="text-sm text-white/80">I read every submission personally — Chris</p>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!category) return;

    setContentError('');
    setServerError('');

    if (content.trim().length < 10) {
      setContentError('Feedback must be at least 10 characters.');
      return;
    }
    if (content.length > 2000) {
      setContentError('Feedback must be 2000 characters or fewer.');
      return;
    }

    startTransition(async () => {
      const result = await submitFeedbackAction({ category, email, content });
      if (result.success) {
        setSubmitted(true);
      } else {
        setServerError(result.message);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Category cards */}
      <div>
        <p className="text-xs font-semibold text-white/80 uppercase tracking-wide mb-3">
          What kind of feedback is this?
        </p>
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map(({ value, label, description }) => {
            const selected = category === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setCategory(value)}
                className={`text-left rounded-xl border p-4 cursor-pointer transition-all ${
                  selected
                    ? 'border-[#FFC300]/60 bg-[#FFC300]/8'
                    : 'border-[#2a2a2a] hover:border-[#FFC300]/30'
                }`}
              >
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className="text-xs text-white/80 mt-0.5">{description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content + submit — only shown after category selected */}
      {category && (
        <>
          <div>
            <label className="block text-xs font-semibold text-white/80 uppercase tracking-wide mb-2">
              Your Feedback
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              placeholder="Share your thoughts, suggestions, or describe your issue..."
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FFC300]/40 transition-colors resize-none"
            />
            {contentError && <p className="mt-1 text-xs text-red-400">{contentError}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/80 uppercase tracking-wide mb-2">
              Email <span className="normal-case font-normal text-white/60">(optional — for a response)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FFC300]/40 transition-colors"
            />
          </div>

          {serverError && <p className="text-sm text-red-400">{serverError}</p>}

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#FFC300] text-black hover:bg-[#FFD040] font-semibold"
          >
            {isPending ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </>
      )}
    </form>
  );
}
