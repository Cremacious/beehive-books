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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '../ui/textarea';

const formSchema = z.object({
  title: z.string().min(1),
  notes: z.string().min(1).optional(),
  content: z.string().min(1),
  progress: z.boolean(),
});

export default function CreateChapterForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log(values);
      toast(
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(values, null, 2)}</code>
        </pre>
      );
    } catch (error) {
      console.error('Form submission error', error);
      toast.error('Failed to submit the form. Please try again.');
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
        {/* Section: Chapter Details */}
        <div>
          <h2 className="text-xl font-bold text-yellow-700 mb-4 font-['Caveat',cursive] flex items-center gap-2">
            <span>📝</span> Chapter Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Chapter Title" type="text" {...field} />
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
                  <FormLabel>Author&apos;s Notes</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Optional notes"
                      type="text"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        {/* Divider */}
        <div className="border-b-2 border-yellow-100" />

        {/* Section: Content */}
        <div>
          <h2 className="text-xl font-bold text-yellow-700 mb-4 font-['Caveat',cursive] flex items-center gap-2">
            <span>📖</span> Content
          </h2>
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write your chapter here..."
                    className="resize-none min-h-[160px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* Divider */}
        <div className="border-b-2 border-yellow-100" />

        {/* Section: Progress */}
        <div>
          <h2 className="text-xl font-bold text-yellow-700 mb-4 font-['Caveat',cursive] flex items-center gap-2">
            <span>✅</span> Progress
          </h2>
          <FormField
            control={form.control}
            name="progress"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Completed?</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled
                    aria-readonly
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <Button type="submit">Create Chapter</Button>
        </div>
      </form>
    </Form>
  );
}
