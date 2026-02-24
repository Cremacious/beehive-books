'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, Loader2, X } from 'lucide-react';
import { createId } from '@paralleldrive/cuid2';
import { Button } from '@/components/ui/button';
import { bookSchema, type BookFormData } from '@/lib/validations/book.schema';
import { createBookAction, updateBookAction, deleteBookAction } from '@/lib/actions/book.actions';
import { useCloudinaryUpload } from '@/hooks/use-cloudinary-upload';

const CATEGORIES = [
  'Fiction', 'Non-Fiction', 'Poetry', 'Memoir',
  'Biography', 'Self-Help', 'Academic', 'Other',
];

const GENRES = [
  'Mystery', 'Romance', 'Science Fiction', 'Fantasy', 'Thriller',
  'Horror', 'Historical Fiction', 'Contemporary', 'Literary Fiction',
  'Young Adult', 'Children', 'Other',
];

const PRIVACY_OPTIONS = [
  { value: 'PUBLIC',  label: 'Public',       description: 'Anyone can read'  },
  { value: 'PRIVATE', label: 'Private',      description: 'Only you'         },
  { value: 'FRIENDS', label: 'Friends Only', description: 'You + friends'    },
] as const;

type ExistingBook = {
  id:          string;
  title:       string;
  author:      string;
  category:    string;
  genre:       string;
  description: string;
  privacy:     string;
  coverUrl?:   string | null;
};

type BookFormProps = {
  mode:        'create' | 'edit';
  cancelHref?: string;
  book?:       ExistingBook;
};

export function BookForm({ mode, cancelHref = '/library', book }: BookFormProps) {
  const isEdit  = mode === 'edit';
  const router  = useRouter();

  const [presetId]      = useState(() => book?.id ?? createId());
  const [coverUrl, setCoverUrl] = useState<string | null>(book?.coverUrl ?? null);
  const [isDeleting, setIsDeleting]       = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [serverError, setServerError]     = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { upload, uploading } = useCloudinaryUpload('covers', presetId);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BookFormData>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title:       book?.title       ?? '',
      author:      book?.author      ?? '',
      category:    book?.category    ?? '',
      genre:       book?.genre       ?? '',
      description: book?.description ?? '',
      privacy:     (book?.privacy as BookFormData['privacy']) ?? 'PRIVATE',
    },
  });

  const privacy = watch('privacy');

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await upload(file);
    if (url) setCoverUrl(url);
  }

  async function onSubmit(data: BookFormData) {
    setServerError('');
    let result;
    if (isEdit && book) {
      result = await updateBookAction(book.id, data, coverUrl);
    } else {
      result = await createBookAction(data, coverUrl ?? undefined, presetId);
    }

    if (result.success) {
      router.push(isEdit ? `/library/${book!.id}` : '/library');
    } else {
      setServerError(result.message);
    }
  }

  async function handleDelete() {
    if (!deleteConfirm) { setDeleteConfirm(true); return; }
    setIsDeleting(true);
    const result = await deleteBookAction(book!.id);
    if (result.success) router.push('/library');
    else { setIsDeleting(false); setServerError(result.message); }
  }

  const inputClass =
    'w-full rounded-xl bg-[#1e1e1e] border border-[#333] px-4 py-2.5 text-sm text-white ' +
    'placeholder-white/25 focus:outline-none focus:border-[#FFC300]/50 ' +
    'focus:ring-1 focus:ring-[#FFC300]/20 transition-all';

  const errorClass = 'text-xs text-red-400 mt-1';

  return (
    <div className="px-4 py-8">
      <div className="mx-auto max-w-2xl">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            {isEdit ? 'Edit Book' : 'New Book'}
          </h1>
          <p className="mt-1 text-sm text-white/45">
            {isEdit ? 'Update your book details below.' : 'Fill in the details to add a book to your library.'}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl bg-[#252525] border border-[#2a2a2a] shadow-2xl p-6 md:p-8 space-y-7">

          {/* Cover upload */}
          <div className="flex flex-col items-center gap-2">
            <label className="relative group cursor-pointer">
              {coverUrl ? (
                <div className="relative w-36 h-52 rounded-xl overflow-hidden ring-2 ring-[#FFC300]/30">
                  <Image src={coverUrl} alt="Book cover" fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">Change cover</span>
                  </div>
                </div>
              ) : (
                <div className="w-36 h-52 rounded-xl border-2 border-dashed border-[#3a3a3a] bg-[#1e1e1e] flex flex-col items-center justify-center gap-2 group-hover:border-[#FFC300]/40 transition-colors">
                  {uploading ? (
                    <Loader2 className="w-6 h-6 text-[#FFC300]/50 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-white/25 group-hover:text-[#FFC300]/50 transition-colors" />
                      <span className="text-xs text-white/30 text-center px-3 leading-snug group-hover:text-white/50 transition-colors">
                        Upload cover
                      </span>
                      <span className="text-[10px] text-white/20">PNG · JPG · max 5 MB</span>
                    </>
                  )}
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                className="sr-only"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </label>
            {coverUrl && (
              <button
                type="button"
                onClick={() => { setCoverUrl(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                className="flex items-center gap-1 text-xs text-red-400/70 hover:text-red-400 transition-colors"
              >
                <X className="w-3 h-3" /> Remove cover
              </button>
            )}
            {!coverUrl && <span className="text-xs text-white/35">Book cover (optional)</span>}
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white/75">
              Book Title <span className="text-red-400">*</span>
            </label>
            <input
              {...register('title')}
              type="text"
              placeholder="Enter your book title…"
              className={inputClass}
            />
            {errors.title && <p className={errorClass}>{errors.title.message}</p>}
          </div>

          {/* Author */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white/75">
              Author Name <span className="text-red-400">*</span>
            </label>
            <input
              {...register('author')}
              type="text"
              placeholder="Your pen name or real name…"
              className={inputClass}
            />
            {errors.author && <p className={errorClass}>{errors.author.message}</p>}
          </div>

          {/* Category + Genre */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/75">
                Category <span className="text-red-400">*</span>
              </label>
              <select {...register('category')} className={inputClass + ' appearance-none'}>
                <option value="" disabled>Select category…</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p className={errorClass}>{errors.category.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/75">
                Genre <span className="text-red-400">*</span>
              </label>
              <select {...register('genre')} className={inputClass + ' appearance-none'}>
                <option value="" disabled>Select genre…</option>
                {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              {errors.genre && <p className={errorClass}>{errors.genre.message}</p>}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white/75">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              {...register('description')}
              rows={6}
              placeholder="Write a compelling description of your book…"
              className={inputClass + ' resize-y'}
            />
            {errors.description && <p className={errorClass}>{errors.description.message}</p>}
          </div>

          {/* Privacy */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/75">
              Privacy <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {PRIVACY_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setValue('privacy', opt.value)}
                  className={`flex flex-col items-center gap-1 rounded-xl p-3 border text-center transition-all duration-200 ${
                    privacy === opt.value
                      ? 'border-[#FFC300] bg-[#FFC300]/10 text-[#FFC300]'
                      : 'border-[#333] bg-[#1e1e1e] text-white/45 hover:border-[#444] hover:text-white/65'
                  }`}
                >
                  <span className="text-sm font-semibold">{opt.label}</span>
                  <span className="text-[11px] leading-tight opacity-80">{opt.description}</span>
                </button>
              ))}
            </div>
          </div>

      
          {serverError && (
            <div className="flex items-start gap-2 rounded-xl bg-red-950/40 border border-red-800/40 px-4 py-3">
              <p className="text-sm text-red-400">{serverError}</p>
            </div>
          )}

     
          <div className="flex items-center justify-between pt-1">
            {isEdit ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-sm font-medium text-red-400 hover:bg-red-400/10 transition-all duration-200 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting…' : deleteConfirm ? 'Confirm delete?' : 'Delete Book'}
              </button>
            ) : <div />}

            <div className="flex items-center gap-3">
              <Link
                href={cancelHref}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/6 transition-all duration-200"
              >
                Cancel
              </Link>
              <Button type="submit" disabled={isSubmitting || uploading}>
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> {isEdit ? 'Saving…' : 'Creating…'}</>
                ) : (
                  isEdit ? 'Save Changes' : 'Create Book'
                )}
              </Button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
