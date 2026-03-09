export async function exportBookToPdf(
  book: { title: string; author: string; description: string },
  chapters: { title: string; content: string | null }[],
): Promise<void> {
  const { default: jsPDF } = await import('jspdf');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 72;
  const maxW = pageW - margin * 2;
  let y = margin;

  function stripHtml(html: string): string {
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<\/h[1-6]>/gi, '\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  function addText(
    text: string,
    size: number,
    options: { bold?: boolean; center?: boolean; color?: [number, number, number] } = {},
  ) {
    const { bold = false, center = false, color = [0, 0, 0] } = options;
    doc.setFontSize(size);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setTextColor(...color);

    const x = center ? pageW / 2 : margin;
    const align = center ? 'center' : 'left';
    const lineHeight = size * 1.45;

    const paragraphs = text.split('\n');
    for (const para of paragraphs) {
      if (!para.trim()) {
        y += lineHeight * 0.6;
        continue;
      }
      const lines = doc.splitTextToSize(para, maxW);
      for (const line of lines) {
        if (y + lineHeight > pageH - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, x, y, { align });
        y += lineHeight;
      }
    }
  }

  // Title
  addText(book.title, 26, { bold: true, center: true });
  y += 4;
  addText(`by ${book.author}`, 13, { center: true, color: [80, 80, 80] });
  y += 20;

  if (book.description) {
    addText(stripHtml(book.description), 11, { color: [60, 60, 60] });
    y += 16;
  }

  // Divider line
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageW - margin, y);
  y += 24;

  for (const ch of chapters) {
    if (y + 60 > pageH - margin) {
      doc.addPage();
      y = margin;
    }

    addText(ch.title, 16, { bold: true });
    y += 8;

    const content = ch.content ? stripHtml(ch.content) : 'No content.';
    addText(content, 11);
    y += 28;

    // Chapter divider
    if (y + 30 < pageH - margin) {
      doc.setDrawColor(220, 220, 220);
      doc.line(margin, y - 10, pageW - margin, y - 10);
    }
  }

  const filename = `${book.title.replace(/[^a-z0-9]/gi, '_')}.pdf`;
  doc.save(filename);
}
