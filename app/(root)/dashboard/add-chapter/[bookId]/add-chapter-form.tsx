'use client';

import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { addChapterToBook } from '@/lib/actions/book.actions';
import { chapterCreationFormSchema } from '@/lib/validators/bookCreation';

type AddChapterFormProps = { bookId: string };

const AddChapterForm = ({ bookId }: AddChapterFormProps) => {
  const form = useForm<z.infer<typeof chapterCreationFormSchema>>({
    resolver: zodResolver(chapterCreationFormSchema),
  });

  async function onSubmit(values: z.infer<typeof chapterCreationFormSchema>) {
    console.log(values);
    const response = await addChapterToBook(bookId, values);
    if (response) {
      toast.success(response.message);
    } else {
      toast.error('Something went wrong');
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, (errors) => {
          console.log('Validation errors:', errors);
        })}
        className="space-y-8 max-w-3xl mx-auto py-10"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chapter Title</FormLabel>
              <FormControl>
                <Input placeholder="" type="text" {...field} />
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
              <FormLabel>Content</FormLabel>
              <FormControl>
                <textarea
                  {...field}
                  rows={10}
                  className="w-full rounded border px-3 py-2"
                  placeholder="Paste or type your chapter content here"
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
              <FormLabel>Chapter Notes</FormLabel>
              <FormControl>
                <Input placeholder="" type="text" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};

export default AddChapterForm;
