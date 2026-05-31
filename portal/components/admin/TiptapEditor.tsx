"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useState } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Link2,
  ChevronDown,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TiptapEditorProps {
  content?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  className?: string;
  showVariables?: boolean;
  minHeight?: string;
}

const VARIABLES = [
  { label: "Client Name",       value: "{{client.name}}" },
  { label: "Company",           value: "{{client.company}}" },
  { label: "Invoice Amount",    value: "{{invoice.amount}}" },
  { label: "Invoice Due Date",  value: "{{invoice.due_date}}" },
  { label: "Invoice Number",    value: "{{invoice.number}}" },
  { label: "Portal Login URL",  value: "{{portal.login_url}}" },
];

export function TiptapEditor({
  content,
  onChange,
  placeholder,
  className,
  showVariables = false,
  minHeight = "200px",
}: TiptapEditorProps) {
  const [varMenuOpen, setVarMenuOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false, linkOnPaste: true }),
      Placeholder.configure({
        placeholder: placeholder ?? "Write your message here...",
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  if (!editor) return null;

  function insertVariable(v: string) {
    editor!.chain().focus().insertContent(v).run();
    setVarMenuOpen(false);
  }

  function handleSetLink() {
    const url = prompt("Enter URL");
    if (url) {
      editor!.chain().focus().setLink({ href: url }).run();
    }
  }

  function ToolbarBtn({
    onClick,
    title,
    active,
    children,
  }: {
    onClick: () => void;
    title: string;
    active: boolean;
    children: React.ReactNode;
  }) {
    return (
      <button
        type="button"
        onClick={onClick}
        title={title}
        className={cn(
          "p-1 rounded transition-colors",
          active
            ? "bg-slate-200 text-slate-900"
            : "text-slate-600 hover:bg-slate-100"
        )}
      >
        {children}
      </button>
    );
  }

  return (
    <div className={cn("border rounded-md overflow-hidden", className)}>
      <style>{`
        .tiptap p.is-editor-empty:first-child::before {
          color: #94a3b8;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
      `}</style>

      {/* Toolbar */}
      <div className="flex items-center flex-wrap gap-0.5 border-b bg-slate-50 px-2 py-1">
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
          active={editor.isActive("bold")}
        >
          <Bold className="h-4 w-4" />
        </ToolbarBtn>

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
          active={editor.isActive("italic")}
        >
          <Italic className="h-4 w-4" />
        </ToolbarBtn>

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Underline"
          active={editor.isActive("underline")}
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarBtn>

        <div className="w-px h-4 bg-slate-200 mx-1" />

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet List"
          active={editor.isActive("bulletList")}
        >
          <List className="h-4 w-4" />
        </ToolbarBtn>

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Ordered List"
          active={editor.isActive("orderedList")}
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarBtn>

        <ToolbarBtn
          onClick={handleSetLink}
          title="Insert Link"
          active={editor.isActive("link")}
        >
          <Link2 className="h-4 w-4" />
        </ToolbarBtn>

        {showVariables && (
          <>
            <div className="flex-1" />
            <div className="relative">
              <button
                type="button"
                onClick={() => setVarMenuOpen((o) => !o)}
                className="inline-flex items-center gap-1 border border-slate-300 bg-white hover:bg-slate-50 rounded-md text-xs h-6 px-2 text-slate-700 transition-colors"
              >
                Insert Variable <ChevronDown className="h-3 w-3" />
              </button>

              {varMenuOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white border rounded-md shadow-lg z-50 w-52">
                  {VARIABLES.map((v) => (
                    <div
                      key={v.value}
                      onClick={() => insertVariable(v.value)}
                      className="px-3 py-1.5 text-xs hover:bg-slate-50 flex justify-between items-center cursor-pointer"
                    >
                      <span>{v.label}</span>
                      <code className="text-slate-400 font-mono">{v.value}</code>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        className="p-3 text-sm focus:outline-none [&_.tiptap]:outline-none [&_.tiptap]:min-h-full"
        style={{ minHeight }}
      />
    </div>
  );
}
