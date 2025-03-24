import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import parse, { domToReact } from "html-react-parser";
import Tiptap from "../TipTap";
import { formatDistanceToNow } from "date-fns";

export default function EditorDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  initialContent,
  user,
  updatedAt,
  onSave,
}) {
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && initialContent) {
      setEditedTitle(initialContent?.title || "");
      setEditedContent(initialContent?.content || "");
    }
  }, [isOpen, initialContent]); // Ensure initialContent is in the dependency array

  const handleEditQuestion = async () => {
    setIsEditing(true);
    setError(null);
    console.log(editedContent, editedTitle);
    try {
      await onSave({
        title: editedTitle,
        content: editedContent,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error editing question:", error);
      if (error.response && error.response.status === 413) {
        setError(
          "The content is too large. Please reduce the size and try again."
        );
      } else {
        console.log(error);
        setError("Failed to edit question. Please try again.");
      }
    } finally {
      setIsEditing(false);
    }
  };

  const handleContentChange = (newContent) => {
    setEditedContent(newContent);
  };

  const formatCreatedAt = (date) => {
    if (!date) return "";
    return formatDistanceToNow(new Date(date), { addSuffix: true });
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
                src={domNode.attribs.src}
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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1200px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow pr-4">
          <div className="flex flex-col p-4">
            {user && (
              <>
                <div className="flex items-start gap-4 text-sm">
                  <Avatar>
                    <AvatarImage src={user?.picture} alt={user?.name} />
                    <AvatarFallback>
                      {user?.name
                        ?.split(" ")
                        ?.map((chunk) => chunk[0])
                        ?.join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid gap-1">
                    <div className="font-semibold">{user?.name}</div>
                    {updatedAt && (
                      <div className="line-clamp-1 text-xs font-normal">
                        <span className="font-medium">Updated:</span>{" "}
                        {formatCreatedAt(updatedAt)}
                      </div>
                    )}
                  </div>
                </div>
                <Separator className="my-4" />
              </>
            )}
            <div className="flex justify-between space-x-8 p-6">
              <div className="flex flex-col w-1/2 space-y-6">
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">
                    Title
                  </Label>
                  <Input
                    id="title"
                    className="border"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                  />
                </div>
                <div className="flex flex-col space-y-2 flex-grow">
                  <Label htmlFor="content" className="text-sm font-medium">
                    Content
                  </Label>
                  <div className="border rounded-md p-2 flex-grow">
                    <Tiptap
                      onEditorContentSave={handleContentChange}
                      initialContent={initialContent?.content || ""} // Ensure content is always a string
                      editable={true}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col w-1/2 space-y-2">
                <Label className="text-sm font-medium">Preview</Label>
                <div className="border rounded-md p-4 flex-grow overflow-auto">
                  <h2 className="text-xl font-bold mb-4">{editedTitle}</h2>
                  <div className="mycontent font-normal whitespace-pre-wrap text-sm">
                    {parse(editedContent, options)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter>
          {error && <p className="text-red-500">{error}</p>}
          <Button
            type="submit"
            onClick={handleEditQuestion}
            disabled={isEditing}
          >
            {isEditing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
