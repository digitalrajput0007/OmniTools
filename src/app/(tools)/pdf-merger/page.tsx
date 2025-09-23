
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
  CheckCircle2,
  RefreshCcw,
  PlusCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CircularProgress } from '@/components/ui/circular-progress';
import { SharePrompt } from '@/components/ui/share-prompt';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RelatedTools } from '@/components/ui/related-tools';

const PdfIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" fill="#FADBD8" stroke="#E74C3C" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M14 2V8H20" stroke="#E74C3C" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M8 12H9C10.1046 12 11 12.8954 11 14V18" stroke="#C0392B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 18V12H16" stroke="#C0392B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 15H16" stroke="#C0392B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);


export default function PdfMergerPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [merged, setMerged] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [mergedFile, setMergedFile] = useState<Blob | null>(null);
  const { toast } = useToast();

  const resetState = () => {
    setFiles([]);
    setIsMerging(false);
    setProgress(0);
    setMerged(false);
    setMergedFile(null);
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
  
  const createMergedPdf = async (): Promise<Blob | null> => {
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
        return new Blob([mergedPdfBytes], { type: 'application/pdf' });
      } catch (error) {
        console.error(error);
        toast({
            title: 'Error Merging PDFs',
            description: error instanceof Error ? error.message : 'An unknown error occurred.',
            variant: 'destructive',
        });
        return null;
      }
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

    const minDuration = 3000;
    const startTime = Date.now();
    
    const mergePromise = createMergedPdf();

    const progressInterval = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const currentProgress = Math.min((elapsedTime / minDuration) * 100, 100);
        setProgress(currentProgress);
    }, 50);

    const [createdBlob] = await Promise.all([
        mergePromise,
        new Promise(resolve => setTimeout(resolve, minDuration))
    ]);
    
    clearInterval(progressInterval);
    setIsMerging(false);
    setProgress(100);

    if (createdBlob) {
        setMergedFile(createdBlob);
        setMerged(true);
    } else {
        // Error is handled in createMergedPdf, just reset state
        resetState();
    }
  };
  
  const handleDownload = () => {
    if (!mergedFile) return;
    
    const url = URL.createObjectURL(mergedFile);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'merged.pdf';
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };
  
  const formatFileSize = (bytes: number | null | undefined): string => {
    if (!bytes) return '0 KB';
    if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(2) + ' KB';
    } else {
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
  };

  const renderContent = () => {
    if (files.length === 0) {
      return (
         <label
            htmlFor="pdf-upload"
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 text-center transition-colors bg-muted/20',
              { 'border-primary bg-accent/50': isDragging }
            )}
            onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragEvents} onDrop={handleDrop}
          >
            <UploadCloud className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Drag & drop your PDFs here, or click to browse</p>
            <Input id="pdf-upload" type="file" className="sr-only" onChange={handleFileChange} accept="application/pdf" multiple />
            <Button asChild variant="outline" className="mt-4"><span>Browse Files</span></Button>
          </label>
      );
    }
    
    return (
       <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col space-y-4">
            <h3 className="font-semibold">Selected Files ({files.length}):</h3>
            <ScrollArea className="flex-grow rounded-md border" style={{ maxHeight: 'calc(100vh - 300px)'}}>
              <div className="space-y-2 p-2">
                {files.map((file, index) => (
                  <div key={index} className="relative flex items-center gap-4 rounded-md border bg-background p-2">
                    <PdfIcon className="h-6 w-6 shrink-0" />
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => handleRemoveFile(index)} disabled={isMerging}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
             {!merged && !isMerging && (
                <label htmlFor="pdf-upload-additional" className="w-full">
                    <Button variant="outline" asChild className="w-full cursor-pointer">
                        <span><PlusCircle className="mr-2 h-4 w-4" /> Add More Files</span>
                    </Button>
                    <Input id="pdf-upload-additional" type="file" className="sr-only" onChange={handleFileChange} accept="application/pdf" multiple />
                </label>
             )}
          </div>
          <div className="flex flex-col justify-center space-y-6">
            {isMerging ? (
                 <div className="flex h-full flex-col items-center justify-center space-y-4">
                    <CircularProgress progress={progress} />
                    <p className="text-center text-sm text-muted-foreground">Merging PDFs... This may take a moment.</p>
                 </div>
              ) : merged ? (
                 <div className="space-y-6">
                    <div className="text-center space-y-2">
                        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
                        <h3 className="text-2xl font-bold">Merging Complete</h3>
                        <p className="text-muted-foreground">Your PDFs have been successfully merged.</p>
                    </div>
                    <div className="w-full text-sm rounded-lg border p-4">
                        <p>Files merged: <span className="font-medium text-foreground">{files.length}</span></p>
                        <p>New Size: <span className="font-medium text-foreground">{formatFileSize(mergedFile?.size)}</span></p>
                    </div>
                    <div className="flex w-full flex-col gap-2 pt-4">
                        <Button className="w-full" onClick={handleDownload}><FileDown className="mr-2 h-4 w-4" />Download Merged PDF</Button>
                        <Button className="w-full" variant="secondary" onClick={resetState}><RefreshCcw className="mr-2 h-4 w-4" />Merge another</Button>
                    </div>
                    <SharePrompt toolName="PDF Merger" />
                </div>
              ) : (
                <Button onClick={handleMerge} size="lg" className="w-full" disabled={files.length < 2}>Merge PDFs</Button>
              )}
          </div>
       </div>
    );
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="text-center">
            <CardTitle className="text-3xl font-bold tracking-tight lg:text-4xl">Merge PDF Files Online</CardTitle>
            <CardDescription className="text-base mt-2">
              Combine multiple PDF files into a single document with our free PDF merger.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {renderContent()}
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
      <RelatedTools toolPath="/pdf-merger" />
    </div>
  );
}

    