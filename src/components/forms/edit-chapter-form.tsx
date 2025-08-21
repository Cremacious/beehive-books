'use client';

import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { chapterSchema } from '@/lib/validators/book.validators';
import TextEditor from '../chapter-page/text-editor';
import { Textarea } from '../ui/textarea';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { editChapter } from '@/lib/actions/book.actions';
import { ChapterType } from '@/lib/providers/types/books.type';

export default function EditChapterForm({
  chapter,
  bookId,
}: {
  chapter: ChapterType;
  bookId: string;
}) {
  const router = useRouter();
  const form = useForm<z.infer<typeof chapterSchema>>({
    resolver: zodResolver(chapterSchema),
    defaultValues: {
      title: chapter.title || '',
      content: chapter.content || '',
      status: chapter.status || 'In Progress',
      notes: chapter.notes || '',
    },
  });

  async function onSubmit(values: z.infer<typeof chapterSchema>) {
    try {
      const response = await editChapter(String(chapter.id), values);
      if (response.success) {
        toast.success('Chapter updated successfully!');
        form.reset();
        router.push(`/books/${bookId}`);
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

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-yellow-400 text-lg">
                Chapter Status
              </FormLabel>
              <FormControl>
                <Select
                  value={field.value ?? 'In Progress'}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select Chapter Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription className="text-white">
                Is this chapter a work in progress or completed?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant={'secondary'}
            onClick={() => router.push(`/books/${bookId}`)}
            className=""
          >
            Cancel
          </Button>
          <Button type="submit">Create Chapter</Button>
        </div>
      </form>
    </Form>
  );
}
