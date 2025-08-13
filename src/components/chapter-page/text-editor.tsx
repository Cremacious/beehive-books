'use client';

import React, { useMemo } from 'react';
import {
  createEditor,
  Descendant,
  Transforms,
  Editor,
  Element as SlateElement,
  Text,
  BaseEditor,
} from 'slate';
import { Slate, Editable, withReact, useSlate } from 'slate-react';
import { withHistory } from 'slate-history';

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
}

type CustomElement = {
  type: string;
  children: Descendant[];
};
type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  highlight?: boolean;
  fontSize?: string;
  color?: string;
  backgroundColor?: string;
  sub?: boolean;
};

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

const LIST_TYPES = ['numbered-list', 'bulleted-list'];

const Element = (props: {
  attributes: any;
  children: any;
  element: CustomElement;
}) => {
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

const Leaf = (props: { attributes: any; children: any; leaf: CustomText }) => {
  const style: React.CSSProperties = {
    fontSize: props.leaf.fontSize,
    color: props.leaf.color,
    backgroundColor: props.leaf.backgroundColor,
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

const ToolbarButton = ({
  format,
  icon,
  onClick,
  active,
}: {
  format: string;
  icon: React.ReactNode;
  onClick: (event: React.MouseEvent) => void;
  active: boolean;
}) => (
  <button
    className={`px-2 py-1 rounded border mr-1 mb-1 ${
      active ? 'bg-yellow-200' : ''
    }`}
    onMouseDown={onClick}
    type="button"
    aria-label={format}
  >
    {icon}
  </button>
);

const FontSizeDropdown = () => {
  const editor = useSlate();
  return (
    <select
      className="border rounded px-2 py-1 mr-1 mb-1"
      onChange={(e) => {
        Transforms.setNodes(
          editor,
          { fontSize: e.target.value },
          { match: (n) => Text.isText(n), split: true }
        );
      }}
      defaultValue="16px"
    >
      <option value="12px">Small</option>
      <option value="16px">Normal</option>
      <option value="20px">Large</option>
      <option value="28px">Extra Large</option>
    </select>
  );
};

const ColorPicker = ({ format }: { format: 'color' | 'backgroundColor' }) => {
  const editor = useSlate();
  return (
    <input
      type="color"
      className="border rounded w-8 h-8 p-0 mr-1 mb-1"
      onChange={(e) => {
        Transforms.setNodes(
          editor,
          { [format]: e.target.value },
          { match: (n) => Text.isText(n), split: true }
        );
      }}
    />
  );
};

const MarkButton = ({
  format,
  icon,
}: {
  format: string;
  icon: React.ReactNode;
}) => {
  const editor = useSlate();
  const isActive = isMarkActive(editor, format);
  return (
    <ToolbarButton
      format={format}
      icon={icon}
      active={isActive}
      onClick={(event) => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    />
  );
};

const BlockButton = ({
  format,
  icon,
}: {
  format: string;
  icon: React.ReactNode;
}) => {
  const editor = useSlate();
  const isActive = isBlockActive(editor, format);
  return (
    <ToolbarButton
      format={format}
      icon={icon}
      active={isActive}
      onClick={(event) => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
    />
  );
};

const isMarkActive = (editor: Editor, format: string) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

const isBlockActive = (editor: Editor, format: string) => {
  const [match] = Editor.nodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
  });
  return !!match;
};

const toggleMark = (editor: Editor, format: string) => {
  const isActive = isMarkActive(editor, format);
  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const toggleBlock = (editor: Editor, format: string) => {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format);
  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes((n as CustomElement).type),
    split: true,
  });
  const newType = isActive ? 'paragraph' : format;
  Transforms.setNodes(editor, { type: newType });
  if (!isActive && isList) {
    const block: CustomElement = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: '' }],
  },
];

export default function SlateEditor({
  value,
  onChange,
  onBlur,
}: TextEditorProps) {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const parsedValue: Descendant[] = useMemo(() => {
    try {
      const parsed = value ? JSON.parse(value) : initialValue;
      // Ensure parsed is a non-empty array of objects with 'type' and 'children'
      if (
        Array.isArray(parsed) &&
        parsed.length > 0 &&
        parsed.every(
          (el) =>
            typeof el === 'object' &&
            el !== null &&
            'type' in el &&
            'children' in el
        )
      ) {
        return parsed;
      }
      return initialValue;
    } catch {
      return initialValue;
    }
  }, [value]);

  const handleChange = (val: Descendant[]) => {
    onChange(JSON.stringify(val));
  };

  return (
    <div className="bg-white border rounded-xl shadow-xl p-4">
      <Slate editor={editor} initialValue={parsedValue} onChange={handleChange}>
        <div className="flex flex-wrap gap-2 mb-4 items-center">
          <FontSizeDropdown />
          <MarkButton format="bold" icon={<b>B</b>} />
          <MarkButton format="italic" icon={<i>I</i>} />
          <MarkButton format="underline" icon={<u>U</u>} />
          <MarkButton format="sub" icon={<sub>sub</sub>} />
          <ColorPicker format="color" />
          <ColorPicker format="backgroundColor" />
          <BlockButton format="numbered-list" icon={<span>1. List</span>} />
          <BlockButton format="bulleted-list" icon={<span>• List</span>} />
          <BlockButton format="align-left" icon={<span>Left</span>} />
          <BlockButton format="align-center" icon={<span>Center</span>} />
          <BlockButton format="align-right" icon={<span>Right</span>} />
          <BlockButton format="align-justify" icon={<span>Justify</span>} />
        </div>
        <Editable
          renderElement={(props) => <Element {...props} />}
          renderLeaf={(props) => <Leaf {...props} />}
          placeholder="Type your content..."
          spellCheck
          autoFocus
          onBlur={onBlur}
          className="min-h-[400px] p-4 border rounded-xl bg-white shadow-inner"
        />
      </Slate>
    </div>
  );
}
