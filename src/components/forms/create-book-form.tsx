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
import Image from 'next/image';
import { Textarea } from '@/components/ui/textarea';
import { bookSchema } from '@/lib/validators/book.validators';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createBook } from '@/lib/actions/book.actions';
import { useRouter } from 'next/navigation';
import { LoaderPinwheel } from 'lucide-react';

export default function CreateBookForm() {
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const router = useRouter();

  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const form = useForm<z.infer<typeof bookSchema>>({
    resolver: zodResolver(bookSchema),
  });

  function onCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setCoverPreview(null);
      setCoverFile(null);
    }
  }

  async function resizeAndConvertToBase64(
    file: File,
    maxWidth = 1600,
    maxBytes = 700 * 1024
  ) {
    if (file.size <= maxBytes) {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });
    }

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = (e) => reject(e);
      r.readAsDataURL(file);
    });

    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = document.createElement('img') as HTMLImageElement;
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Image failed to load'));
      image.src = dataUrl;
    });

    const ratio = Math.min(1, maxWidth / img.width);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * ratio);
    canvas.height = Math.round(img.height * ratio);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    let quality = 0.9;
    let blob: Blob | null = null;
    while (quality >= 0.35) {
      blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/jpeg', quality)
      );
      if (!blob) break;
      if (blob.size <= maxBytes) break;
      quality -= 0.1;
    }

    if (!blob) throw new Error('Image compression failed');

    return new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = (e) => reject(e);
      r.readAsDataURL(blob as Blob);
    });
  }

  async function onSubmit(values: z.infer<typeof bookSchema>) {
    try {
      if (coverFile && coverFile.size > 12 * 1024 * 1024) {
        toast.error('Cover image is too large (max 12MB).');

        return;
      }

      let coverImageBase64: string | undefined = undefined;
      if (coverFile) {
        coverImageBase64 = await resizeAndConvertToBase64(
          coverFile,
          1600,
          700 * 1024
        );
      }

      const response = await createBook({
        ...values,
        coverImageBase64,
      });
      if (response.success) {
        toast.success(response.message);
        form.reset();
        router.push('/books');
        setCoverFile(null);
        setCoverPreview(null);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.log('Error creating book:', error);
      toast.error('Failed to submit the form. Please try again.');
    }
  }
  const isSubmitting = form.formState.isSubmitting;

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
                <Image
                  src={coverPreview}
                  alt="Book cover preview"
                  className="object-cover w-full h-full"
                  width={128}
                  height={176}
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
                    placeholder=""
                    className="min-h-[100px] bg-white"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="privacy"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-yellow-400 text-lg">Privacy</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-white">
                    <SelectValue
                      className="text-slate-800"
                      placeholder="Public"
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription className="text-white">
                Make the book public or only available for friends
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Submit Button */}
        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant={'secondary'}
            onClick={() => router.push('/books')}
            className=""
          >
            Cancel
          </Button>
          {isSubmitting ? (
            <Button className="" disabled>
              <LoaderPinwheel
                className="animate-spin  mx-2 text-[#202020]"
                size={300}
              />
            </Button>
          ) : (
            <Button className="" type="submit">
              Create Book
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
