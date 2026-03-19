'use server';

import { getBookForExportAction } from './book.actions';

function buildHtml(
  book: { title: string; author: string; description: string },
  chapters: { title: string; content: string | null }[],
): string {
  const chapterHtml = chapters
    .map(
      (ch) =>
        `<h1>${ch.title}</h1>${ch.content ?? '<p><em>No content.</em></p>'}`,
    )
    .join('<br/>');

  return `
    <html><body>
      <h1>${book.title}</h1>
      <p><strong>by ${book.author}</strong></p>
      ${book.description ? `<p>${book.description}</p>` : ''}
      <br/>
      ${chapterHtml}
    </body></html>
  `;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function stripHtmlToText(html: string): string {
  return html
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
}

function buildChapterXhtml(title: string, content: string | null): string {
  const titleEscaped = escapeXml(title);
  const paragraphs = (content ? stripHtmlToText(content) : '')
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => `    <p>${escapeXml(line.trim())}</p>`)
    .join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<!DOCTYPE html>',
    '<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">',
    '<head>',
    `  <title>${titleEscaped}</title>`,
    '</head>',
    '<body>',
    `  <h1>${titleEscaped}</h1>`,
    paragraphs,
    '</body>',
    '</html>',
  ].join('\n');
}

export async function exportBookToEpubAction(
  bookId: string,
): Promise<{ success: boolean; base64?: string; filename?: string; message?: string }> {
  try {
    const data = await getBookForExportAction(bookId);
    const { Epub } = await import('@smoores/epub');

    const epub = await Epub.create({
      title: data.book.title,
      language: new Intl.Locale('en'),
      identifier: `beehive-books-${bookId}`,
      creators: [{ name: data.book.author }],
      date: new Date(),
    });

    const descriptionParagraph = data.book.description
      ? `  <p>${escapeXml(stripHtmlToText(data.book.description))}</p>`
      : '';

    const titlePageXhtml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<!DOCTYPE html>',
      '<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">',
      '<head>',
      `  <title>${escapeXml(data.book.title)}</title>`,
      '</head>',
      '<body>',
      `  <h1>${escapeXml(data.book.title)}</h1>`,
      `  <p>by ${escapeXml(data.book.author)}</p>`,
      descriptionParagraph,
      '</body>',
      '</html>',
    ].join('\n');

    await epub.addManifestItem(
      { id: 'title-page', href: 'title-page.xhtml', mediaType: 'application/xhtml+xml' },
      titlePageXhtml,
      'utf-8',
    );
    await epub.addSpineItem('title-page');

    for (let i = 0; i < data.chapters.length; i++) {
      const ch = data.chapters[i];
      const id = `chapter-${i + 1}`;
      const xhtml = buildChapterXhtml(ch.title, ch.content);
      await epub.addManifestItem(
        { id, href: `${id}.xhtml`, mediaType: 'application/xhtml+xml' },
        xhtml,
        'utf-8',
      );
      await epub.addSpineItem(id);
    }

    const uint8Array = await epub.writeToArray();
    await epub.close();

    const base64 = Buffer.from(uint8Array).toString('base64');
    const filename = `${data.book.title.replace(/[^a-z0-9]/gi, '_')}.epub`;
    return { success: true, base64, filename };
  } catch (e) {
    return { success: false, message: e instanceof Error ? e.message : 'EPUB export failed.' };
  }
}

export async function exportBookToDocxAction(
  bookId: string,
): Promise<{ success: boolean; base64?: string; filename?: string; message?: string }> {
  try {
    const data = await getBookForExportAction(bookId);
    const html = buildHtml(data.book, data.chapters);

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('html-to-docx');
    const htmlToDocx = mod.default ?? mod;
    const buffer: Buffer = await htmlToDocx(html, null, {
      table: { row: { cantSplit: true } },
      footer: true,
      pageNumber: true,
    });

    const base64 = buffer.toString('base64');
    const filename = `${data.book.title.replace(/[^a-z0-9]/gi, '_')}.docx`;
    return { success: true, base64, filename };
  } catch (e) {
    return { success: false, message: e instanceof Error ? e.message : 'Export failed.' };
  }
}
