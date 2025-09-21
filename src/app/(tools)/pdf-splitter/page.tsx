
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
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CircularProgress } from '@/components/ui/circular-progress';
import { SharePrompt } from '@/components/ui/share-prompt';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';

let pdfjs: any;

const PdfIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" fill="#FADBD8" stroke="#E74C3C" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M14 2V8H20" stroke="#E74C3C" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M8 12H9C10.1046 12 11 12.8954 11 14V18" stroke="#C0392B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 18V12H16" stroke="#C0392B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 15H16" stroke="#C0392B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);


export default function PdfSplitterPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
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
        const viewport = page.getViewport({ scale: 1 });
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
    setRanges(rangesArray.join(','));
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
    const parts = rangesStr.split(',');
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

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="text-center">
            <CardTitle className="text-3xl font-bold tracking-tight lg:text-4xl">PDF Splitter</CardTitle>
            <CardDescription className="text-base mt-2">
              Extract specific pages or ranges from a PDF file.
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
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                    {previews.map((preview, index) => (
                        <div
                        key={index}
                        onClick={() => handleTogglePage(index + 1)}
                        className={cn(
                            'relative cursor-pointer rounded-lg border-2 p-1 transition-all',
                            selectedPages.has(index + 1)
                            ? 'border-primary shadow-lg'
                            : 'border-transparent hover:border-primary/50'
                        )}
                        >
                        <Image
                            src={preview}
                            alt={`Page ${index + 1}`}
                            width={150}
                            height={212}
                            className="w-full h-auto rounded-md shadow-md"
                        />
                        <div
                            className={cn(
                            'absolute inset-0 flex items-center justify-center rounded-md bg-black/50 opacity-0 transition-opacity',
                            selectedPages.has(index + 1) && 'opacity-100'
                            )}
                        >
                            <CheckCircle2 className="h-8 w-8 text-white" />
                        </div>
                        <p className="text-center text-xs font-medium mt-1">{index + 1}</p>
                        </div>
                    ))}
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="ranges">Pages to Extract</Label>
                        <Input
                            id="ranges"
                            type="text"
                            value={ranges}
                            onChange={handleRangeChange}
                            placeholder="e.g., 1, 3-5, 8"
                            disabled={isSplitting}
                        />
                        <p className="mt-2 text-xs text-muted-foreground">
                            Click pages above or enter page numbers/ranges separated by commas.
                        </p>
                    </div>

                    <div className="flex flex-col justify-end">
                    {split ? (
                        <div className="flex h-full flex-col items-start justify-center space-y-4">
                            <div className="w-full text-center space-y-2">
                                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
                                <h3 className="text-2xl font-bold">Splitting Complete</h3>
                                <p className="text-muted-foreground">
                                Your PDF has been split based on your selection.
                                </p>
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
                        <Button
                            onClick={handleSplit}
                            className="w-full"
                            disabled={!ranges}
                        >
                            Split PDF
                        </Button>
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
