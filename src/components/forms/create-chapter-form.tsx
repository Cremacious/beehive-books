'use client';

import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { chapterSchema } from '@/lib/validators/book.validators';
import TextEditor from '../chapter-page/text-editor';
import { Textarea } from '../ui/textarea';
import { createChapter } from '@/lib/actions/book.actions';

export default function MyForm({ bookId }: { bookId: string }) {
  const form = useForm<z.infer<typeof chapterSchema>>({
    resolver: zodResolver(chapterSchema),
  });

  async function onSubmit(values: z.infer<typeof chapterSchema>) {
    try {
      const response = await createChapter(bookId, values);
      if (response.success) {
        toast.success('Chapter created successfully!');
      } else {
        toast.error('Failed to create chapter.');
      }
    } catch (error) {
      console.error('Form submission error', error);
      toast.error('Failed to submit the form. Please try again.');
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 max-w-7xl w-full mx-auto py-10"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-yellow-400 mx-auto text-lg text-center">
                Chapter Title
              </FormLabel>
              <FormControl>
                <Input
                  className="bg-white w-full md:w-1/2 mx-auto"
                  placeholder=""
                  type=""
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        {bookId}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-yellow-400 text-lg">
                Author&apos;s Notes
              </FormLabel>
              <FormControl>
                <Textarea placeholder="" className="bg-white" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-yellow-400 text-lg">Content</FormLabel>
              <FormControl>
                <TextEditor {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
