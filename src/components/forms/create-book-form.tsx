'use client';

import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';

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

import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  category: z.string().min(1).optional(),
  genre: z.string().min(1),
  //   name_5929124379: z.string(),
  description: z.string().optional(),
  //   isPrivate: z.unknown(),
});

export default function CreateBookForm() {
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  function onCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setCoverPreview(null);
    }
  }

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
        {/* Section: Book Cover */}
        <div>
          <h2 className="text-xl font-bold text-yellow-400 mb-2 flex items-center gap-2">
            Book Cover
          </h2>
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="w-32 h-44 rounded-xl border-4 border-yellow-200 bg-yellow-50 flex items-center justify-center overflow-hidden shadow-md">
              {coverPreview ? (
                <img
                  src={coverPreview}
                  alt="Book cover preview"
                  className="object-cover w-full h-full"
                />
              ) : (
                <span className="text-yellow-800 text-5xl">📖</span>
              )}
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <FormLabel className="font-semibold text-white">
                Upload Cover
              </FormLabel>
              <input
                type="file"
                accept="image/*"
                className="block w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-100 file:text-yellow-700 hover:file:bg-yellow-200 transition"
                onChange={onCoverChange}
              />
              <FormDescription className="text-white">
                Upload a cover image for your book (optional).
              </FormDescription>
            </div>
          </div>
        </div>

        {/* Section: Book Details */}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-yellow-400 text-lg">
                    Title
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="bg-white"
                      placeholder="Book Title"
                      type="text"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="author"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-yellow-400 text-lg">
                    Author
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="bg-white"
                      placeholder="Author Name"
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

        {/* Section: Category & Genre */}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-yellow-400 text-lg">
                    Category
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="bg-white"
                      placeholder="e.g. Fiction, Non-fiction"
                      type="text"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="genre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-yellow-400 text-lg">
                    Genre
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="bg-white"
                      placeholder="e.g. Fantasy, Memoir"
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

        {/* Section: Description */}
        <div>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-yellow-400 text-lg">
                  Description
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Brief description of your book..."
                    className="resize-none min-h-[100px] bg-white"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <Button type="submit">Create Book</Button>
        </div>
      </form>
    </Form>
  );
}
