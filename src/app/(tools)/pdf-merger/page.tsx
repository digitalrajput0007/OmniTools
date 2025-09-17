'use client';

import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { FileDown, UploadCloud, X, File as FileIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function PdfMergerPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [merged, setMerged] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter(
        (file) => file.type === 'application/pdf'
      );
      if (newFiles.length !== e.target.files.length) {
        toast({
          title: 'Invalid File Type',
          description: 'Only PDF files are allowed.',
          variant: 'destructive',
        });
      }
      setFiles((prev) => [...prev, ...newFiles]);
      setMerged(false);
      setProgress(0);
      setIsMerging(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      toast({
        title: 'Not Enough Files',
        description: 'Please select at least two PDF files to merge.',
        variant: 'destructive',
      });
      return;
    }
    setIsMerging(true);
    setMerged(false);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsMerging(false);
          setMerged(true);
          return 100;
        }
        return prev + 1;
      });
    }, 30);
  };

  const downloadMergedPdf = async () => {
    try {
      const mergedPdf = await PDFDocument.create();
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(
          pdf,
          pdf.getPageIndices()
        );
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'merged.pdf';
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: 'Error Merging PDFs',
        description:
          'Something went wrong while merging the PDFs. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">PDF Merger</CardTitle>
          <CardDescription>
            Combine multiple PDF files into a single document.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <label
              htmlFor="pdf-upload"
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 text-center"
            >
              <UploadCloud className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">
                Drag & drop your PDFs here, or click to browse
              </p>
              <Input
                id="pdf-upload"
                type="file"
                className="sr-only"
                onChange={handleFileChange}
                accept="application/pdf"
                multiple
              />
              <Button asChild variant="outline" className="mt-4">
                <span>Browse Files</span>
              </Button>
            </label>

            {files.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold">Selected Files:</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="relative flex items-center gap-4 rounded-md border p-2"
                    >
                      <FileIcon className="h-6 w-6 text-muted-foreground" />
                      <div className="flex-1 overflow-hidden">
                        <p className="truncate text-sm font-medium">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleRemoveFile(index)}
                        disabled={isMerging}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              {!isMerging && !merged && (
                <Button
                  onClick={handleMerge}
                  className="w-full"
                  disabled={files.length < 2}
                >
                  Merge PDFs
                </Button>
              )}
              {isMerging && (
                <>
                  <Progress value={progress} className="w-full" />
                  <p className="text-center text-sm text-muted-foreground">
                    Merging...
                  </p>
                </>
              )}
              {merged && (
                <div className="space-y-2 text-center">
                  <p className="font-semibold text-green-600">
                    Merging Complete!
                  </p>
                  <Button
                    className="w-full"
                    variant="secondary"
                    onClick={downloadMergedPdf}
                  >
                    <FileDown className="mr-2 h-4 w-4" />
                    Download Merged PDF
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
