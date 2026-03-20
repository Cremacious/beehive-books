'use server';

import { requireAuth } from '@/lib/require-auth';
import type { ParsedChapter } from './docx.actions';

export type ParseEpubResult =
  | { success: true; chapters: ParsedChapter[] }
  | { success: false; message: string };

function extractFromXhtml(xhtml: string): { title: string; content: string } {
  // Title: prefer <h1>, fall back to <title>
  const h1Match = xhtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const titleTagMatch = xhtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const rawTitle = h1Match?.[1] ?? titleTagMatch?.[1] ?? '';
  const title = rawTitle.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();

  // Body content: strip the <h1> (already used as title), then return the rest
  const bodyMatch = xhtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const bodyHtml = bodyMatch?.[1] ?? xhtml;
  const withoutTitle = h1Match ? bodyHtml.replace(h1Match[0], '') : bodyHtml;

  // Convert block-level closes to newlines before stripping tags
  const text = withoutTitle
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Re-wrap lines as <p> tags for TipTap
  const content = text
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => `<p>${line.trim()}</p>`)
    .join('');

  return { title, content };
}

export async function parseEpubAction(
  formData: FormData,
): Promise<ParseEpubResult> {
  const userId = await requireAuth();
  if (!userId) return { success: false, message: 'Unauthorized.' };

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, message: 'No file provided.' };
  }
  if (!file.name.toLowerCase().endsWith('.epub')) {
    return { success: false, message: 'File must be a .epub file.' };
  }
  if (file.size > 50 * 1024 * 1024) {
    return { success: false, message: 'File is too large (max 50 MB).' };
  }

  try {
    const { Epub } = await import('@smoores/epub');
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Epub.from() only reads the ZIP structure — does NOT call parseMetadataItem
    const epub = await Epub.from(uint8Array);

    // getSpineItems() reads the manifest/spine elements only — safe from the metadata bug
    const spineItems = await epub.getSpineItems();

    const chapters: ParsedChapter[] = [];

    for (const item of spineItems) {
      if (item.mediaType !== 'application/xhtml+xml') continue;

      // readItemContents reads raw bytes from the ZIP — no metadata parsing
      const xhtml = await epub.readItemContents(item.id, 'utf-8');
      const { title, content } = extractFromXhtml(xhtml);

      // Skip nav documents and other structural files
      if (item.properties?.includes('nav')) continue;
      if (!title && !content) continue;

      chapters.push({ title: title || `Chapter ${chapters.length + 1}`, content });
    }

    await epub.close();

    if (chapters.length === 0) {
      return { success: false, message: 'No readable chapters found in this EPUB.' };
    }

    return { success: true, chapters };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { success: false, message: `Could not read the EPUB file. ${msg}` };
  }
}
