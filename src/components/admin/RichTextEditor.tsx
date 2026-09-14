import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import { useEffect } from "react";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Link as LinkIcon, Undo2, Redo2, Quote, Code, Pilcrow, Eraser,
} from "lucide-react";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

function Btn({ active, onClick, title, children }: {
  active?: boolean; onClick: () => void; title: string; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-md border text-foreground transition-colors hover:bg-secondary ${
        active ? "bg-primary text-primary-foreground border-primary" : "bg-background"
      }`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const chain = () => editor.chain().focus();
  return (
    <div className="flex flex-wrap items-center gap-1 border-b bg-secondary/40 p-2">
      <Btn title="Bold" active={editor.isActive("bold")} onClick={() => chain().toggleBold().run()}><Bold className="h-4 w-4" /></Btn>
      <Btn title="Italic" active={editor.isActive("italic")} onClick={() => chain().toggleItalic().run()}><Italic className="h-4 w-4" /></Btn>
      <Btn title="Underline" active={editor.isActive("underline")} onClick={() => chain().toggleUnderline().run()}><UnderlineIcon className="h-4 w-4" /></Btn>
      <Btn title="Strikethrough" active={editor.isActive("strike")} onClick={() => chain().toggleStrike().run()}><Strikethrough className="h-4 w-4" /></Btn>
      <div className="mx-1 h-6 w-px bg-border" />
      <Btn title="Paragraph" active={editor.isActive("paragraph")} onClick={() => chain().setParagraph().run()}><Pilcrow className="h-4 w-4" /></Btn>
      <Btn title="Heading 1" active={editor.isActive("heading", { level: 1 })} onClick={() => chain().toggleHeading({ level: 1 }).run()}><Heading1 className="h-4 w-4" /></Btn>
      <Btn title="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => chain().toggleHeading({ level: 2 }).run()}><Heading2 className="h-4 w-4" /></Btn>
      <Btn title="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => chain().toggleHeading({ level: 3 }).run()}><Heading3 className="h-4 w-4" /></Btn>
      <div className="mx-1 h-6 w-px bg-border" />
      <Btn title="Bullet List" active={editor.isActive("bulletList")} onClick={() => chain().toggleBulletList().run()}><List className="h-4 w-4" /></Btn>
      <Btn title="Ordered List" active={editor.isActive("orderedList")} onClick={() => chain().toggleOrderedList().run()}><ListOrdered className="h-4 w-4" /></Btn>
      <Btn title="Quote" active={editor.isActive("blockquote")} onClick={() => chain().toggleBlockquote().run()}><Quote className="h-4 w-4" /></Btn>
      <Btn title="Code" active={editor.isActive("codeBlock")} onClick={() => chain().toggleCodeBlock().run()}><Code className="h-4 w-4" /></Btn>
      <div className="mx-1 h-6 w-px bg-border" />
      <Btn title="Align Left" active={editor.isActive({ textAlign: "left" })} onClick={() => chain().setTextAlign("left").run()}><AlignLeft className="h-4 w-4" /></Btn>
      <Btn title="Align Center" active={editor.isActive({ textAlign: "center" })} onClick={() => chain().setTextAlign("center").run()}><AlignCenter className="h-4 w-4" /></Btn>
      <Btn title="Align Right" active={editor.isActive({ textAlign: "right" })} onClick={() => chain().setTextAlign("right").run()}><AlignRight className="h-4 w-4" /></Btn>
      <Btn title="Justify" active={editor.isActive({ textAlign: "justify" })} onClick={() => chain().setTextAlign("justify").run()}><AlignJustify className="h-4 w-4" /></Btn>
      <div className="mx-1 h-6 w-px bg-border" />
      <Btn title="Link" active={editor.isActive("link")} onClick={() => {
        const prev = editor.getAttributes("link").href as string | undefined;
        const url = window.prompt("URL", prev ?? "https://");
        if (url === null) return;
        if (url === "") { chain().unsetLink().run(); return; }
        chain().extendMarkRange("link").setLink({ href: url }).run();
      }}><LinkIcon className="h-4 w-4" /></Btn>
      <Btn title="Clear formatting" onClick={() => chain().clearNodes().unsetAllMarks().run()}><Eraser className="h-4 w-4" /></Btn>
      <div className="mx-1 h-6 w-px bg-border" />
      <Btn title="Undo" onClick={() => chain().undo().run()}><Undo2 className="h-4 w-4" /></Btn>
      <Btn title="Redo" onClick={() => chain().redo().run()}><Redo2 className="h-4 w-4" /></Btn>
    </div>
  );
}

export function RichTextEditor({ value, onChange, placeholder }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" } }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html === "<p></p>" ? "" : html);
    },
    editorProps: {
      attributes: {
        class: "tiptap p-4 text-sm focus:outline-none",
        "data-placeholder": placeholder ?? "",
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = value || "";
    if (next !== current && next !== "" ) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) {
    return <div className="rounded-lg border bg-background p-4 text-sm text-muted-foreground">Loading editor…</div>;
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-background">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
