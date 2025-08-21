'use client';
import React, { useMemo } from 'react';
import { Slate, Editable, withReact } from 'slate-react';
import { createEditor, Descendant } from 'slate';
import { useState } from 'react';
import { Button } from '../ui/button';
import { ChapterType } from '@/lib/providers/types/books.type';

const fontOptions = [
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Times New Roman', value: 'Times New Roman, serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Calibri', value: 'Calibri, sans-serif' },
  { label: 'Verdana', value: 'Verdana, sans-serif' },
  { label: 'Tahoma', value: 'Tahoma, sans-serif' },
  { label: 'Courier New', value: 'Courier New, monospace' },
  { label: 'Trebuchet MS', value: 'Trebuchet MS, sans-serif' },
  { label: 'Garamond', value: 'Garamond, serif' },
];

const fontSizes = Array.from({ length: 65 }, (_, i) => 8 + i);

const Element = (props: any) => {
  const { attributes, children, element } = props;
  switch (element.type) {
    case 'block-quote':
      return <blockquote {...attributes}>{children}</blockquote>;
    case 'bulleted-list':
      return <ul {...attributes}>{children}</ul>;
    case 'heading-one':
      return <h1 {...attributes}>{children}</h1>;
    case 'heading-two':
      return <h2 {...attributes}>{children}</h2>;
    case 'list-item':
      return <li {...attributes}>{children}</li>;
    case 'numbered-list':
      return <ol {...attributes}>{children}</ol>;
    case 'align-left':
      return (
        <div style={{ textAlign: 'left' }} {...attributes}>
          {children}
        </div>
      );
    case 'align-center':
      return (
        <div style={{ textAlign: 'center' }} {...attributes}>
          {children}
        </div>
      );
    case 'align-right':
      return (
        <div style={{ textAlign: 'right' }} {...attributes}>
          {children}
        </div>
      );
    case 'align-justify':
      return (
        <div style={{ textAlign: 'justify' }} {...attributes}>
          {children}
        </div>
      );
    default:
      return <p {...attributes}>{children}</p>;
  }
};
const Leaf = (props: any) => {
  const style: React.CSSProperties = {
    fontSize: props.leaf.fontSize,
    color: props.leaf.color,
    backgroundColor: props.leaf.backgroundColor,
    fontFamily: props.leaf.fontFamily,
  };
  if (props.leaf.sub) style.fontSize = '0.7em';
  return (
    <span
      {...props.attributes}
      style={style}
      className={[
        props.leaf.bold ? 'font-bold' : '',
        props.leaf.italic ? 'italic' : '',
        props.leaf.underline ? 'underline' : '',
        props.leaf.highlight ? 'bg-yellow-200' : '',
      ].join(' ')}
    >
      {props.children}
    </span>
  );
};

export default function ChapterContent({ chapter }: { chapter: ChapterType }) {
  const [font, setFont] = useState(fontOptions[0].value);
  const [dark, setDark] = useState(false);
  const [fontSize, setFontSize] = useState('16');

  const value: Descendant[] = useMemo(() => {
    try {
      return chapter.content
        ? JSON.parse(chapter.content)
        : [{ type: 'paragraph', children: [{ text: '' }] }];
    } catch {
      return [{ type: 'paragraph', children: [{ text: '' }] }];
    }
  }, [chapter.content]);
  const editor = useMemo(() => withReact(createEditor()), []);

  return (
    <div className="darkContainer">
      <div className="shadow-xl rounded-2xl md:p-6 p-1 darkColor border-b-8 border-b-yellow-400 mb-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 my-4">
          <div className="flex gap-2 items-center w-full md:w-auto justify-center">
            <label className="font-semibold text-yellow-400">Font:</label>
            <select
              className="rounded-md border bg-white border-yellow-200 px-2 py-1 text-slate-800 focus:outline-none focus:ring-2 focus:ring-yellow-300"
              value={font}
              onChange={(e) => setFont(e.target.value)}
            >
              {fontOptions.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  style={{ fontFamily: opt.value }}
                >
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 items-center w-full md:w-auto justify-center">
            <label className="font-semibold text-yellow-400">Font Size:</label>
            <select
              className="rounded-md border bg-white border-yellow-200 px-2 py-1 text-slate-800 focus:outline-none focus:ring-2 focus:ring-yellow-300"
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
            >
              {fontSizes.map((size) => (
                <option key={size} value={size}>
                  {size}px
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 items-center w-full md:w-auto justify-center">
            <label className="font-semibold text-yellow-400">Dark Mode:</label>
            <Button
              size={'sm'}
              type="button"
              variant={dark ? 'darkMode' : 'lightMode'}
              onClick={() => setDark((d) => !d)}
            >
              {dark ? 'On' : 'Off'}
            </Button>
          </div>
        </div>
        <div
          className={`prose prose-lg max-w-none ${
            dark ? 'bg-[#202020] text-white' : 'bg-white text-slate-800'
          } font-bold rounded-xl mb-4 border-2 p-2 md:p-6 shadow-inner h-[800px] overflow-auto min-h-0 transition-colors`}
          style={{ fontFamily: font, fontSize: fontSize + 'px' }}
        >
          <Slate editor={editor} initialValue={value} onChange={() => {}}>
            <Editable
              readOnly
              renderElement={Element}
              renderLeaf={Leaf}
              style={{
                minHeight: 0,
                fontFamily: font,
                fontSize: fontSize + 'px',
                background: 'transparent',
                color: dark ? 'white' : '#222',
              }}
              className="outline-none border-none bg-transparent shadow-none p-0 m-0 min-h-0 h-auto"
            />
          </Slate>
        </div>
      </div>
    </div>
  );
}
