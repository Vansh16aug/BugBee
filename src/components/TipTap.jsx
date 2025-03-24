import { useCallback, useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Code,
  Quote,
  ImageIcon,
  LinkIcon,
  Heading1,
  Heading2,
  Heading3,
  Upload,
} from "lucide-react";
import { domToReact } from "html-react-parser";

import javascript from "highlight.js/lib/languages/javascript";
import python from "highlight.js/lib/languages/python";
import cpp from "highlight.js/lib/languages/cpp";
import java from "highlight.js/lib/languages/java";
import ruby from "highlight.js/lib/languages/ruby";
import php from "highlight.js/lib/languages/php";
import csharp from "highlight.js/lib/languages/csharp";
import swift from "highlight.js/lib/languages/swift";
import go from "highlight.js/lib/languages/go";
import rust from "highlight.js/lib/languages/rust";

const lowlight = createLowlight(common);
lowlight.register("javascript", javascript);
lowlight.register("python", python);
lowlight.register("cpp", cpp);
lowlight.register("java", java);
lowlight.register("ruby", ruby);
lowlight.register("php", php);
lowlight.register("csharp", csharp);
lowlight.register("swift", swift);
lowlight.register("go", go);
lowlight.register("rust", rust);

export default function TipTap({
  onEditorContentSave,
  initialContent,
  content,
  editable = true,
}) {
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: false,
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content: initialContent || "",
    editable: editable,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none min-h-[200px] overflow-y-auto p-4",
        spellcheck: "true",
      },
      handleKeyDown: (view, event) => {
        if (event.key === " " || event.code === "Space") {
          return false;
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onEditorContentSave(html);
    },
  });

  useEffect(() => {
    if (editor && (initialContent || content)) {
      const contentToSet = content || initialContent;
      if (contentToSet !== editor.getHTML()) {
        editor.commands.setContent(contentToSet);
      }
    }
  }, [editor, initialContent, content]);

  const addLink = useCallback(() => {
    if (linkUrl && editor) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl })
        .run();
      setLinkUrl("");
      setIsLinkDialogOpen(false);
    }
  }, [editor, linkUrl]);

  const addImage = useCallback(() => {
    if (editor) {
      if (selectedFile) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target && e.target.result) {
            editor.chain().focus().setImage({ src: e.target.result }).run();
          }
        };
        reader.readAsDataURL(selectedFile);
      } else if (imageUrl) {
        editor.chain().focus().setImage({ src: imageUrl }).run();
      }
      setImageUrl("");
      setSelectedFile(null);
      setPreviewUrl(null);
      setIsImageDialogOpen(false);
    }
  }, [editor, imageUrl, selectedFile]);

  const handleFileChange = (event) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && e.target.result) {
          setPreviewUrl(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleHeading = useCallback(
    (level) => {
      editor?.chain().focus().toggleHeading({ level }).run();
    },
    [editor]
  );

  const addCodeBlock = useCallback(() => {
    if (editor) {
      const { from, to } = editor.state.selection;
      if (from !== to) {
        // Wrap selected text in a code block
        editor.chain().focus().setCodeBlock().run();
      } else {
        // Insert an empty code block
        editor.chain().focus().insertContent("<pre><code></code></pre>").run();
      }
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  const options = {
    replace: (domNode) => {
      if (domNode instanceof Element) {
        switch (domNode.name) {
          case "ul":
            return (
              <ul className="list-disc pl-5">
                {domToReact(domNode.children, options)}
              </ul>
            );
          case "ol":
            return (
              <ol className="list-decimal pl-5">
                {domToReact(domNode.children, options)}
              </ol>
            );
          case "li":
            return <li>{domToReact(domNode.children, options)}</li>;
          case "blockquote":
            return (
              <blockquote className="border-l-4 border-slate-400 pl-4 italic text-slate-300">
                {domToReact(domNode.children, options)}
              </blockquote>
            );
          case "img":
            return (
              <img
                src={domNode.attribs.src || "/placeholder.svg"}
                alt={domNode.attribs.alt || "Image"}
                className="max-w-xl h-auto rounded-md"
              />
            );
          case "a":
            return (
              <a
                href={domNode.attribs.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                {domToReact(domNode.children, options)}
              </a>
            );
        }
      }
    },
  };

  return (
    <div className="w-full space-y-2">
      <div
        className="flex flex-wrap gap-2 items-center"
        role="toolbar"
        aria-label="Text formatting options"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "bg-secondary" : ""}
          aria-label="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "bg-secondary" : ""}
          aria-label="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "bg-secondary" : ""}
          aria-label="Bullet list"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "bg-secondary" : ""}
          aria-label="Numbered list"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={addCodeBlock}
          className={editor.isActive("codeBlock") ? "bg-secondary" : ""}
          aria-label="Code block"
        >
          <Code className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive("blockquote") ? "bg-secondary" : ""}
          aria-label="Block quote"
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toggleHeading(1)}
          className={
            editor.isActive("heading", { level: 1 }) ? "bg-secondary" : ""
          }
          aria-label="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toggleHeading(2)}
          className={
            editor.isActive("heading", { level: 2 }) ? "bg-secondary" : ""
          }
          aria-label="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toggleHeading(3)}
          className={
            editor.isActive("heading", { level: 3 }) ? "bg-secondary" : ""
          }
          aria-label="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" aria-label="Add link">
              <LinkIcon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Link</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="link-url" className="text-right">
                  URL
                </Label>
                <Input
                  id="link-url"
                  type="url"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <Button onClick={addLink}>Add Link</Button>
          </DialogContent>
        </Dialog>

        <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" aria-label="Add image">
              <ImageIcon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Image</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image-url" className="text-right">
                  Image URL
                </Label>
                <Input
                  id="image-url"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image-file" className="text-right">
                  Upload Image
                </Label>
                <div className="col-span-3">
                  <Input
                    id="image-file"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Label
                    htmlFor="image-file"
                    className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </Label>
                </div>
              </div>
              {previewUrl && (
                <div className="mt-4">
                  <img
                    src={previewUrl || "/placeholder.svg"}
                    alt="Preview"
                    className="max-w-full h-auto"
                  />
                </div>
              )}
            </div>
            <Button onClick={addImage}>Add Image</Button>
          </DialogContent>
        </Dialog>
      </div>
      <EditorContent
        editor={editor}
        className="h-auto border p-2 rounded-md"
        spellCheck="true"
      />
    </div>
  );
}
