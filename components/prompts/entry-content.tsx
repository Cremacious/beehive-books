'use client';

import { RichTextEditor } from '@/components/editor/rich-text-editor';

export function EntryContent({ content }: { content: string }) {
  return <RichTextEditor content={content} onChange={() => {}} editable={false} />;
}
