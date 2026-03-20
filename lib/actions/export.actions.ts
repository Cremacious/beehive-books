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

function htmlToXhtml(html: string): string {
  // Make HTML valid XHTML: self-close void elements
  return html
    .replace(/<br\s*>/gi, '<br/>')
    .replace(/<img([^>]*?)(?<!\/)>/gi, '<img$1/>')
    .replace(/<hr\s*>/gi, '<hr/>')
    .replace(/<input([^>]*?)(?<!\/)>/gi, '<input$1/>');
}

function buildChapterXhtml(title: string, content: string | null): string {
  const titleEscaped = escapeXml(title);
  const body = content ? htmlToXhtml(content) : '<p><em>No content.</em></p>';

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<!DOCTYPE html>',
    '<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">',
    '<head>',
    `  <title>${titleEscaped}</title>`,
    '</head>',
    '<body>',
    `  <h1>${titleEscaped}</h1>`,
    `  ${body}`,
    '</body>',
    '</html>',
  ].join('\n');
}

function buildNavXhtml(
  bookTitle: string,
  chapters: { title: string }[],
): string {
  const titleEscaped = escapeXml(bookTitle);
  const tocItems = [
    `      <li><a href="title-page.xhtml">${titleEscaped}</a></li>`,
    ...chapters.map(
      (ch, i) =>
        `      <li><a href="chapter-${i + 1}.xhtml">${escapeXml(ch.title)}</a></li>`,
    ),
  ].join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<!DOCTYPE html>',
    '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="en">',
    '<head>',
    `  <title>${titleEscaped}</title>`,
    '</head>',
    '<body>',
    '  <nav epub:type="toc" id="toc">',
    `    <h1>${titleEscaped}</h1>`,
    '    <ol>',
    tocItems,
    '    </ol>',
    '  </nav>',
    '</body>',
    '</html>',
  ].join('\n');
}

function buildNcx(
  bookTitle: string,
  bookId: string,
  chapters: { title: string }[],
): string {
  const titleEscaped = escapeXml(bookTitle);
  let playOrder = 1;

  const navPoints = [
    `  <navPoint id="navpoint-title" playOrder="${playOrder++}">`,
    `    <navLabel><text>${titleEscaped}</text></navLabel>`,
    `    <content src="title-page.xhtml"/>`,
    `  </navPoint>`,
    ...chapters.flatMap((ch, i) => [
      `  <navPoint id="navpoint-${i + 1}" playOrder="${playOrder++}">`,
      `    <navLabel><text>${escapeXml(ch.title)}</text></navLabel>`,
      `    <content src="chapter-${i + 1}.xhtml"/>`,
      `  </navPoint>`,
    ]),
  ].join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<!DOCTYPE ncx PUBLIC "-//NISO//DTD ncx 2005-1//EN" "http://www.daisy.org/z3986/2005/ncx-2005-1.dtd">',
    '<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">',
    '<head>',
    `  <meta name="dtb:uid" content="beehive-books-${bookId}"/>`,
    `  <meta name="dtb:depth" content="1"/>`,
    `  <meta name="dtb:totalPageCount" content="0"/>`,
    `  <meta name="dtb:maxPageNumber" content="0"/>`,
    '</head>',
    `<docTitle><text>${titleEscaped}</text></docTitle>`,
    '<navMap>',
    navPoints,
    '</navMap>',
    '</ncx>',
  ].join('\n');
}

export async function exportBookToEpubAction(
  bookId: string,
): Promise<{ success: boolean; base64?: string; filename?: string; message?: string }> {
  try {
    const data = await getBookForExportAction(bookId);
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    const bookTitle = data.book.title;
    const bookAuthor = data.book.author;
    const uid = `beehive-books-${bookId}`;

    // ── 1. mimetype — MUST be first, MUST be uncompressed ─────────────────────
    zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

    // ── 2. META-INF/container.xml ─────────────────────────────────────────────
    zip.file(
      'META-INF/container.xml',
      [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">',
        '  <rootfiles>',
        '    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>',
        '  </rootfiles>',
        '</container>',
      ].join('\n'),
    );

    // ── 3. Build chapter files ────────────────────────────────────────────────
    const chapterIds = data.chapters.map((_, i) => `chapter-${i + 1}`);

    for (let i = 0; i < data.chapters.length; i++) {
      const ch = data.chapters[i];
      zip.file(`OEBPS/${chapterIds[i]}.xhtml`, buildChapterXhtml(ch.title, ch.content));
    }

    // ── 4. Title page ─────────────────────────────────────────────────────────
    const descriptionParagraph = data.book.description
      ? `  <p>${escapeXml(stripHtmlToText(data.book.description))}</p>`
      : '';

    const titlePageXhtml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<!DOCTYPE html>',
      '<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">',
      '<head>',
      `  <title>${escapeXml(bookTitle)}</title>`,
      '</head>',
      '<body>',
      `  <h1>${escapeXml(bookTitle)}</h1>`,
      `  <p>by ${escapeXml(bookAuthor)}</p>`,
      descriptionParagraph,
      '</body>',
      '</html>',
    ].join('\n');
    zip.file('OEBPS/title-page.xhtml', titlePageXhtml);

    // ── 5. nav.xhtml (EPUB 3 navigation) ─────────────────────────────────────
    zip.file('OEBPS/nav.xhtml', buildNavXhtml(bookTitle, data.chapters));

    // ── 6. toc.ncx (EPUB 2 fallback) ─────────────────────────────────────────
    zip.file('OEBPS/toc.ncx', buildNcx(bookTitle, bookId, data.chapters));

    // ── 7. content.opf (package document) ────────────────────────────────────
    const manifestItems = [
      '    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>',
      '    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>',
      '    <item id="title-page" href="title-page.xhtml" media-type="application/xhtml+xml"/>',
      ...chapterIds.map(
        (id) => `    <item id="${id}" href="${id}.xhtml" media-type="application/xhtml+xml"/>`,
      ),
    ].join('\n');

    const spineItems = [
      '    <itemref idref="title-page"/>',
      ...chapterIds.map((id) => `    <itemref idref="${id}"/>`),
    ].join('\n');

    const contentOpf = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid">',
      '  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">',
      `    <dc:identifier id="bookid">${escapeXml(uid)}</dc:identifier>`,
      `    <dc:title>${escapeXml(bookTitle)}</dc:title>`,
      `    <dc:creator>${escapeXml(bookAuthor)}</dc:creator>`,
      '    <dc:language>en</dc:language>',
      `    <meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d+Z$/, 'Z')}</meta>`,
      '  </metadata>',
      '  <manifest>',
      manifestItems,
      '  </manifest>',
      `  <spine toc="ncx">`,
      spineItems,
      '  </spine>',
      '</package>',
    ].join('\n');
    zip.file('OEBPS/content.opf', contentOpf);

    // ── Generate ZIP ──────────────────────────────────────────────────────────
    const buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
    const base64 = buffer.toString('base64');
    const filename = `${bookTitle.replace(/[^a-z0-9]/gi, '_')}.epub`;
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
