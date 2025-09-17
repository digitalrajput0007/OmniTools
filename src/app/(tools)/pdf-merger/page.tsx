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
import {
  FileDown,
  UploadCloud,
  X,
  File as FileIcon,
  CheckCircle2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function PdfMergerPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [merged, setMerged] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const resetState = () => {
    setFiles([]);
    setIsMerging(false);
    setProgress(0);
    setMerged(false);
  };

  const handleFileAdd = (newFiles: File[]) => {
    const pdfFiles = newFiles.filter(
      (file) => file.type === 'application/pdf'
    );
    if (pdfFiles.length !== newFiles.length) {
      toast({
        title: 'Invalid File Type',
        description: 'Only PDF files are allowed.',
        variant: 'destructive',
      });
    }
    setFiles((prev) => [...prev, ...pdfFiles]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileAdd(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const handleDragEvents = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLElement>) => {
    handleDragEvents(e);
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLElement>) => {
    handleDragEvents(e);
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    handleDragEvents(e);
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFileAdd(Array.from(e.dataTransfer.files));
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
    const startTime = Date.now();
    const minDuration = 3000;

    const interval = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const currentProgress = Math.min((elapsedTime / minDuration) * 100, 100);
      setProgress(currentProgress);
      if (currentProgress >= 100) {
        clearInterval(interval);
        setIsMerging(false);
        setMerged(true);
      }
    }, 50);
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
      a.style.display = 'none';
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
          {merged ? (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <h3 className="font-semibold">Files Merged:</h3>
                <div className="grid grid-cols-1 gap-4">
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
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
                <h3 className="text-2xl font-bold">Merging Complete</h3>
                <p className="text-muted-foreground">
                  Your PDFs have been successfully merged.
                </p>
                <div className="text-sm">
                  <p>
                    Files merged:{' '}
                    <span className="font-medium text-foreground">
                      {files.length}
                    </span>
                  </p>
                </div>
                <div className="flex w-full flex-col gap-2 pt-4 sm:flex-row">
                  <Button className="w-full" onClick={downloadMergedPdf}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Download Merged PDF
                  </Button>
                  <Button
                    className="w-full"
                    variant="ghost"
                    onClick={resetState}
                  >
                    Merge another
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {files.length === 0 ? (
                <label
                  htmlFor="pdf-upload"
                  className={cn(
                    'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 text-center transition-colors',
                    {
                      'border-primary bg-accent/50': isDragging,
                    }
                  )}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragEvents}
                  onDrop={handleDrop}
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
              ) : (
                <>
                  <label
                    htmlFor="pdf-upload-additional"
                    className={cn(
                      'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 text-center transition-colors',
                      {
                        'border-primary bg-accent/50': isDragging,
                      }
                    )}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragEvents}
                    onDrop={handleDrop}
                  >
                    <UploadCloud className="h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Drag & drop more files, or click to browse
                    </p>
                    <Input
                      id="pdf-upload-additional"
                      type="file"
                      className="sr-only"
                      onChange={handleFileChange}
                      accept="application/pdf"
                      multiple
                    />
                  </label>

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
                </>
              )}

              {isMerging ? (
                <div className="flex h-full flex-col items-center justify-center space-y-4">
                  <Progress value={progress} className="w-full" />
                  <p className="text-center text-sm text-muted-foreground">
                    Merging...
                  </p>
                </div>
              ) : (
                files.length > 0 && (
                  <Button
                    onClick={handleMerge}
                    className="w-full"
                    disabled={files.length < 2}
                  >
                    Merge PDFs
                  </Button>
                )
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
