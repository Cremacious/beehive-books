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
