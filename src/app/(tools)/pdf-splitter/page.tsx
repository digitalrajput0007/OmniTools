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
import { Label } from '@/components/ui/label';
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function PdfSplitterPage() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [ranges, setRanges] = useState('');
  const [isSplitting, setIsSplitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [split, setSplit] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const resetState = () => {
    setFile(null);
    setTotalPages(0);
    setSplit(false);
    setProgress(0);
    setRanges('');
    setIsSplitting(false);
  };

  const handleFileSelect = async (selectedFile: File) => {
    if (selectedFile.type === 'application/pdf') {
      resetState();
      setFile(selectedFile);
      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        setTotalPages(pdf.getPageCount());
      } catch (error) {
        toast({
          title: 'Error Reading PDF',
          description: 'Could not read the selected PDF file.',
          variant: 'destructive',
        });
        resetState();
      }
    } else {
      toast({
        title: 'Invalid File Type',
        description: 'Please select a PDF file.',
        variant: 'destructive',
      });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDragEvents = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    handleDragEvents(e);
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    handleDragEvents(e);
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    handleDragEvents(e);
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    resetState();
  };

  const handleSplit = () => {
    if (!file) return;
    setIsSplitting(true);
    setSplit(false);
    setProgress(0);
    const startTime = Date.now();
    const minDuration = 3000;

    const interval = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const currentProgress = Math.min((elapsedTime / minDuration) * 100, 100);
      setProgress(currentProgress);
      if (currentProgress >= 100) {
        clearInterval(interval);
        setIsSplitting(false);
        setSplit(true);
      }
    }, 50);
  };

  const downloadSplitPdf = async () => {
    if (!file || !ranges) return;

    try {
      const pageNumbers = new Set<number>();
      const parts = ranges.split(',');
      for (const part of parts) {
        if (part.includes('-')) {
          const [start, end] = part.split('-').map(Number);
          if (
            !isNaN(start) &&
            !isNaN(end) &&
            start <= end &&
            start > 0 &&
            end <= totalPages
          ) {
            for (let i = start; i <= end; i++) {
              pageNumbers.add(i);
            }
          }
        } else {
          const page = Number(part);
          if (!isNaN(page) && page > 0 && page <= totalPages) {
            pageNumbers.add(page);
          }
        }
      }

      if (pageNumbers.size === 0) {
        toast({
          title: 'Invalid Range',
          description: 'Please enter a valid page range to split.',
          variant: 'destructive',
        });
        return;
      }

      const arrayBuffer = await file.arrayBuffer();
      const originalPdf = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();

      const sortedPages = Array.from(pageNumbers).sort((a, b) => a - b);
      const copiedPages = await newPdf.copyPages(
        originalPdf,
        sortedPages.map((p) => p - 1)
      );
      copiedPages.forEach((page) => newPdf.addPage(page));

      const newPdfBytes = await newPdf.save();
      const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `split-${file.name}`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: 'Error Splitting PDF',
        description: 'Could not split the PDF. Please check the page ranges.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className='text-2xl'>PDF Splitter</CardTitle>
          <CardDescription className="text-base">
            Extract specific pages or ranges from a PDF file.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!file ? (
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
                Drag & drop your PDF here, or click to browse
              </p>
              <Input
                id="pdf-upload"
                type="file"
                className="sr-only"
                onChange={handleFileChange}
                accept="application/pdf"
              />
              <Button asChild variant="outline" className="mt-4">
                <span>Browse File</span>
              </Button>
            </label>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="relative flex flex-col items-center justify-center space-y-4 rounded-md border p-4">
                <FileIcon className="h-16 w-16 text-muted-foreground" />
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  Total pages: {totalPages}
                </p>
                {!isSplitting && !split && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={handleRemoveFile}
                    disabled={isSplitting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="flex flex-col space-y-6">
                {!isSplitting && !split && (
                  <>
                    <div>
                      <Label htmlFor="ranges">Pages to Extract</Label>
                      <Input
                        id="ranges"
                        type="text"
                        value={ranges}
                        onChange={(e) => setRanges(e.target.value)}
                        placeholder="e.g., 1, 3-5, 8"
                        disabled={isSplitting || split}
                      />
                      <p className="mt-2 text-xs text-muted-foreground">
                        Enter page numbers or ranges separated by commas.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <Button
                        onClick={handleSplit}
                        className="w-full"
                        disabled={!ranges}
                      >
                        Split PDF
                      </Button>
                    </div>
                  </>
                )}

                {isSplitting && (
                  <div className="flex h-full flex-col items-center justify-center space-y-4">
                    <CheckCircle2 className="h-16 w-16 text-green-500" />
                    <p className="text-center text-sm text-muted-foreground">
                      Splitting...
                    </p>
                  </div>
                )}
                {split && (
                  <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
                    <CheckCircle2 className="h-16 w-16 text-green-500" />
                    <h3 className="text-2xl font-bold">Splitting Complete</h3>
                    <p className="text-muted-foreground">
                      Your PDF has been split based on your selection.
                    </p>
                    <div className="text-sm">
                      <p>
                        Selected Pages:{' '}
                        <span className="font-medium text-foreground">
                          {ranges}
                        </span>
                      </p>
                    </div>
                    <div className="flex w-full flex-col gap-2 pt-4 sm:flex-row">
                      <Button className="w-full" onClick={downloadSplitPdf}>
                        <FileDown className="mr-2 h-4 w-4" />
                        Download Split PDF
                      </Button>
                      <Button
                        className="w-full"
                        variant="ghost"
                        onClick={resetState}
                      >
                        Split another
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>About the PDF Splitter</CardTitle>
          <CardDescription>
            Learn how to extract exactly the pages you need from any PDF file.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Accordion type="single" collapsible defaultValue="item-1">
            <AccordionItem value="item-1">
              <AccordionTrigger>What is PDF Splitting?</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <p>
                  PDF splitting is the process of taking a single, multi-page PDF document and breaking it into smaller parts. Our tool allows you to extract specific pages or a range of pages and save them as a brand new PDF file. This is incredibly useful for isolating a single chapter from a book, separating an important section from a long report, or sharing only the relevant pages of a document.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>How to Use the PDF Splitter</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <ol className="list-decimal list-inside space-y-2">
                  <li><strong>Upload Your PDF:</strong> Drag and drop your PDF file into the upload area, or click to browse and select it from your device. The tool will show you the total number of pages.</li>
                  <li><strong>Specify Pages to Extract:</strong> In the "Pages to Extract" input field, type the page numbers you want. You can specify single pages, ranges, or a combination.</li>
                  <li><strong>Start Splitting:</strong> Click the "Split PDF" button to begin the extraction process.</li>
                  <li><strong>Download Your New PDF:</strong> Once processing is complete, click the "Download Split PDF" button to save the new file containing only your selected pages.</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Tips for Defining Page Ranges</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <p>The page selection input is very flexible. Here are some examples of valid entries:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>To extract single pages: <strong>1, 5, 12</strong> (extracts pages 1, 5, and 12)</li>
                  <li>To extract a range of pages: <strong>3-7</strong> (extracts pages 3, 4, 5, 6, and 7)</li>
                  <li>To extract a combination: <strong>1, 3-5, 9</strong> (extracts pages 1, 3, 4, 5, and 9)</li>
                  <li>The pages will be saved in the new PDF in their natural sorted order (e.g., entering "5, 1-2" will result in a PDF with pages 1, 2, 5).</li>
                  <li><strong>Privacy Guaranteed:</strong> Like all our tools, the splitting process happens entirely in your browser. Your files are never sent to a server, ensuring your information remains secure.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
