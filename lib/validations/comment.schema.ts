import { z } from 'zod';

export const commentSchema = z.object({
  content:  z.string().min(1, 'Comment cannot be empty').max(2000, 'Comment too long'),
  parentId: z.string().nullable().optional(),
});

export type CommentFormData = z.infer<typeof commentSchema>;
