'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
} from 'lucide-react';

type Props = {
  content?: string;
  onChange?: (html: string) => void;
  editable?: boolean;
};

export function RichTextEditor({
  content = '',
  onChange,
  editable = true,
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Begin your chapter here…' }),
    ],
    content,
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  if (!editor) return null;

  if (!editable) {
    return (
      <EditorContent
        editor={editor}
        className="prose prose-invert prose-sm max-w-none text-white leading-relaxed
          [&_.ProseMirror]:outline-none
          [&_.ProseMirror_p]:mb-5
          [&_.ProseMirror_em]:text-white [&_.ProseMirror_em]:italic
          [&_.ProseMirror_strong]:text-white [&_.ProseMirror_strong]:font-semibold
          [&_.ProseMirror_h1]:text-white [&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:mb-4
          [&_.ProseMirror_h2]:text-white [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h2]:mb-3
          [&_.ProseMirror_blockquote]:border-l-2 [&_.ProseMirror_blockquote]:border-[#FFC300]/30 [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:text-white [&_.ProseMirror_blockquote]:italic
          [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5 [&_.ProseMirror_ul]:mb-4
          [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5 [&_.ProseMirror_ol]:mb-4
          [&_.ProseMirror_li]:mb-1"
      />
    );
  }

  return (
    <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] shadow-xl overflow-hidden">
      <div role="toolbar" aria-label="Text formatting" className="flex items-center gap-0.5 px-3 py-2 border-b border-[#2a2a2a] flex-wrap">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold"
        >
          <Bold className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic"
        >
          <Italic className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          title="Strikethrough"
        >
          <Underline className="w-3.5 h-3.5" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          active={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="w-3.5 h-3.5" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Bullet list"
        >
          <List className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Numbered list"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Blockquote"
        >
          <Quote className="w-3.5 h-3.5" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          active={false}
          title="Undo"
        >
          <Undo className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          active={false}
          title="Redo"
        >
          <Redo className="w-3.5 h-3.5" />
        </ToolbarButton>

        <span
          className="ml-auto text-xs text-white"
          aria-live="polite"
          aria-label={`${editor.getText().trim().split(/\s+/).filter(Boolean).length} words`}
          aria-atomic="true"
        >
          {editor.getText().trim().split(/\s+/).filter(Boolean).length} words
        </span>
      </div>

      <EditorContent
        editor={editor}
        className="min-h-105 p-6
          [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-95
          [&_.ProseMirror]:text-sm [&_.ProseMirror]:text-white/80 [&_.ProseMirror]:leading-relaxed
          [&_.ProseMirror_p]:mb-4
          [&_.ProseMirror_h1]:text-white [&_.ProseMirror_h1]:text-xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:mb-3
          [&_.ProseMirror_h2]:text-white [&_.ProseMirror_h2]:text-lg [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h2]:mb-2
          [&_.ProseMirror_blockquote]:border-l-2 [&_.ProseMirror_blockquote]:border-[#FFC300]/30 [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:text-white/50 [&_.ProseMirror_blockquote]:italic
          [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5 [&_.ProseMirror_ul]:text-white/80
          [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5 [&_.ProseMirror_ol]:text-white/80
          [&_.ProseMirror_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]
          [&_.ProseMirror_.is-editor-empty:first-child::before]:text-white/20
          [&_.ProseMirror_.is-editor-empty:first-child::before]:pointer-events-none
          [&_.ProseMirror_.is-editor-empty:first-child::before]:float-left
          [&_.ProseMirror_.is-editor-empty:first-child::before]:h-0"
      />
    </div>
  );
}

function ToolbarButton({
  children,
  onClick,
  active,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active: boolean;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      onClick={onClick}
      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
        active
          ? 'bg-[#FFC300]/15 text-[#FFC300]'
          : 'text-white hover:text-white hover:bg-white/[0.07]'
      }`}
    >
      <span aria-hidden="true">{children}</span>
    </button>
  );
}

function Divider() {
  return <span aria-hidden="true" className="w-px h-4 bg-[#333] mx-1 shrink-0" />;
}
