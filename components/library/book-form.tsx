'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
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
  const [parsedChapters, setParsedChapters] = useState<ParsedChapter[] | null>(
    null,
  );

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
      title: book?.title ?? '',
      author: book?.author ?? '',
      category: book?.category ?? '',
      genre: book?.genre ?? '',
      description: book?.description ?? '',
      privacy: (book?.privacy as BookFormData['privacy']) ?? 'PRIVATE',
      explorable: book?.explorable ?? false,
      draftStatus:
        (book?.draftStatus as BookFormData['draftStatus']) ?? 'FIRST_DRAFT',
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const privacy = watch('privacy');
  const explorable = watch('explorable');
  const draftStatus = watch('draftStatus');
  const descriptionValue = watch('description') ?? '';
  const descChars = descriptionValue.length;
  const descWords = descriptionValue.trim()
    ? descriptionValue.trim().split(/\s+/).filter(Boolean).length
    : 0;

  async function handleBookDocxSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setBookDocxError('');
    setBookDocxChapterCount(null);
    setParsedChapters(null);
    setBookDocxFileName(file.name);

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
    'w-full rounded-xl bg-[#1e1e1e] border border-[#333] px-4 py-2.5 text-sm text-white ' +
    'placeholder-white/25 focus:outline-none focus:border-[#FFC300]/50 ' +
    'focus:ring-1 focus:ring-[#FFC300]/20 transition-all';

  const errorClass = 'text-xs text-red-400 mt-1';

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
                <div className="w-36 h-52 rounded-xl border-2 border-dashed border-[#3a3a3a] bg-[#1e1e1e] flex flex-col items-center justify-center gap-2 group-hover:border-[#FFC300]/40 transition-colors">
                  {uploading ? (
                    <Loader2 className="w-6 h-6 text-[#FFC300]/50 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-white/25 group-hover:text-[#FFC300]/50 transition-colors" />
                      <span className="text-xs text-white/80 text-center px-3 leading-snug group-hover:text-white/50 transition-colors">
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
                className="flex items-center gap-1 text-xs text-red-400/70 hover:text-red-400 transition-colors"
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
            <label className="text-sm font-medium text-yellow-500 mainFont">
              Book Title <span className="text-red-400">*</span>
            </label>
            <input
              {...register('title')}
              type="text"
              placeholder="Enter your book title…"
              className={inputClass}
            />
            {errors.title && (
              <p className={errorClass}>{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-yellow-500 mainFont">
              Author Name <span className="text-red-400">*</span>
            </label>
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
              <label className="text-sm font-medium text-yellow-500 mainFont">
                Category <span className="text-red-400">*</span>
              </label>
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
              <label className="text-sm font-medium text-yellow-500 mainFont">
                Genre <span className="text-red-400">*</span>
              </label>
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
            <label className="text-sm font-medium text-yellow-500 mainFont">
              Description <span className="text-red-400">*</span>
            </label>
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
                      ? 'text-red-400'
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
                      ? 'text-red-400'
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-yellow-500 mainFont">
              Privacy <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {PRIVACY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setValue('privacy', opt.value)}
                  className={`flex flex-col items-center gap-1 rounded-xl p-3 border text-center transition-all duration-200 ${
                    privacy === opt.value
                      ? 'border-[#FFC300] bg-[#FFC300]/10 text-[#FFC300]'
                      : 'border-[#333] bg-[#1e1e1e] text-white/85 hover:border-[#444] hover:text-white/65'
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
            <label className="text-sm font-medium text-yellow-500 mainFont">
              Draft Status
            </label>
            <select
              value={draftStatus}
              onChange={(e) =>
                setValue('draftStatus', e.target.value as DraftStatus)
              }
              className={inputClass + ' appearance-none'}
            >
              {(
                Object.entries(DRAFT_STATUS_LABELS) as [DraftStatus, string][]
              ).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <p className="text-sm text-white/80">
              Track which revision your book is on. Drafts show a status label
              on your book page.
            </p>
          </div>

        
          <div className="flex items-start justify-between gap-4 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] p-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-yellow-500 mainFont">Explorable</p>
              <p className="text-sm text-white/80 mt-0.5">
                List this book on the Explore page so all users can discover it.
                Enabling this will make the book public.
              </p>
            </div>
            <button
              type="button"
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

          {!isEdit && (
            <div className="rounded-xl border border-[#2a2a2a] overflow-hidden">
              <button
                type="button"
                onClick={() => setBookDocxOpen((o) => !o)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm text-white/85 hover:text-white/75 hover:bg-white/3 transition-colors"
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
                        <p className="text-white/60 pl-3">It was a dark and stormy night…</p>
                        <p className="text-white/60 pl-3">She ran through the forest…</p>
                        <p className="text-[#FFC300]/80 pt-1">▸ Heading 1 — &quot;The Conflict&quot;</p>
                        <p className="text-white/60 pl-3">Two weeks had passed since…</p>
                        <p className="text-[#FFC300]/80 pt-1">▸ Heading 1 — &quot;The Reckoning&quot;</p>
                        <p className="text-white/60 pl-3">She hadn&apos;t expected to see him…</p>
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

                  <label className="relative overflow-hidden flex flex-col items-center justify-center gap-3 w-full h-28 rounded-xl border-2 border-dashed border-[#3a3a3a] bg-[#1e1e1e] cursor-pointer hover:border-[#FFC300]/40 transition-colors">
                    {bookDocxFileName ? (
                      <>
                        <FileText className="w-5 h-5 text-[#FFC300]/70" />
                        <span className="text-xs text-white/60">
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
                    <div className="flex items-start gap-2 rounded-xl bg-red-950/40 border border-red-800/40 px-4 py-3">
                      <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                      <p className="text-sm text-red-400">{bookDocxError}</p>
                    </div>
                  )}

                  {bookDocxChapterCount !== null &&
                    bookDocxChapterCount > 0 && (
                      <p className="text-xs text-white/35">
                        When you click &quot;Create Book&quot;, the book will be
                        saved first, then all {bookDocxChapterCount} chapter
                        {bookDocxChapterCount !== 1 ? 's' : ''} will be imported
                        automatically.
                      </p>
                    )}
                </div>
              )}
            </div>
          )}

          {serverError && (
            <div className="flex items-start gap-2 rounded-xl bg-red-950/40 border border-red-800/40 px-4 py-3">
              <p className="text-sm text-red-400">{serverError}</p>
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
