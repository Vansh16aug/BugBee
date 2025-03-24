import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import parse, { domToReact } from "html-react-parser";
import TipTap from "../TipTap";

export function EditorComponent({ initialContent, onSubmit, onCancel }) {
  const [content, setContent] = useState(initialContent || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setContent(initialContent || "");
  }, [initialContent]);

  const handleContentChange = (newContent) => {
    setContent(newContent);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(content);
    } finally {
      setIsSubmitting(false);
    }
  };

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
                className="max-w-full h-auto rounded-md"
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
    <div className="flex flex-col space-y-4">
      <div className="tiptap flex flex-col md:flex-row justify-between">
        <div className="tiptap flex flex-col w-full md:w-1/2">
          <Label htmlFor="content" className="text-sm font-medium">
            Content
          </Label>
          <ScrollArea className="h-[400px] w-full border rounded-md p-2 overflow-x-hidden">
            <div className="w-full overflow-wrap-break-word">
              <TipTap
                onEditorContentSave={handleContentChange}
                initialContent={content}
                content={content}
                editable={!isSubmitting}
              />
            </div>
          </ScrollArea>
        </div>
        <div className="flex flex-col w-full md:w-1/2 space-x- break-words">
          <Label className="text-sm font-medium">Preview</Label>
          <ScrollArea className="h-[400px] w-full border rounded-md p-4 overflow-x-hidden">
            <div className="mycontent prose dark:prose-invert max-w-none overflow-auto break-words whitespace-normal">
              {typeof content === "string" ? parse(content, options) : ""}
            </div>
          </ScrollArea>
        </div>
      </div>
      <div className="flex justify-end space-x-4">
        <Button onClick={onCancel} variant="outline" disabled={isSubmitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting || !content}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit"
          )}
        </Button>
      </div>
    </div>
  );
}

export default EditorComponent;
