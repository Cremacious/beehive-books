'use client';

import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createComment } from '@/lib/actions/comment.actions';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { CommentType } from '@/lib/types/books.type';
import ChapterComment from './chapter-comment';
import { useState } from 'react';

const formSchema = z.object({
  content: z.string(),
});

export default function CommentSection({
  chapterId,
  comments,
}: {
  chapterId: number;
  comments: CommentType[];
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: '',
    },
  });

  const [localComments, setLocalComments] = useState<CommentType[]>(
    () => comments ?? []
  );

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await createComment({
        chapterId,
        content: values.content,
      });
      if (response.success) {
        toast.success('Comment created');
        form.reset();
        setLocalComments((prev) => [...prev, response.comment as CommentType]);
      } else {
        toast.error(response.message || 'Failed to create comment');
      }
    } catch (error) {
      console.error('Form submission error', error);
      toast.error('Failed to submit the form. Please try again.');
    }
  }

  return (
    <div className="max-w-5xl mx-auto darkContainer">
      <div className="lightContainer">
        <div className=" ">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4 playWright] flex items-center gap-2">
            Comments
          </h2>
          <div className="space-y-4 mb-6">
            {localComments.length === 0 ? (
              <div className="bg-yellow-100 rounded-2xl p-4 flex flex-col justify-center items-center h-[300px]">
                <div className="text-lg font-bold">No comments yet</div>
                <div>Psssst. You should be the first.</div>
              </div>
            ) : (
              localComments.map((comment) => (
                <ChapterComment key={comment.id} comment={comment} />
              ))
            )}
          </div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8 max-w-3xl mx-auto "
            >
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg text-yellow-400">
                      Leave a comment
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder=""
                        className="bg-white"
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Submit</Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
