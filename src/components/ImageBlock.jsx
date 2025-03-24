import { useState } from "react";
import { Image, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const ImageBlock = ({ src, alt }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      {/* Image icon to open the dialog */}
      <button
        onClick={() => setIsDialogOpen(true)}
        className="hover:bg-gray-700 p-1 rounded transition-colors"
        title="Open image in dialog"
      >
        <div className="flex items-center gap-1 border border-gray-500 rounded-md p-1">
          <Image className="w-4 h-4 text-blue-500" />
          <p className="text-gray-500">Image</p>
        </div>
      </button>

      {/* Dialog to display the enlarged image */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent className="sm:max-w-[90vw] max-h-[90vh] overflow-hidden">
          {/* Close button in the top-right corner */}
          <AlertDialogCancel className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-700 transition-colors">
            <X className="h-4 w-4" />
          </AlertDialogCancel>

          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              Image Preview
            </AlertDialogTitle>
          </AlertDialogHeader>

          {/* Image content */}
          <ScrollArea className="h-[70vh] pr-4">
            <div className="flex justify-center items-center">
              <img
                src={src}
                alt={alt}
                className="max-w-full max-h-[70vh] rounded-md object-contain"
              />
            </div>
          </ScrollArea>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ImageBlock;
