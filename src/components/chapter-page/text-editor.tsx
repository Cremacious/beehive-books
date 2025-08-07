'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Color from '@tiptap/extension-color';
import Heading from '@tiptap/extension-heading';
import { useEffect } from 'react';

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  name?: string;
}

const Tiptap = ({ value, onChange, onBlur, name }: TextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      FontFamily,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
      Color,
      Heading.configure({ levels: [1, 2, 3] }),
    ],
    content: value ?? '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        name: name ?? '',
      },
      handleDOMEvents: {
        blur: () => {
          if (onBlur) onBlur();
          return false;
        },
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value ?? '', { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="bg-white border rounded-xl shadow-xl p-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <select
          className="border rounded px-2 py-1"
          onChange={(e) =>
            editor && editor.chain().focus().setFontFamily(e.target.value).run()
          }
          defaultValue="inherit"
        >
          <option value="inherit">Font</option>
          <option value="serif">Serif</option>
          <option value="sans-serif">Sans</option>
          <option value="monospace">Mono</option>
          <option value="'EB Garamond Variable', serif">Garamond</option>
        </select>
        <select
          className="border rounded px-2 py-1"
          onChange={(e) =>
            editor && editor.chain().focus().setFontSize(e.target.value).run()
          }
          defaultValue="16px"
        >
          <option value="12px">Small</option>
          <option value="16px">Normal</option>
          <option value="20px">Large</option>
          <option value="28px">Extra Large</option>
        </select>
        <input
          type="color"
          className="border rounded w-8 h-8 p-0"
          onChange={(e) =>
            editor && editor.chain().focus().setColor(e.target.value).run()
          }
        />

        <button
          className={`px-2 py-1 rounded border ${
            editor?.isActive('bold') ? 'bg-yellow-200' : ''
          }`}
          onClick={() => editor && editor.chain().focus().toggleBold().run()}
          aria-label="Bold"
        >
          <b>B</b>
        </button>
        <button
          className={`px-2 py-1 rounded border ${
            editor?.isActive('italic') ? 'bg-yellow-200' : ''
          }`}
          onClick={() => editor && editor.chain().focus().toggleItalic().run()}
          aria-label="Italic"
        >
          <i>I</i>
        </button>
        <button
          className={`px-2 py-1 rounded border ${
            editor?.isActive('underline') ? 'bg-yellow-200' : ''
          }`}
          onClick={() =>
            editor && editor.chain().focus().toggleUnderline().run()
          }
          aria-label="Underline"
        >
          <u>U</u>
        </button>
        <button
          className={`px-2 py-1 rounded border ${
            editor?.isActive('heading', { level: 1 }) ? 'bg-yellow-200' : ''
          }`}
          onClick={() =>
            editor && editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          H1
        </button>
        <button
          className={`px-2 py-1 rounded border ${
            editor?.isActive('heading', { level: 2 }) ? 'bg-yellow-200' : ''
          }`}
          onClick={() =>
            editor && editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          H2
        </button>
        <button
          className={`px-2 py-1 rounded border ${
            editor?.isActive('bulletList') ? 'bg-yellow-200' : ''
          }`}
          onClick={() =>
            editor && editor.chain().focus().toggleBulletList().run()
          }
        >
          • List
        </button>
        <button
          className={`px-2 py-1 rounded border ${
            editor?.isActive('orderedList') ? 'bg-yellow-200' : ''
          }`}
          onClick={() =>
            editor && editor.chain().focus().toggleOrderedList().run()
          }
        >
          1. List
        </button>
        <button
          className={`px-2 py-1 rounded border ${
            editor?.isActive('blockquote') ? 'bg-yellow-200' : ''
          }`}
          onClick={() =>
            editor && editor.chain().focus().toggleBlockquote().run()
          }
        >
          “”
        </button>
        <button
          className={`px-2 py-1 rounded border ${
            editor?.isActive('code') ? 'bg-yellow-200' : ''
          }`}
          onClick={() => editor && editor.chain().focus().toggleCode().run()}
        >
          {'</>'}
        </button>
        <button
          onClick={() =>
            editor && editor.chain().focus().setTextAlign('left').run()
          }
        >
          Left
        </button>
        <button
          onClick={() =>
            editor && editor.chain().focus().setTextAlign('center').run()
          }
        >
          Center
        </button>
        <button
          onClick={() =>
            editor && editor.chain().focus().setTextAlign('right').run()
          }
        >
          Right
        </button>
        <button
          onClick={() =>
            editor && editor.chain().focus().setTextAlign('justify').run()
          }
        >
          Justify
        </button>
        <button onClick={() => editor && editor.chain().focus().undo().run()}>
          Undo
        </button>
        <button onClick={() => editor && editor.chain().focus().redo().run()}>
          Redo
        </button>
      </div>
      <EditorContent
        editor={editor}
        className="min-h-[600px] p-4 border rounded-xl bg-white shadow-inner"
      />
    </div>
  );
};

export default Tiptap;
