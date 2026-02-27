'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useClubStore } from '@/lib/stores/club-store';
import { clubDiscussionSchema } from '@/lib/validations/club.schema';
import type { ClubDiscussionFormData } from '@/lib/types/club.types';

export default function CreateClubDiscussionForm({ clubId }: { clubId: string }) {
  const router = useRouter();
  const store = useClubStore();
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ClubDiscussionFormData>({
    resolver: zodResolver(clubDiscussionSchema),
  });

  const onSubmit = async (data: ClubDiscussionFormData) => {
    setError('');
    const result = await store.createDiscussion(clubId, data);
    if (result.success && result.discussionId) {
      router.push(`/clubs/${clubId}/discussions/${result.discussionId}`);
    } else {
      setError(result.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-white mb-1.5">Title <span className="text-red-400">*</span></label>
        <input
          {...register('title')}
          placeholder="What do you want to discuss?"
          className="w-full rounded-xl bg-[#252525] border border-[#2a2a2a] px-4 py-2.5 text-sm text-white placeholder-white/80 focus:outline-none focus:border-[#FFC300]/40 focus:ring-1 focus:ring-[#FFC300]/20 transition-all"
        />
        {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-white mb-1.5">Content <span className="text-red-400">*</span></label>
        <textarea
          {...register('content')}
          rows={8}
          placeholder="Share your thoughts..."
          className="w-full rounded-xl bg-[#252525] border border-[#2a2a2a] px-4 py-2.5 text-sm text-white placeholder-white/80 focus:outline-none focus:border-[#FFC300]/40 focus:ring-1 focus:ring-[#FFC300]/20 transition-all resize-none"
        />
        {errors.content && <p className="text-xs text-red-400 mt-1">{errors.content.message}</p>}
      </div>
      {error && <p className="text-sm text-red-400 bg-red-400/10 rounded-xl px-4 py-2.5">{error}</p>}
      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          Post Discussion
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
