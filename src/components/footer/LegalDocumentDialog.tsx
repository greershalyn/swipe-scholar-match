
import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { X } from "lucide-react";

type DocumentType = 'eula' | 'terms' | 'privacy' | null;

interface Document {
  title: string;
  content: string;
}

interface LegalDocumentDialogProps {
  openDialog: DocumentType;
  documents: Record<string, Document>;
  onClose: () => void;
}

const LegalDocumentDialog = ({ 
  openDialog, 
  documents, 
  onClose 
}: LegalDocumentDialogProps) => {
  return (
    <AlertDialog open={openDialog !== null} onOpenChange={onClose}>
      <AlertDialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-h-[80vh] overflow-y-auto w-full max-w-lg bg-background p-6 shadow-lg rounded-lg">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {openDialog && documents[openDialog].title}
          </AlertDialogTitle>
          <AlertDialogDescription className="whitespace-pre-wrap">
            {openDialog && documents[openDialog].content}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LegalDocumentDialog;
