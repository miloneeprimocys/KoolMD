"use client";

import React, { useEffect, useMemo, useRef } from "react";
import {
  Bold,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Underline,
} from "lucide-react";
import CharacterCount from "@tiptap/extension-character-count";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import LinkModal, { type LinkModalMode } from "@/components/LinkModal";
import SignupDropdown, { type DropdownOption } from "@/components/SignupDropdown";

interface InputActionsProps {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  max?: number;
  image?: boolean;
}

const toEditorContent = (value: string) => {
  if (/<(?:p|h[1-6]|ul|ol|li|strong|em|u|a|img|br|blockquote)\b/i.test(value)) {
    return value;
  }

  return value
    .split(/\r?\n/)
    .map((line) => `<p>${line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") || "<br>"}</p>`)
    .join("");
};

const toolbarButtonClass =
  "flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded text-body transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";
const TEXT_STYLES: DropdownOption[] = [
  { value: "paragraph", label: "Normal" },
  { value: "1", label: "Heading 1" },
  { value: "2", label: "Heading 2" },
  { value: "3", label: "Heading 3" },
];

const InputActions = ({
  value,
  onChange,
  rows = 4,
  placeholder,
  max,
  image = true,
}: InputActionsProps) => {
  const lastValueRef = useRef(value);
  const savedSelectionRef = useRef<{ from: number; to: number } | null>(null);
  const [modalMode, setModalMode] = React.useState<LinkModalMode | null>(null);
  const extensions = useMemo(
    () => [
      StarterKit.configure({
        link: {
          openOnClick: false,
          HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" },
        },
      }),
      Image.configure({ allowBase64: true }),
      Placeholder.configure({ placeholder: placeholder ?? "" }),
      ...(max ? [CharacterCount.configure({ limit: max })] : []),
    ],
    [max, placeholder],
  );
  const editorRef = useRef<Editor | null>(null);
  const openModal = (mode: LinkModalMode) => {
    const currentEditor = editorRef.current;
    if (!currentEditor) return;
    const { from, to } = currentEditor.state.selection;
    savedSelectionRef.current = { from, to };
    setModalMode(mode);
  };
  const editor = useEditor(
    {
      immediatelyRender: false,
      extensions,
      content: toEditorContent(value),
      onUpdate: ({ editor: updatedEditor }) => {
        const nextValue = updatedEditor.getHTML();
        lastValueRef.current = nextValue;
        onChange(nextValue);
      },
      editorProps: {
        attributes: {
          class:
            "tiptap min-w-0 w-full resize-y overflow-y-auto bg-transparent p-3 text-sm text-heading outline-none [&_.is-editor-empty:first-child::before]:pointer-events-none [&_.is-editor-empty:first-child::before]:float-left [&_.is-editor-empty:first-child::before]:h-0 [&_.is-editor-empty:first-child::before]:text-placeholder [&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_p]:my-1 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_a]:text-primary [&_a]:underline [&_img]:my-2 [&_img]:max-h-64 [&_img]:max-w-full [&_img]:rounded-lg",
          style: `min-height: ${Math.max(rows * 1.5 + 1.5, 6)}rem; resize: vertical;`,
        },
        handleKeyDown: (_view, event) => {
          if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
            event.preventDefault();
            openModal("link");
            return true;
          }
          return false;
        },
      },
    },
  );
  const activeFormats = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) =>
      currentEditor
        ? {
            bold: currentEditor.isActive("bold"),
            italic: currentEditor.isActive("italic"),
            underline: currentEditor.isActive("underline"),
            bulletList: currentEditor.isActive("bulletList"),
            orderedList: currentEditor.isActive("orderedList"),
            link: currentEditor.isActive("link"),
            heading: [1, 2, 3].find((level) => currentEditor.isActive("heading", { level })),
            characters: currentEditor.storage.characterCount?.characters() ?? 0,
          }
        : {
            bold: false,
            italic: false,
            underline: false,
            bulletList: false,
            orderedList: false,
            link: false,
            heading: undefined,
            characters: 0,
          },
  });

  useEffect(() => {
    editorRef.current = editor;
    return () => {
      if (editorRef.current === editor) editorRef.current = null;
    };
  }, [editor]);

  useEffect(() => {
    if (!editor || value === lastValueRef.current) return;
    lastValueRef.current = value;
    const content = toEditorContent(value);
    if (editor.getHTML() !== content) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [editor, value]);

  const addImage = () => {
    openModal("image");
  };

  const insertLink = (text: string, href: string) => {
    const currentEditor = editorRef.current;
    const selection = savedSelectionRef.current;
    if (!currentEditor || !selection) return;
    const docSize = currentEditor.state.doc.content.size;
    const from = Math.min(Math.max(selection.from, 1), docSize);
    const to = Math.min(Math.max(selection.to, from), docSize);

    currentEditor
      .chain()
      .focus()
      .setTextSelection({ from, to })
      .insertContent({
        type: "text",
        text,
        marks: [{ type: "link", attrs: { href, target: "_blank", rel: "noopener noreferrer" } }],
      })
      .run();
    savedSelectionRef.current = null;
  };

  const insertImage = (src: string, alt: string) => {
    const currentEditor = editorRef.current;
    const selection = savedSelectionRef.current;
    if (!currentEditor || !selection) return;
    const docSize = currentEditor.state.doc.content.size;
    const position = Math.min(Math.max(selection.from, 1), docSize);
    currentEditor.chain().focus().setTextSelection(position).setImage({ src, alt }).run();
    savedSelectionRef.current = null;
  };

  const selectBlock = (block: string) => {
    if (!editor) return;
    const chain = editor.chain().focus();
    if (block === "paragraph") chain.setParagraph().run();
    else chain.setHeading({ level: Number(block) as 1 | 2 | 3 }).run();
  };

  const button = (
    label: string,
    shortcut: string,
    active: boolean,
    onClick: () => void,
    icon: React.ReactNode,
  ) => (
    <button
      key={label}
      type="button"
      aria-label={label}
      aria-pressed={active}
      title={`${label} (${shortcut})`}
      disabled={!editor}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={`${toolbarButtonClass} ${active ? "bg-primary/10 text-primary" : ""} disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {icon}
    </button>
  );

  return (
    <div className="min-w-0">
      <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-card transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
        <div
          role="toolbar"
          aria-label="Text formatting"
          className="flex flex-wrap items-center gap-1 border-b border-divider px-2 py-1.5"
        >
          <SignupDropdown
            name="input-actions-text-style"
            options={TEXT_STYLES}
            value={String(activeFormats?.heading ?? "paragraph")}
            onChange={selectBlock}
            searchable={false}
            compact
            bordered={false}
            portalMenu
            triggerClassName="!h-8 !min-h-8 !rounded-md !px-2 !pr-6"
            className="!w-28"
          />
          <span className="mx-1 h-5 w-px bg-divider" aria-hidden="true" />
          {button("Bold", "Ctrl+B", Boolean(activeFormats?.bold), () => editor?.chain().focus().toggleBold().run(), <Bold className="h-4 w-4" />)}
          {button("Italic", "Ctrl+I", Boolean(activeFormats?.italic), () => editor?.chain().focus().toggleItalic().run(), <Italic className="h-4 w-4" />)}
          {button("Underline", "Ctrl+U", Boolean(activeFormats?.underline), () => editor?.chain().focus().toggleUnderline().run(), <Underline className="h-4 w-4" />)}
          {button("Bulleted list", "Ctrl+Shift+8", Boolean(activeFormats?.bulletList), () => editor?.chain().focus().toggleBulletList().run(), <List className="h-4 w-4" />)}
          {button("Numbered list", "Ctrl+Shift+7", Boolean(activeFormats?.orderedList), () => editor?.chain().focus().toggleOrderedList().run(), <ListOrdered className="h-4 w-4" />)}
          {button("Insert link", "Ctrl+K", Boolean(activeFormats?.link), () => openModal("link"), <Link2 className="h-4 w-4" />)}
          {image && button("Insert image", "toolbar", false, addImage, <ImageIcon className="h-4 w-4" />)}
        </div>
        <EditorContent
          editor={editor}
          className="max-h-[32rem] overflow-y-auto"
        />
      </div>
      {max && (
        <p className="mt-1 text-right text-[11px] text-body">
          {activeFormats?.characters ?? 0}/{max}
        </p>
      )}
      <LinkModal
        open={modalMode !== null}
        mode={modalMode ?? "link"}
        selectedText={
          editor && savedSelectionRef.current && !editor.state.selection.empty
            ? editor.state.doc.textBetween(
                savedSelectionRef.current.from,
                savedSelectionRef.current.to,
                " ",
              )
            : ""
        }
        onClose={() => {
          setModalMode(null);
          savedSelectionRef.current = null;
        }}
        onInsertLink={insertLink}
        onInsertImage={insertImage}
      />
    </div>
  );
};

export default InputActions;
