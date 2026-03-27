'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertTriangle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  FileText,
  Loader2,
  Upload,
  UploadCloud,
  X,
} from 'lucide-react';
import { createId } from '@paralleldrive/cuid2';
import { Button } from '@/components/ui/button';
import { TagInput } from '@/components/ui/tag-input';
import { DeleteDialog } from '@/components/shared/delete-dialog';
import { bookSchema, type BookFormData } from '@/lib/validations/book.schema';
import {
  createBookAction,
  createChapterAction,
  updateBookAction,
  deleteBookAction,
} from '@/lib/actions/book.actions';
import {
  parseDocxAction,
  type ParsedChapter,
} from '@/lib/actions/docx.actions';
import { parseEpubAction } from '@/lib/actions/epub.actions';
import { useCloudinaryUpload } from '@/hooks/use-cloudinary-upload';
import { CATEGORIES, GENRES, PRIVACY_OPTIONS } from '@/lib/config/constants';
import {
  BookFormProps,
  DRAFT_STATUS_LABELS,
  type DraftStatus,
} from '@/lib/types/books.types';

export function BookForm({
  mode,
  cancelHref = '/library',
  book,
}: BookFormProps) {
  const isEdit = mode === 'edit';
  const router = useRouter();

  const [presetId] = useState(() => book?.id ?? createId());
  const [tags, setTags] = useState<string[]>(book?.tags ?? []);
  const [coverUrl, setCoverUrl] = useState<string | null>(
    book?.coverUrl ?? null,
  );
  const [serverError, setServerError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bookDocxOpen, setBookDocxOpen] = useState(false);
  const [bookDocxFileName, setBookDocxFileName] = useState('');
  const [bookDocxError, setBookDocxError] = useState('');
  const [bookDocxChapterCount, setBookDocxChapterCount] = useState<
    number | null
  >(null);
  const [bookEpubOpen, setBookEpubOpen] = useState(false);
  const [bookEpubFileName, setBookEpubFileName] = useState('');
  const [bookEpubError, setBookEpubError] = useState('');
  const [bookEpubChapterCount, setBookEpubChapterCount] = useState<number | null>(null);
  const [parsedChapters, setParsedChapters] = useState<ParsedChapter[] | null>(
    null,
  );

  const { upload, uploading } = useCloudinaryUpload('covers', presetId);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<BookFormData>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: book?.title ?? '',
      author: book?.author ?? '',
      category: book?.category ?? '',
      genre: book?.genre ?? '',
      description: book?.description ?? '',
      privacy: (book?.privacy as BookFormData['privacy']) ?? 'PRIVATE',
      explorable: book?.explorable ?? false,
      draftStatus:
        (book?.draftStatus as BookFormData['draftStatus']) ?? 'FIRST_DRAFT',
      tags: book?.tags ?? [],
      commentsEnabled: book?.commentsEnabled ?? true,
      chapterCommentsEnabled: book?.chapterCommentsEnabled ?? true,
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const privacy = watch('privacy');
  const explorable = watch('explorable');
  const commentsEnabled = watch('commentsEnabled');
  const chapterCommentsEnabled = watch('chapterCommentsEnabled');
  const descriptionValue = watch('description') ?? '';
  const descChars = descriptionValue.length;
  const descWords = descriptionValue.trim()
    ? descriptionValue.trim().split(/\s+/).filter(Boolean).length
    : 0;

  async function handleBookEpubSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setBookEpubError('');
    setBookEpubChapterCount(null);
    setParsedChapters(null);
    setBookEpubFileName(file.name);
    // Clear DOCX selection
    setBookDocxFileName('');
    setBookDocxChapterCount(null);
    setBookDocxError('');

    const formData = new FormData();
    formData.append('file', file);
    const result = await parseEpubAction(formData);

    if (!result.success) {
      setBookEpubError(result.message);
      setBookEpubFileName('');
      return;
    }

    setParsedChapters(result.chapters);
    setBookEpubChapterCount(result.chapters.length);
  }

  async function handleBookDocxSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setBookDocxError('');
    setBookDocxChapterCount(null);
    setParsedChapters(null);
    setBookDocxFileName(file.name);
    // Clear EPUB selection
    setBookEpubFileName('');
    setBookEpubChapterCount(null);
    setBookEpubError('');

    const formData = new FormData();
    formData.append('file', file);
    const result = await parseDocxAction(formData);

    if (!result.success) {
      setBookDocxError(result.message);
      setBookDocxFileName('');
      return;
    }

    setParsedChapters(result.chapters);
    setBookDocxChapterCount(result.chapters.length);
  }

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
      if (result.success) router.push(`/library/${book.id}`);
      else setServerError(result.message);
      return;
    }

    result = await createBookAction(data, coverUrl ?? undefined, presetId);

    if (!result.success) {
      setServerError(result.message);
      return;
    }

    if (parsedChapters && parsedChapters.length > 0) {
      for (const chapter of parsedChapters) {
        await createChapterAction(presetId, {
          title: chapter.title,
          content: chapter.content,
          authorNotes: '',
          collectionId: null,
        });
      }
    }

    router.push('/library');
  }


  const inputClass =
    'w-full rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-4 py-2.5 text-base text-white ' +
    'placeholder-white/30 focus:outline-none focus:border-[#FFC300]/50 ' +
    'focus:ring-1 focus:ring-[#FFC300]/20 transition-all';

  const errorClass = 'text-xs text-white/80';

  return (
    <div className="px-4 py-8">
      <div className="mx-auto max-w-2xl">

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-2xl bg-[#252525] border border-[#2a2a2a] shadow-2xl p-6 md:p-8 space-y-7"
        >
          <div className="flex flex-col items-center gap-2">
            <label className="relative group cursor-pointer">
              {coverUrl ? (
                <div className="relative w-36 h-52 rounded-xl overflow-hidden ring-2 ring-[#FFC300]/30">
                  <Image
                    src={coverUrl}
                    alt="Book cover"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">
                      Change cover
                    </span>
                  </div>
                </div>
              ) : (
                <div className="w-36 h-52 rounded-xl border-2 border-dashed border-[#2a2a2a] bg-[#1e1e1e] flex flex-col items-center justify-center gap-2 group-hover:border-[#FFC300]/40 transition-colors">
                  {uploading ? (
                    <Loader2 className="w-6 h-6 text-[#FFC300]/50 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-white/80 group-hover:text-[#FFC300]/50 transition-colors" />
                      <span className="text-xs text-white/80 text-center px-3 leading-snug group-hover:text-white/80 transition-colors">
                        Upload cover
                      </span>
                      <span className="text-[10px] text-white/80">
                        PNG · JPG · max 5 MB
                      </span>
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
                onClick={() => {
                  setCoverUrl(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="flex items-center gap-1 text-xs text-white/80 hover:text-white transition-colors"
              >
                <X className="w-3 h-3" /> Remove cover
              </button>
            )}
            {!coverUrl && (
              <span className="text-sm text-white/80">
                Book cover (optional)
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white">
              Book Title <span className="text-white/80 text-xs font-normal">(required)</span>
            </label>
            <p className="text-xs text-white/80">The name of your book — make it memorable.</p>
            <input
              {...register('title')}
              type="text"
              placeholder="Enter your book title…"
              className={inputClass}
            />
            <p className="text-xs text-white/80 text-right">{watch('title')?.length ?? 0} / 100</p>
            {errors.title && (
              <p className={errorClass}>{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white">
              Author Name <span className="text-white/80 text-xs font-normal">(required)</span>
            </label>
            <p className="text-xs text-white/80">Your pen name or real name as it appears on the cover.</p>
            <input
              {...register('author')}
              type="text"
              placeholder="Your pen name or real name…"
              className={inputClass}
            />
            {errors.author && (
              <p className={errorClass}>{errors.author.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white">
                Category
              </label>
              <p className="text-xs text-white/80">Fiction or non-fiction — affects how your book is listed.</p>
              <select
                {...register('category')}
                className={inputClass + ' appearance-none'}
              >
                <option value="" disabled>
                  Select category…
                </option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className={errorClass}>{errors.category.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white">
                Genre <span className="text-white/80 text-xs font-normal">(required)</span>
              </label>
              <p className="text-xs text-white/80">Helps readers find your book.</p>
              <select
                {...register('genre')}
                className={inputClass + ' appearance-none'}
              >
                <option value="" disabled>
                  Select genre…
                </option>
                {GENRES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              {errors.genre && (
                <p className={errorClass}>{errors.genre.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white">
              Description
            </label>
            <p className="text-xs text-white/80">A compelling blurb that makes readers want to read. Spoiler-free.</p>
            <textarea
              {...register('description')}
              rows={6}
              placeholder="Write a compelling description of your book…"
              className={inputClass + ' resize-y'}
            />
            <div className="flex items-center justify-between">
              {errors.description ? (
                <p className={errorClass}>{errors.description.message}</p>
              ) : (
                <span />
              )}
              <p className="text-xs shrink-0 ml-2">
                <span
                  className={
                    descWords > 200
                      ? 'text-yellow-500'
                      : descWords > 180
                        ? 'text-yellow-500'
                        : 'text-white/80'
                  }
                >
                  {descWords}/200 words
                </span>
                <span className="text-white/80 mx-1.5">·</span>
                <span
                  className={
                    descChars > 1200
                      ? 'text-yellow-500'
                      : descChars > 1080
                        ? 'text-yellow-500'
                        : 'text-white/80'
                  }
                >
                  {descChars}/1200 chars
                </span>
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white mainFont">
              Tags <span className="text-white/80 font-normal">(up to 10)</span>
            </label>
            <TagInput
              value={tags}
              onChange={(next) => { setTags(next); setValue('tags', next); }}
              emptyMessage="No tags yet. Tags help readers find your book."
              error={errors.tags?.message}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              Privacy
            </label>
            <p className="text-xs text-white/80">Public: anyone can read. Friends: only your friends. Private: just you.</p>
            <div className="grid grid-cols-3 gap-3">
              {PRIVACY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setValue('privacy', opt.value)}
                  className={`flex flex-col items-center gap-1 rounded-xl p-3 border text-center transition-all duration-200 ${
                    privacy === opt.value
                      ? 'border-[#FFC300] bg-[#FFC300]/10 text-[#FFC300]'
                      : 'border-[#2a2a2a] bg-[#1e1e1e] text-white/85 hover:border-[#444] hover:text-white/80'
                  }`}
                >
                  <span className="text-sm font-semibold">{opt.label}</span>
                  <span className="text-[12px] leading-tight opacity-80">
                    {opt.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

     
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              Draft Status
            </label>
            <p className="text-xs text-white/80">Track where you are in the writing process.</p>
            <Controller
              name="draftStatus"
              control={control}
              render={({ field }) => (
                <select {...field} className={inputClass + ' appearance-none'}>
                  {(
                    Object.entries(DRAFT_STATUS_LABELS) as [DraftStatus, string][]
                  ).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              )}
            />
          </div>

        
          <div className="flex items-start justify-between gap-4 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] p-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">Explorable</p>
              <p className="text-sm text-white/80 mt-0.5">
                List this book on the Explore page so all users can discover it.
                Enabling this will make the book public.
              </p>
            </div>
            <button
              type="button"
              data-testid="explorable-toggle"
              data-state={explorable ? 'checked' : 'unchecked'}
              onClick={() => {
                const next = !explorable;
                setValue('explorable', next);
                if (next) setValue('privacy', 'PUBLIC');
              }}
              className={`relative inline-flex shrink-0 w-11 h-6 rounded-full transition-colors duration-200 ${
                explorable ? 'bg-[#FFC300]' : 'bg-[#3a3a3a]'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                  explorable ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold text-white uppercase tracking-wider">Comments</p>
            <div className="flex items-start justify-between gap-4 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] p-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">Book Comments</p>
                <p className="text-xs text-white/80 mt-0.5">
                  Turn off if you&apos;d prefer not to receive comments.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setValue('commentsEnabled', !commentsEnabled)}
                className={`relative inline-flex shrink-0 w-11 h-6 rounded-full transition-colors duration-200 ${
                  commentsEnabled ? 'bg-[#FFC300]' : 'bg-[#3a3a3a]'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                    commentsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-start justify-between gap-4 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] p-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">Chapter Comments</p>
                <p className="text-xs text-white/80 mt-0.5">
                  Turn off if you&apos;d prefer not to receive comments on individual chapters.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setValue('chapterCommentsEnabled', !chapterCommentsEnabled)}
                className={`relative inline-flex shrink-0 w-11 h-6 rounded-full transition-colors duration-200 ${
                  chapterCommentsEnabled ? 'bg-[#FFC300]' : 'bg-[#3a3a3a]'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                    chapterCommentsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {!isEdit && (
            <>
            <div className="rounded-xl border border-[#2a2a2a] overflow-hidden">
              <button
                type="button"
                onClick={() => setBookDocxOpen((o) => !o)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm text-white/85 hover:text-white/80 hover:bg-white/3 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-yellow-500" />
                  Upload full book from DOCX
                  <span className="text-[11px] text-white/80">(optional)</span>
                </span>
                {bookDocxOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {bookDocxOpen && (
                <div className="px-4 pb-4 space-y-4 border-t border-[#2a2a2a]">
                  <div className="mt-4 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] p-4 space-y-3">
                    <p className="text-xs font-semibold text-[#FFC300]/80 uppercase tracking-wide">
                      How to format your document
                    </p>

                    <p className="text-xs text-white/80 leading-relaxed">
                      Beehive splits your document into chapters using{' '}
                      <strong className="text-white">Heading 1</strong> — the
                      style selector in Word or Google Docs (not just big or
                      bold text). Every time it sees a Heading 1, it starts a
                      new chapter and uses that text as the title.
                    </p>

                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold text-[#FFC300]/70 uppercase tracking-wide">
                        Example structure
                      </p>
                      <div className="rounded-lg bg-[#252525] border border-[#2a2a2a] p-3 space-y-1.5 font-mono text-[11px]">
                        <p className="text-[#FFC300]/80">▸ Heading 1 — &quot;The Beginning&quot;</p>
                        <p className="text-white/80 pl-3">It was a dark and stormy night…</p>
                        <p className="text-white/80 pl-3">She ran through the forest…</p>
                        <p className="text-[#FFC300]/80 pt-1">▸ Heading 1 — &quot;The Conflict&quot;</p>
                        <p className="text-white/80 pl-3">Two weeks had passed since…</p>
                        <p className="text-[#FFC300]/80 pt-1">▸ Heading 1 — &quot;The Reckoning&quot;</p>
                        <p className="text-white/80 pl-3">She hadn&apos;t expected to see him…</p>
                      </div>
                      <p className="text-[11px] text-white/80">
                        → Beehive creates <strong className="text-white">3 chapters</strong> from this document.
                      </p>
                    </div>

                    <div className="space-y-1.5 text-[11px] text-white/80 pt-1 border-t border-[#2a2a2a]">
                      <p className="font-semibold text-white/80 pt-1">Quick tips</p>
                      <p>• In <strong className="text-white">Word</strong>: Home tab → Styles panel → click <em>Heading 1</em></p>
                      <p>• In <strong className="text-white">Google Docs</strong>: Format menu → Paragraph styles → <em>Heading 1</em></p>
                      <p>• Only use Heading 1 for chapter titles — nothing else</p>
                      <p>• Everything before the first Heading 1 (e.g. a cover page) is skipped</p>
                    </div>
                  </div>

                  <label className="relative overflow-hidden flex flex-col items-center justify-center gap-3 w-full h-28 rounded-xl border-2 border-dashed border-[#2a2a2a] bg-[#1e1e1e] cursor-pointer hover:border-[#FFC300]/40 transition-colors">
                    {bookDocxFileName ? (
                      <>
                        <FileText className="w-5 h-5 text-[#FFC300]/70" />
                        <span className="text-xs text-white/80">
                          {bookDocxFileName}
                        </span>
                        {bookDocxChapterCount !== null && (
                          <span className="text-[11px] text-[#FFC300]/60">
                            {bookDocxChapterCount} chapter
                            {bookDocxChapterCount !== 1 ? 's' : ''} found —
                            click to replace
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-5 h-5 text-white/85" />
                        <span className="text-sm text-white/85">
                          Select a .docx file
                        </span>
                        <span className="text-xs text-white/80">
                          Max 10 MB · Heading 1 per chapter
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      className="sr-only"
                      onChange={handleBookDocxSelect}
                    />
                  </label>

                  {bookDocxError && (
                    <div className="flex items-start gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-3">
                      <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                      <p className="text-sm text-white/80">{bookDocxError}</p>
                    </div>
                  )}

                  {bookDocxChapterCount !== null &&
                    bookDocxChapterCount > 0 && (
                      <p className="text-xs text-white/80">
                        When you click &quot;Create Book&quot;, the book will be
                        saved first, then all {bookDocxChapterCount} chapter
                        {bookDocxChapterCount !== 1 ? 's' : ''} will be imported
                        automatically.
                      </p>
                    )}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-[#2a2a2a] overflow-hidden">
              <button
                type="button"
                onClick={() => setBookEpubOpen((o) => !o)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm text-white/85 hover:text-white/80 hover:bg-white/3 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-yellow-500" />
                  Upload full book from EPUB
                  <span className="text-[11px] text-white/80">(optional)</span>
                </span>
                {bookEpubOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {bookEpubOpen && (
                <div className="px-4 pb-4 space-y-4 border-t border-[#2a2a2a]">
                  <div className="mt-4 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] p-4 space-y-3">
                    <p className="text-xs font-semibold text-[#FFC300]/80 uppercase tracking-wide">
                      How chapters are detected
                    </p>
                    <p className="text-xs text-white/80 leading-relaxed">
                      Beehive reads each spine item in the EPUB and uses its{' '}
                      <strong className="text-white">&lt;h1&gt;</strong> tag as the chapter
                      title. Navigation and cover pages are skipped automatically.
                    </p>
                    <div className="space-y-1.5 text-[11px] text-white/80 pt-1 border-t border-[#2a2a2a]">
                      <p className="font-semibold text-white/80 pt-1">Tips</p>
                      <p>• Each EPUB chapter should have a single &lt;h1&gt; heading</p>
                      <p>• Body text is imported as-is; rich formatting may be simplified</p>
                      <p>• Max file size: 50 MB</p>
                    </div>
                  </div>

                  <label className="relative overflow-hidden flex flex-col items-center justify-center gap-3 w-full h-28 rounded-xl border-2 border-dashed border-[#2a2a2a] bg-[#1e1e1e] cursor-pointer hover:border-[#FFC300]/40 transition-colors">
                    {bookEpubFileName ? (
                      <>
                        <FileText className="w-5 h-5 text-[#FFC300]/70" />
                        <span className="text-xs text-white/80">
                          {bookEpubFileName}
                        </span>
                        {bookEpubChapterCount !== null && (
                          <span className="text-[11px] text-[#FFC300]/60">
                            {bookEpubChapterCount} chapter
                            {bookEpubChapterCount !== 1 ? 's' : ''} found —
                            click to replace
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-5 h-5 text-white/85" />
                        <span className="text-sm text-white/85">
                          Select a .epub file
                        </span>
                        <span className="text-xs text-white/80">
                          Max 50 MB · one &lt;h1&gt; per chapter
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept=".epub,application/epub+zip"
                      className="sr-only"
                      onChange={handleBookEpubSelect}
                    />
                  </label>

                  {bookEpubError && (
                    <div className="flex items-start gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-3">
                      <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                      <p className="text-sm text-white/80">{bookEpubError}</p>
                    </div>
                  )}

                  {bookEpubChapterCount !== null && bookEpubChapterCount > 0 && (
                    <p className="text-xs text-white/80">
                      When you click &quot;Create Book&quot;, the book will be
                      saved first, then all {bookEpubChapterCount} chapter
                      {bookEpubChapterCount !== 1 ? 's' : ''} will be imported
                      automatically.
                    </p>
                  )}
                </div>
              )}
            </div>
            </>
          )}

          {serverError && (
            <div className="flex items-start gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-3">
              <p className="text-sm text-white/80">{serverError}</p>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            {isEdit ? (
              <DeleteDialog
                itemType="book"
                itemName={book?.title}
                onDelete={async () => {
                  const result = await deleteBookAction(book!.id);
                  if (!result.success) throw new Error(result.message);
                  router.push('/library');
                }}
              />
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              <Button asChild variant="outline">
                <Link href={cancelHref}>Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting || uploading}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />{' '}
                    {parsedChapters && parsedChapters.length > 0
                      ? 'Creating book & importing chapters…'
                      : isEdit
                        ? 'Saving…'
                        : 'Creating…'}
                  </>
                ) : isEdit ? (
                  'Save Changes'
                ) : (
                  'Create Book'
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
