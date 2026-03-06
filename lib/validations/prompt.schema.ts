import { z } from 'zod';

export const promptSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(120, 'Title cannot exceed 120 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description cannot exceed 2000 characters'),
  endDate: z
    .string()
    .min(1, 'End date is required')
    .refine(
      (s) => new Date(s) > new Date(),
      'End date must be in the future',
    ),
  privacy: z.enum(['PUBLIC', 'FRIENDS', 'PRIVATE']),
  explorable: z.boolean(),
});

export type PromptFormData = z.infer<typeof promptSchema>;

export const promptServerSchema = promptSchema.extend({
  endDate: z.coerce.date().refine(
    (d) => d > new Date(),
    'End date must be in the future',
  ),
});

export type PromptServerData = z.infer<typeof promptServerSchema>;

export const entrySchema = z.object({
  content: z.string().min(1, 'Entry cannot be empty'),
});

export type EntryFormData = z.infer<typeof entrySchema>;

export const entryCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(1000, 'Comment is too long'),
});

export type EntryCommentFormData = z.infer<typeof entryCommentSchema>;
