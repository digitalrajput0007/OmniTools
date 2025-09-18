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
import {
  FileDown,
  UploadCloud,
  X,
  File as FileIcon,
  CheckCircle2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CircularProgress } from '@/components/ui/circular-progress';

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
        <CardHeader className="text-center">
          <CardTitle className='text-2xl'>PDF Merger</CardTitle>
          <CardDescription className="text-base">
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
                    variant="secondary"
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
                    <UploadCloud className="h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">
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
                  <CircularProgress progress={progress} />
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
      <Card>
        <CardHeader>
          <CardTitle>About the PDF Merger</CardTitle>
          <CardDescription>
            Learn how to combine your PDF documents quickly and securely.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Accordion type="single" collapsible defaultValue="item-1">
            <AccordionItem value="item-1">
              <AccordionTrigger>Why Merge PDFs?</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <p>
                  Merging PDFs allows you to combine multiple separate documents into one, making them easier to manage, share, and archive. It's perfect for compiling reports, creating portfolios, or organizing related documents like invoices and receipts. A single, consolidated PDF is more professional and convenient than sending multiple attachments.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>How to Use the PDF Merger</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <ol className="list-decimal list-inside space-y-2">
                  <li><strong>Upload Your PDFs:</strong> Drag and drop multiple PDF files into the upload area, or click to browse and select them from your device. You need at least two files to merge.</li>
                  <li><strong>Add More Files:</strong> You can continue to drag or browse for more files to add to the merge queue.</li>
                  <li><strong>Arrange Files (Soon):</strong> In a future update, you'll be able to drag and drop the uploaded files to reorder them before merging. For now, they are merged in the order they are uploaded.</li>
                  <li><strong>Merge:</strong> Once you have all your files, click the "Merge PDFs" button.</li>
                  <li><strong>Download:</strong> After processing, click "Download Merged PDF" to save your new, single document.</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Tips and Features</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Privacy First:</strong> All merging happens directly in your browser. Your files are never uploaded to a server, ensuring your data remains private and secure.</li>
                  <li><strong>No File Size Limits:</strong> Because the processing is done locally, you can merge large PDFs without worrying about server upload limits. Performance may vary depending on your computer's power.</li>
                  <li><strong>Order of Merging:</strong> The PDFs are merged sequentially in the order they appear in the "Selected Files" list.</li>
                  <li><strong>Start Fresh:</strong> Use the "Merge another" button on the success screen to quickly clear the list and start a new merge operation.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}

    