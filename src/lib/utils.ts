import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slateContentToPlainText(content: unknown): string {
  try {
    const nodes = typeof content === 'string' ? JSON.parse(content) : content;
    if (!Array.isArray(nodes)) return String(content ?? '');

    const extract = (nodes: any[]): string =>
      nodes
        .map((n) => {
          if (typeof n === 'string') return n;
          if ('text' in n) return n.text || '';
          if (Array.isArray(n.children)) return extract(n.children);
          return '';
        })
        .join(' ');
    return extract(nodes).replace(/\s+/g, ' ').trim();
  } catch {
    return String(content ?? '');
  }
}

export function getBookWordCount(book: { chapters: { content: string }[] }) {
  return book.chapters.reduce((total, chapter) => {
    if (!chapter.content) return total;
    const words = chapter.content.trim().split(/\s+/).filter(Boolean);
    return total + words.length;
  }, 0);
}

export function getChapterWordCount(chapter: { content: string }) {
  if (!chapter.content) return 0;
  return chapter.content.trim().split(/\s+/).filter(Boolean).length;
}