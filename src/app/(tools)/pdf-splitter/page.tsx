
'use client';

import { useState, useEffect } from 'react';
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
import {
  FileDown,
  UploadCloud,
  X,
  CheckCircle2,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  MinusCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CircularProgress } from '@/components/ui/circular-progress';
import { SharePrompt } from '@/components/ui/share-prompt';
import Image from 'next/image';
import { RelatedTools } from '@/components/ui/related-tools';

let pdfjs: any;

export default function PdfSplitterPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [totalPages, setTotalPages] = useState(0);
  const [ranges, setRanges] = useState('');
  const [isSplitting, setIsSplitting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [split, setSplit] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    import('pdfjs-dist/build/pdf.mjs').then(pdfjsLib => {
      pdfjs = pdfjsLib;
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.mjs',
        import.meta.url
      ).toString();
    });
  }, []);

  const resetState = () => {
    setFile(null);
    setPreviews([]);
    setCurrentPreviewIndex(0);
    setSelectedPages(new Set());
    setTotalPages(0);
    setSplit(false);
    setProgress(0);
    setRanges('');
    setIsSplitting(false);
    setIsProcessing(false);
  };
  
  const handleFileSelect = async (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      toast({ title: 'Invalid File Type', variant: 'destructive' });
      return;
    }
     if (!pdfjs) {
        toast({ title: 'PDF library not loaded', description: 'Please wait a moment and try again.', variant: 'destructive' });
        return;
    }
    resetState();
    setFile(selectedFile);
    setIsProcessing(true);
    
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      setTotalPages(numPages);
      
      const pagePreviews: string[] = [];
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const context = canvas.getContext('2d');
        if (context) {
          await page.render({ canvasContext: context, viewport }).promise;
          pagePreviews.push(canvas.toDataURL());
        }
        setProgress(Math.round((i / numPages) * 100));
      }
      setPreviews(pagePreviews);
    } catch (error) {
      toast({ title: 'Error Reading PDF', variant: 'destructive' });
      resetState();
    } finally {
      setIsProcessing(false);
    }
  };


  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };
  
  const handleTogglePage = (pageNumber: number) => {
    const newSelectedPages = new Set(selectedPages);
    if (newSelectedPages.has(pageNumber)) {
      newSelectedPages.delete(pageNumber);
    } else {
      newSelectedPages.add(pageNumber);
    }
    setSelectedPages(newSelectedPages);
    updateRangesFromSet(newSelectedPages);
  };

  const updateRangesFromSet = (pages: Set<number>) => {
    if (pages.size === 0) {
      setRanges('');
      return;
    }
    const sortedPages = Array.from(pages).sort((a, b) => a - b);
    const rangesArray: (string | number)[] = [];
    if (sortedPages.length > 0) {
        let startOfRange = sortedPages[0];

        for (let i = 0; i < sortedPages.length; i++) {
          const currentPage = sortedPages[i];
          const nextRage = i + 1 < sortedPages.length ? sortedPages[i + 1] : null;

          if (nextRage === null || nextRage > currentPage + 1) {
            if (currentPage === startOfRange) {
              rangesArray.push(currentPage);
            } else {
              rangesArray.push(`${startOfRange}-${currentPage}`);
            }
            if(nextRage !== null) {
                startOfRange = nextRage;
            }
          }
        }
    }
    setRanges(rangesArray.join(', '));
  };

  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRanges = e.target.value;
    setRanges(newRanges);
    updateSetFromRanges(newRanges);
  };
  
  const updateSetFromRanges = (rangesStr: string) => {
    const newSelectedPages = new Set<number>();
    if (!rangesStr) {
      setSelectedPages(newSelectedPages);
      return;
    }
    const parts = rangesStr.split(/[, ]+/);
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(Number);
        if (!isNaN(start) && !isNaN(end) && start <= end && start > 0 && end <= totalPages) {
          for (let i = start; i <= end; i++) newSelectedPages.add(i);
        }
      } else {
        const page = Number(part);
        if (!isNaN(page) && page > 0 && page <= totalPages) newSelectedPages.add(page);
      }
    }
    setSelectedPages(newSelectedPages);
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSplit = () => {
    if (!file) return;
    if (selectedPages.size === 0) {
      toast({
        title: 'No Pages Selected',
        description: 'Please select at least one page to extract.',
        variant: 'destructive',
      });
      return;
    }
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
    if (!file || selectedPages.size === 0) {
       toast({
          title: 'No Pages Selected',
          description: 'Please select at least one page to split.',
          variant: 'destructive',
        });
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const originalPdf = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();

      const sortedPages = Array.from(selectedPages).sort((a, b) => a - b);
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
  
  const formatFileSize = (bytes: number | null | undefined): string => {
    if (!bytes) return '0 KB';
    if (bytes >= 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    } else {
      return (bytes / 1024).toFixed(2) + ' KB';
    }
  };
  
  const isCurrentPageSelected = selectedPages.has(currentPreviewIndex + 1);

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="text-center">
            <CardTitle className="text-3xl font-bold tracking-tight lg:text-4xl">Free PDF Splitter</CardTitle>
            <CardDescription className="text-base mt-2">
              Extract specific pages or ranges from a PDF file online.
            </CardDescription>
          </div>
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
          ) : isProcessing ? (
             <div className="flex min-h-[300px] flex-col items-center justify-center space-y-4">
                <CircularProgress progress={progress} />
                <p className="text-center text-sm text-muted-foreground">Loading PDF previews...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-8 md:grid-cols-2">
                {/* Left Column: Preview */}
                <div className="relative flex flex-col items-center justify-center rounded-lg border bg-muted/20 p-4">
                  <div className="relative w-full h-[400px]">
                    {previews[currentPreviewIndex] && (
                        <Image
                            src={previews[currentPreviewIndex]}
                            alt={`Page ${currentPreviewIndex + 1} preview`}
                            layout="fill"
                            objectFit="contain"
                            className={cn("shadow-md", isCurrentPageSelected && "ring-2 ring-primary ring-offset-2 rounded-sm")}
                        />
                    )}
                  </div>
                   {previews.length > 1 && (
                      <div className="mt-4 flex items-center justify-center gap-4 w-full">
                          <Button variant="outline" size="icon" onClick={() => setCurrentPreviewIndex(p => Math.max(0, p - 1))} disabled={currentPreviewIndex === 0}>
                              <ChevronLeft />
                          </Button>
                          <p className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                              Page {currentPreviewIndex + 1} of {previews.length}
                          </p>
                          <Button variant="outline" size="icon" onClick={() => setCurrentPreviewIndex(p => Math.min(previews.length - 1, p + 1))} disabled={currentPreviewIndex === previews.length - 1}>
                              <ChevronRight />
                          </Button>
                      </div>
                  )}
                  <Button variant={isCurrentPageSelected ? "destructive" : "outline"} className="w-full mt-2" onClick={() => handleTogglePage(currentPreviewIndex + 1)}>
                     {isCurrentPageSelected ? <MinusCircle className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                     {isCurrentPageSelected ? 'Deselect Page' : 'Select Page'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={resetState}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Right Column: Controls */}
                <div className="flex flex-col justify-center space-y-6">
                   {split ? (
                        <div className="flex h-full flex-col items-start justify-center space-y-4">
                            <div className="w-full text-center space-y-2">
                                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
                                <h3 className="text-2xl font-bold">Splitting Complete</h3>
                                <p className="text-muted-foreground">
                                Your PDF has been split based on your selection.
                                </p>
                            </div>
                             <div className="w-full text-sm rounded-lg border p-4">
                                <p>Pages to be extracted: <span className="font-medium text-foreground">{ranges}</span></p>
                                <p>Total selected: <span className="font-medium text-foreground">{selectedPages.size}</span></p>
                            </div>
                            <div className="flex w-full flex-col gap-2 pt-4">
                            <Button className="w-full" onClick={downloadSplitPdf}>
                                <FileDown className="mr-2 h-4 w-4" />
                                Download Split PDF
                            </Button>
                            <Button
                                className="w-full"
                                variant="secondary"
                                onClick={resetState}
                            >
                                <RefreshCcw className="mr-2 h-4 w-4" />
                                Split another
                            </Button>
                            </div>
                            <SharePrompt toolName="PDF Splitter" />
                        </div>
                    ) : isSplitting ? (
                        <div className="flex h-full flex-col items-center justify-center space-y-4">
                            <CircularProgress progress={progress} />
                            <p className="text-center text-sm text-muted-foreground">
                            Splitting...
                            </p>
                        </div>
                        ) : (
                        <>
                           <div>
                              <h3 className="mb-2 font-semibold">File Information</h3>
                              <div className="space-y-1 text-sm text-muted-foreground">
                                <p>Name: {file?.name}</p>
                                <p>Size: {formatFileSize(file?.size)}</p>
                              </div>
                            </div>
                           <div className="space-y-2">
                              <Label htmlFor="ranges">Pages to Extract</Label>
                              <Input
                                  id="ranges"
                                  type="text"
                                  value={ranges}
                                  onChange={handleRangeChange}
                                  placeholder="e.g., 1, 3-5, 8"
                              />
                              <p className="mt-2 text-xs text-muted-foreground">
                                  Click pages using the preview or enter page numbers/ranges separated by commas.
                              </p>
                          </div>
                          <Button
                              onClick={handleSplit}
                              className="w-full"
                              size="lg"
                              disabled={!ranges}
                          >
                              Split PDF
                          </Button>
                        </>
                    )}
                </div>
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
                  <li><strong>Upload Your PDF:</strong> Drag and drop your PDF file, or click to browse and select it. Page previews will be loaded.</li>
                  <li><strong>Select Pages:</strong> You have two ways to select pages:
                    <ul className="list-disc list-inside pl-4 mt-1">
                      <li><strong>Visually:</strong> Use the arrow buttons to navigate through the pages. Click "Select Page" to add the current page to your extraction list.</li>
                       <li><strong>Manually:</strong> Type page numbers or ranges (e.g., "1, 3-5, 9") into the "Pages to Extract" field.</li>
                    </ul>
                  </li>
                  <li><strong>Split the PDF:</strong> Once you have selected all desired pages, click the "Split PDF" button.</li>
                  <li><strong>Download:</strong> After a brief processing animation, click "Download Split PDF" to save your new, smaller document.</li>
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
      <RelatedTools toolPath="/pdf-splitter" />
    </div>
  );
}
