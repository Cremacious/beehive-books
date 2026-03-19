'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { MessageSquarePlus, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { submitFeedbackAction } from '@/lib/actions/feedback.actions';

const schema = z.object({
  type: z.enum(['content_suggestion', 'general_feedback', 'technical_support']),
  email: z.string().email('Invalid email address').or(z.literal('')),
  content: z.string().min(10, 'Feedback must be at least 10 characters').max(2000),
});

type FormValues = z.infer<typeof schema>;

const feedbackTypes = [
  { value: 'content_suggestion', label: 'Content Suggestion' },
  { value: 'general_feedback', label: 'General Feedback' },
  { value: 'technical_support', label: 'Technical Support' },
] as const;

export default function FeedbackForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'general_feedback',
      email: '',
      content: '',
    },
  });

  function onSubmit(values: FormValues) {
    setServerError('');
    startTransition(async () => {
      const result = await submitFeedbackAction(values);
      if (result.success) {
        setSubmitted(true);
      } else {
        setServerError(result.message);
      }
    });
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <CheckCircle2 className="w-12 h-12 text-[#FFC300]" />
        <h2 className="text-xl font-bold text-white">Thank you!</h2>
        <p className="text-white/80 text-sm max-w-xs">
          Your feedback has been submitted. We appreciate you taking the time to share it with us.
        </p>
        <Button
          onClick={() => router.back()}
          className="mt-2 bg-[#FFC300] text-black hover:bg-[#FFD040] font-semibold"
        >
          Go back
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className="block text-xs font-semibold text-white/80 uppercase tracking-wide mb-2">
          Feedback Type
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {feedbackTypes.map(({ value, label }) => (
            <label
              key={value}
              className="relative flex items-center gap-2 px-4 py-3 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] cursor-pointer hover:border-[#FFC300]/30 transition-all has-checked:border-[#FFC300]/60 has-checked:bg-[#FFC300]/5"
            >
              <input
                {...register('type')}
                type="radio"
                value={value}
                className="sr-only"
              />
              <span className="text-sm font-medium text-white/80">{label}</span>
            </label>
          ))}
        </div>
        {errors.type && (
          <p className="mt-1 text-xs text-red-400">{errors.type.message}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-white/80 uppercase tracking-wide mb-2">
          Email <span className="normal-case font-normal text-white/70">(optional — for a response)</span>
        </label>
        <input
          {...register('email')}
          type="email"
          placeholder="you@example.com"
          className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FFC300]/40 transition-colors"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-white/70 uppercase tracking-wide mb-2">
          Your Feedback
        </label>
        <textarea
          {...register('content')}
          rows={6}
          placeholder="Share your thoughts, suggestions, or describe your issue…"
          className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FFC300]/40 transition-colors resize-none"
        />
        {errors.content && (
          <p className="mt-1 text-xs text-red-400">{errors.content.message}</p>
        )}
      </div>

      {serverError && (
        <p className="text-sm text-red-400">{serverError}</p>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-[#FFC300] text-black hover:bg-[#FFD040] font-semibold flex items-center justify-center gap-2"
      >
        <MessageSquarePlus className="w-4 h-4" />
        {isPending ? 'Submitting…' : 'Submit Feedback'}
      </Button>
    </form>
  );
}
