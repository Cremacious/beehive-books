import { z } from 'zod';

export const clubSchema = z.object({
  name:        z.string().min(2, 'Name must be at least 2 characters').max(80, 'Name too long'),
  description: z.string().max(1000, 'Description too long'),
  privacy:     z.enum(['PUBLIC', 'PRIVATE']),
  rules:       z.string().max(2000, 'Rules too long'),
  tags:        z.array(z.string().max(30, 'Tag too long')).max(10, 'Maximum 10 tags'),
});

export const clubDiscussionSchema = z.object({
  title:   z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title too long'),
  content: z.string().min(10, 'Content must be at least 10 characters').max(10000, 'Content too long'),
});

export const clubReplySchema = z.object({
  content: z.string().min(1, 'Reply cannot be empty').max(5000, 'Reply too long'),
});

export type ClubSchemaData     = z.infer<typeof clubSchema>;
export type ClubDiscussionData = z.infer<typeof clubDiscussionSchema>;
export type ClubReplyData      = z.infer<typeof clubReplySchema>;
