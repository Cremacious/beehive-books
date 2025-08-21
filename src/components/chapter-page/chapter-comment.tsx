'use client';
import { CommentType } from '@/lib/types/books.type';
import { Button } from '../ui/button';
import Image from 'next/image';
import defaultProfileImage from '@/assets/stock/stockProfile.png';
import { useState } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createCommentReply } from '@/lib/actions/comment.actions';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  commentReply: z.string(),
});

export default function ChapterComment({ comment }: { comment: CommentType }) {
  const [isReplying, setIsReplying] = useState(false);

  // local replies so new replies appear instantly without a page reload
  const [localReplies, setLocalReplies] = useState<CommentType[]>(
    () => comment.replies ?? []
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await createCommentReply({
        commentId: comment.id,
        content: values.commentReply,
        chapterId: comment.chapterId,
      });
      if (response.success) {
        toast.success('Reply created');
        form.reset();
        setIsReplying(false);

        if (response.reply) {
          const newReply = {
            id: response.reply.id,
            content: response.reply.content,
            chapterId: comment.chapterId,
            authorId: response.reply.authorId,
            author: response.reply.author ?? {
              id: response.reply.authorId,
              name: '',
            },
            createdAt: response.reply.createdAt,
            replies: [],
          } as unknown as CommentType;
          setLocalReplies((prev) => [...prev, newReply]);
        }
      } else {
        toast.error(response.message || 'Failed to create reply');
      }
    } catch (error) {
      console.error('Form submission error', error);
      toast.error('Failed to submit the form. Please try again.');
    }
  }

  return (
    <div className="">
      <div className="bg-yellow-50 rounded-lg p-4 border-b-4 border-yellow-200 shadow-md">
        <div className="flex items-center mb-3">
          <Image
            src={comment.author.image ?? defaultProfileImage}
            alt={comment.author.name}
            width={50}
            height={50}
            className="rounded-full mr-3 inline-block"
          />
          <div className="font-semibold text-lg text-yellow-800 mb-1">
            {comment.author.name}
          </div>
        </div>
        <div className="text-slate-800">{comment.content}</div>
        <div className="flex justify-between mt-2">
          <div className="text-xs text-slate-500 mt-1">{comment.createdAt}</div>
          <Button onClick={() => setIsReplying(!isReplying)} size={'sm'}>
            {isReplying ? 'Cancel' : 'Reply'}
          </Button>
        </div>
        {isReplying && (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8 max-w-3xl mx-auto mt-4"
            >
              <FormField
                control={form.control}
                name="commentReply"
                render={({ field }) => (
                  <FormItem>
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
              <Button size={'sm'} type="submit">
                Submit Reply
              </Button>
            </form>
          </Form>
        )}
      </div>
  
      {localReplies.length === 0 ? null : (
        <div className="mt-4 pl-4 border-l-2 border-yellow-200">
          {localReplies.map((reply) => (
            <div
              key={reply.id}
              className="bg-yellow-50 rounded-lg p-3 mb-2 border-b-4 border-yellow-200 shadow-md"
            >
              <div className="flex items-center mb-3">
                <Image
                  src={reply.author?.image ?? defaultProfileImage}
                  alt={reply.author?.name ?? 'User'}
                  width={40}
                  height={40}
                  className="rounded-full mr-3 inline-block"
                />
                <div className="font-semibold text-lg text-yellow-800 mb-1">
                  {reply.author?.name ?? 'User'}
                </div>
              </div>
              <div className="text-slate-800">{reply.content}</div>
              <div className="text-xs text-slate-500 mt-1">
                {new Date(reply.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
