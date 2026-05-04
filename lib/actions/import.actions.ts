'use server';

import { revalidatePath } from 'next/cache';
import {
  createChapterAction,
  getBookWithChaptersAction,
} from '@/lib/actions/book.actions';
import { convertDocxFileToHtml } from '@/lib/actions/docx.actions';
import {
  parseHtmlManuscript,
  parsePlainTextManuscript,
  type ImportParseResult,
} from '@/lib/import/manuscript';

export type ParseManuscriptResult =
  | { success: true; result: ImportParseResult }
  | { success: false; message: string };

export type SaveImportResult =
  | { success: true; createdCount: number }
  | { success: false; message: string };

type ReviewedChapter = {
  title: string;
  content: string;
};

const MAX_IMPORT_FILE_BYTES = 10 * 1024 * 1024;
const MAX_IMPORT_TITLE_LENGTH = 100;

function sanitizeReviewedChapters(raw: unknown): ReviewedChapter[] {
  if (!Array.isArray(raw)) return [];

  return raw.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];

    const record = item as Record<string, unknown>;
    const title = typeof record.title === 'string' ? record.title.trim() : '';
    const content = typeof record.content === 'string' ? record.content.trim() : '';

    if (!title || !content) return [];

    return [{
      title: title.slice(0, MAX_IMPORT_TITLE_LENGTH),
      content,
    }];
  });
}

export async function parseManuscriptImportAction(
  formData: FormData,
): Promise<ParseManuscriptResult> {
  const bookId = String(formData.get('bookId') ?? '');
  await getBookWithChaptersAction(bookId);

  const pastedText = String(formData.get('text') ?? '').trim();
  const file = formData.get('file');

  if (file instanceof File && file.size > 0) {
    const fileName = file.name.toLowerCase();

    if (file.size > MAX_IMPORT_FILE_BYTES) {
      return { success: false, message: 'File is too large (max 10 MB).' };
    }

    if (fileName.endsWith('.docx')) {
      try {
        const html = await convertDocxFileToHtml(file);
        if (!html.trim()) {
          return { success: false, message: 'The document appears to be empty.' };
        }

        return { success: true, result: parseHtmlManuscript(html) };
      } catch {
        return { success: false, message: 'Could not read the DOCX file.' };
      }
    }

    if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
      const text = await file.text();
      if (!text.trim()) {
        return { success: false, message: 'The document appears to be empty.' };
      }

      return { success: true, result: parsePlainTextManuscript(text) };
    }

    return {
      success: false,
      message: 'Import supports .docx, .txt, and .md files in this v2 preview.',
    };
  }

  if (!pastedText) {
    return { success: false, message: 'Paste text or choose a file to import.' };
  }

  return { success: true, result: parsePlainTextManuscript(pastedText) };
}

export async function saveReviewedImportChaptersAction(
  bookId: string,
  reviewedChapters: unknown,
): Promise<SaveImportResult> {
  await getBookWithChaptersAction(bookId);

  const chapters = sanitizeReviewedChapters(reviewedChapters);
  if (chapters.length === 0) {
    return {
      success: false,
      message: 'Review at least one chapter with a title and content before saving.',
    };
  }

  for (const chapter of chapters) {
    const result = await createChapterAction(bookId, {
      title: chapter.title,
      content: chapter.content,
      authorNotes: '',
      collectionId: null,
    });

    if (!result.success) {
      return { success: false, message: result.message };
    }
  }

  revalidatePath(`/write/${bookId}`);
  revalidatePath(`/library/${bookId}`);

  return { success: true, createdCount: chapters.length };
}
