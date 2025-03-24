import { useState } from "react";
import { FileCode, Clipboard, CheckCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import SyntaxHighlighter from "react-syntax-highlighter";
import { vs2015 } from "react-syntax-highlighter/dist/esm/styles/hljs";
import SuccessToast from "../Toast/SuccessToast";

const CodeBlock = ({ codeString, language }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [copy, setCopy] = useState(false);

  const getLanguageIcon = () => {
    switch (language) {
      case "jsx":
      case "tsx":
        return (
          <div className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-blue-400"
            >
              <path d="M16.5 9.4 7.5 4.21"></path>
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <path d="M3.27 6.96 12 12.01l8.73-5.05"></path>
              <path d="M12 22.08V12"></path>
            </svg>
            <span>React</span>
          </div>
        );
      case "js":
        return (
          <div className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-yellow-400"
            >
              <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"></path>
              <path d="m8 16 4-4 4 4"></path>
              <path d="M16 16v6"></path>
            </svg>
            <span>JavaScript</span>
          </div>
        );
      case "css":
        return (
          <div className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-blue-500"
            >
              <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"></path>
              <path d="M4 13h16"></path>
              <path d="M15 2v20"></path>
            </svg>
            <span>CSS</span>
          </div>
        );
      case "html":
        return (
          <div className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-orange-500"
            >
              <path d="m13 2-3.5 20"></path>
              <path d="m19 9-9 3"></path>
              <path d="m5 9 9 3"></path>
            </svg>
            <span>HTML</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1">
            <FileCode className="w-4 h-4" />
            <span>{language.toUpperCase()}</span>
          </div>
        );
    }
  };

  return (
    <div className="mt-5">
      <button
        onClick={() => setIsDialogOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-white bg-[#3e404d] hover:bg-[#2d2d2d] rounded-md transition-colors"
        title="Click to view code"
      >
        {getLanguageIcon()}
      </button>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-auto">
          <AlertDialogHeader className="flex flex-row items-center justify-between">
            <AlertDialogTitle className="flex items-center gap-2">
              Attached Code
            </AlertDialogTitle>
            <div className="flex items-center gap-2">
              {copy ? (
                <div className="py-1 inline-flex items-center gap-1 text-sm text-muted-foreground">
                  <CheckCheck className="w-4 h-4" />
                  <span>Copied!</span>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(codeString);
                    setCopy(true);
                    setTimeout(() => setCopy(false), 2000);
                    SuccessToast("Code copied to clipboard");
                  }}
                >
                  <Clipboard className="w-4 h-4 mr-1" />
                  Copy code
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDialogOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </AlertDialogHeader>
          <div className="bg-[#1e1e1e] rounded-md overflow-hidden mt-4">
            <SyntaxHighlighter
              language={language}
              style={vs2015}
              customStyle={{ padding: "25px" }}
              wrapLongLines={true}
              showLineNumbers={true}
            >
              {codeString}
            </SyntaxHighlighter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CodeBlock;
