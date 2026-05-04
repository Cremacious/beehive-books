'use server';

import { convertDocxFileToHtml } from '@/lib/import/docx';
import { requireAuth } from '@/lib/require-auth';


export type ParsedChapter = {
  title: string;
  content: string;
};

export type ParseDocxResult =
  | { success: true; chapters: ParsedChapter[] }
  | { success: false; message: string };

export type ParseSingleChapterResult =
  | { success: true; title: string | null; content: string }
  | { success: false; message: string };

function splitOnH1(html: string): ParsedChapter[] {
  const segments = html.split(/(?=<h1[\s>])/i);
  return segments.flatMap((segment) => {
    const match = segment.trim().match(/^<h1[^>]*>([\s\S]*?)<\/h1>([\s\S]*)$/i);
    if (!match) return [];
    const title = match[1].replace(/<[^>]+>/g, '').trim();
    const content = match[2].trim();
    return title ? [{ title, content }] : [];
  });
}

export async function parseDocxAction(formData: FormData): Promise<ParseDocxResult> {
  const userId = await requireAuth();
  if (!userId) return { success: false, message: 'Unauthorized.' };

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, message: 'No file provided.' };
  }

  if (!file.name.toLowerCase().endsWith('.docx')) {
    return { success: false, message: 'File must be a .docx document.' };
  }

  if (file.size > 10 * 1024 * 1024) {
    return { success: false, message: 'File is too large (max 10 MB).' };
  }

  try {
    const html = await convertDocxFileToHtml(file);

    if (!html.trim()) {
      return { success: false, message: 'The document appears to be empty.' };
    }

    const chapters = splitOnH1(html);

    if (chapters.length === 0) {
      return { success: false, message: 'No chapters found. Make sure each chapter starts with a Heading 1 style.' };
    }

    return { success: true, chapters };
  } catch {
    return {
      success: false,
      message: 'Could not read the file. Make sure it is a valid .docx document.',
    };
  }
}

export async function parseSingleChapterDocxAction(
  formData: FormData,
): Promise<ParseSingleChapterResult> {
  const userId = await requireAuth();
  if (!userId) return { success: false, message: 'Unauthorized.' };

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, message: 'No file provided.' };
  }

  if (!file.name.toLowerCase().endsWith('.docx')) {
    return { success: false, message: 'File must be a .docx document.' };
  }

  if (file.size > 10 * 1024 * 1024) {
    return { success: false, message: 'File is too large (max 10 MB).' };
  }

  try {
    const html = await convertDocxFileToHtml(file);

    if (!html.trim()) {
      return { success: false, message: 'The document appears to be empty.' };
    }

    const chapters = splitOnH1(html);

    if (chapters.length === 0) {

      return { success: true, title: null, content: html };
    }

    if (chapters.length === 1) {
      return { success: true, title: chapters[0].title, content: chapters[0].content };
    }


    const flatContent = chapters
      .map((c) => `<h1>${c.title}</h1>${c.content}`)
      .join('\n');

    return { success: true, title: null, content: flatContent };
  } catch {
    return {
      success: false,
      message: 'Could not read the file. Make sure it is a valid .docx document.',
    };
  }
}
