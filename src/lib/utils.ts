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
