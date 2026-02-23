'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Upload, AlertTriangle } from 'lucide-react';

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
];

type ExistingBook = {
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
  // error?: string   — wire in when adding logic
  // isPending?: boolean
};

export function BookForm({ mode, cancelHref = '/library', book }: BookFormProps) {
  const isEdit = mode === 'edit';
  const [privacy, setPrivacy]         = useState(book?.privacy ?? 'PRIVATE');
  const [hasCover, setHasCover]       = useState(!!book?.coverUrl);

  const inputClass =
    'w-full rounded-xl bg-[#1e1e1e] border border-[#333] px-4 py-2.5 text-sm text-white ' +
    'placeholder-white/25 focus:outline-none focus:border-[#FFC300]/50 ' +
    'focus:ring-1 focus:ring-[#FFC300]/20 transition-all';

  return (
    <div className="px-4 py-8">
      <div className="mx-auto max-w-2xl">

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            {isEdit ? 'Edit Book' : 'New Book'}
          </h1>
          <p className="mt-1 text-sm text-white/45">
            {isEdit
              ? 'Update your book details below.'
              : 'Fill in the details to add a book to your library.'}
          </p>
        </div>

        <form className="rounded-2xl bg-[#252525] border border-[#2a2a2a] shadow-2xl p-6 md:p-8 space-y-7">

          {/* Cover upload */}
          <div className="flex flex-col items-center gap-2">
            <label className="relative group cursor-pointer">
              {hasCover ? (
                <div className="w-36 h-52 rounded-xl overflow-hidden ring-2 ring-[#FFC300]/30 bg-[#333] flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">Change cover</span>
                  </div>
                  <span className="text-white/30 text-xs">Cover image</span>
                </div>
              ) : (
                <div className="w-36 h-52 rounded-xl border-2 border-dashed border-[#3a3a3a] bg-[#1e1e1e] flex flex-col items-center justify-center gap-2 group-hover:border-[#FFC300]/40 transition-colors">
                  <Upload className="w-6 h-6 text-white/25 group-hover:text-[#FFC300]/50 transition-colors" />
                  <span className="text-xs text-white/30 text-center px-3 leading-snug group-hover:text-white/50 transition-colors">
                    Upload cover
                  </span>
                  <span className="text-[10px] text-white/20">PNG · JPG · max 5 MB</span>
                </div>
              )}
              <input
                type="file"
                accept="image/png,image/jpeg,image/gif"
                className="sr-only"
                onChange={() => setHasCover(true)}
              />
            </label>
            <span className="text-xs text-white/35">Book cover (optional)</span>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white/75">
              Book Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="title"
              defaultValue={book?.title}
              placeholder="Enter your book title…"
              className={inputClass}
            />
          </div>

          {/* Author */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white/75">
              Author Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="author"
              defaultValue={book?.author}
              placeholder="Your pen name or real name…"
              className={inputClass}
            />
          </div>

          {/* Category + Genre */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/75">
                Category <span className="text-red-400">*</span>
              </label>
              <select
                name="category"
                defaultValue={book?.category ?? ''}
                className={inputClass + ' appearance-none'}
              >
                <option value="" disabled>Select category…</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/75">
                Genre <span className="text-red-400">*</span>
              </label>
              <select
                name="genre"
                defaultValue={book?.genre ?? ''}
                className={inputClass + ' appearance-none'}
              >
                <option value="" disabled>Select genre…</option>
                {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white/75">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              name="description"
              rows={6}
              defaultValue={book?.description}
              placeholder="Write a compelling description of your book…"
              className={inputClass + ' resize-y'}
            />
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
                  onClick={() => setPrivacy(opt.value)}
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
            <input type="hidden" name="privacy" value={privacy} />
          </div>

          {/* Error — shown when there's a server error */}
          {/* Replace false with error state when wiring logic */}
          {false && (
            <div className="flex items-start gap-2 rounded-xl bg-red-950/40 border border-red-800/40 px-4 py-3">
              <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <p className="text-sm text-red-400">Something went wrong. Please try again.</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-1">
            {isEdit ? (
              <button
                type="button"
                className="px-4 py-2 rounded-xl text-sm font-medium text-red-400 hover:bg-red-400/10 transition-all duration-200"
              >
                Delete Book
              </button>
            ) : <div />}

            <div className="flex items-center gap-3">
              <Link
                href={cancelHref}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/[0.06] transition-all duration-200"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#FFC300] text-[#1a1a1a] hover:bg-[#FFD740] transition-all duration-200 disabled:opacity-50"
              >
                {isEdit ? 'Save Changes' : 'Create Book'}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
