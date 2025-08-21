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
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log(values);
      const response = await createComment({
        chapterId,
        content: values.content,
      });
      if (response.success) {
        toast.success('Comment created');
        form.reset();
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
            {comments.length === 0 ? (
              <div>No comments yet</div>
            ) : (
              comments.map((comment) => (
                <ChapterComment key={comment.id} comment={comment} />
              ))
            )}
          </div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8 max-w-3xl mx-auto py-10"
            >
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comment</FormLabel>
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

// 'use client';
// import { Button } from '../ui/button';
// import { CommentType } from '@/lib/types/books.type';
// import ChapterComment from './chapter-comment';
// import { createComment } from '@/lib/actions/comment.actions';
// import { useState } from 'react';

// export default function CommentSection({
//   comments,
//   chapterId,
// }: {
//   comments: CommentType[];
//   chapterId: string | number;
// }) {

//   return (
//     <div className="max-w-5xl mx-auto darkContainer">
//       <div className="lightContainer">
//         <div className=" ">
//           <h2 className="text-2xl font-bold text-yellow-400 mb-4 playWright] flex items-center gap-2">
//             Comments
//           </h2>
//           <div className="space-y-4 mb-6">
//             {comments.length === 0 ? (
//               <div>No comments yet</div>
//             ) : (
//               comments.map((comment) => (
//                 <ChapterComment key={comment.id} comment={comment} />
//               ))
//             )}
//           </div>
//           <form className="flex flex-col gap-2">
//             <textarea
//               className="rounded-lg text-slate-800 border bg-white border-yellow-200 p-3 min-h-[60px] focus:outline-none focus:ring-2 focus:ring-yellow-300"
//               placeholder="Add a comment..."
//             />
//             <div className="flex justify-end mt-2">
//               <Button type="submit">Post Comment</Button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }
