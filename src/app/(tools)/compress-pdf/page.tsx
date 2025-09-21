
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
  RefreshCcw,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CircularProgress } from '@/components/ui/circular-progress';
import { SharePrompt } from '@/components/ui/share-prompt';

export default function CompressPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [compressedFile, setCompressedFile] = useState<Blob | null>(null);
  const { toast } = useToast();

  const resetState = () => {
    setFile(null);
    setOriginalSize(null);
    setCompressedSize(null);
    setIsProcessing(false);
    setProgress(0);
    setDone(false);
    setCompressedFile(null);
  };

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      toast({
        title: 'Invalid File Type',
        description: 'Only PDF files are allowed.',
        variant: 'destructive',
      });
      return;
    }
    resetState();
    setFile(selectedFile);
    setOriginalSize(selectedFile.size);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
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
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleCompress = async () => {
    if (!file) {
      toast({ title: 'No File Selected', variant: 'destructive' });
      return;
    }
    setIsProcessing(true);
    setDone(false);
    setProgress(0);
    const startTime = Date.now();
    const minDuration = 3000;

    let compressionError: Error | null = null;
    let newPdfBytes: Uint8Array | null = null;

    const compressionPromise = (async () => {
        try {
            const existingPdfBytes = await file.arrayBuffer();
            // This is a basic form of "compression" with pdf-lib, which re-builds the PDF.
            // It can reduce file size if the original has unoptimized structures, but it's not a true compression algorithm.
            const pdfDoc = await PDFDocument.load(existingPdfBytes, { 
                // This option can break some PDFs, but is key to size reduction
                updateMetadata: false 
            });
            newPdfBytes = await pdfDoc.save({ useObjectStreams: false });
        } catch (error) {
            compressionError = error instanceof Error ? error : new Error('An unknown error occurred during compression.');
        }
    })();
    
    const progressInterval = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const currentProgress = Math.min((elapsedTime / minDuration) * 100, 100);
        setProgress(currentProgress);
    }, 50);

    await Promise.all([compressionPromise, new Promise(resolve => setTimeout(resolve, minDuration))]);
    clearInterval(progressInterval);
    setIsProcessing(false);

    if (compressionError) {
        toast({ title: 'Compression Error', description: compressionError.message, variant: 'destructive' });
    } else if (newPdfBytes) {
        setDone(true);
        const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
        setCompressedFile(blob);
        setCompressedSize(blob.size);
    }
  };

  const handleDownload = () => {
    if (!compressedFile || !file) return;
    const url = URL.createObjectURL(compressedFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compressed-${file.name}`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };
  
  const compressionPercentage =
    originalSize && compressedSize
      ? Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100))
      : 0;

  const renderContent = () => {
     if (isProcessing) {
      return (
        <div className="flex min-h-[300px] flex-col items-center justify-center space-y-4">
          <CircularProgress progress={progress} />
          <p className="text-center text-sm text-muted-foreground">Compressing PDF...</p>
        </div>
      );
    }
    
    if (done) {
        return (
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="text-center space-y-2">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
                <h3 className="text-2xl font-bold">Compression Complete</h3>
                <p className="text-muted-foreground">
                Your PDF has been compressed by {compressionPercentage}%.
                </p>
            </div>
            <div className="w-full max-w-sm text-sm rounded-lg border p-4 space-y-2">
                <p>Original Size: <span className="font-medium text-foreground">{(originalSize || 0 / 1024).toFixed(2)} KB</span></p>
                <p>Compressed Size: <span className="font-medium text-foreground">{(compressedSize || 0 / 1024).toFixed(2)} KB</span></p>
            </div>
            <div className="flex w-full max-w-sm flex-col gap-2 pt-4">
              <Button className="w-full" onClick={handleDownload}>
                <FileDown className="mr-2 h-4 w-4" /> Download Compressed PDF
              </Button>
              <Button className="w-full" variant="secondary" onClick={resetState}>
                <RefreshCcw className="mr-2 h-4 w-4" /> Compress Another
              </Button>
            </div>
            <SharePrompt toolName="Compress PDF" />
          </div>
        );
    }

    if (file) {
      return (
        <div className="flex flex-col items-center space-y-6">
            <div className="relative flex flex-col items-center justify-center space-y-4 rounded-md border p-8 w-full max-w-md">
                <FileIcon className="h-16 w-16 text-muted-foreground" />
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(originalSize || 0 / 1024).toFixed(2)} KB</p>
                <Button variant="destructive" size="icon" className="absolute right-2 top-2" onClick={resetState}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
            <Button onClick={handleCompress} size="lg" className="w-full max-w-md">Compress PDF</Button>
        </div>
      );
    }
    
    return (
        <label
            htmlFor="pdf-upload"
            className={cn('flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 text-center transition-colors', { 'border-primary bg-accent/50': isDragging })}
            onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragEvents} onDrop={handleDrop}
        >
            <UploadCloud className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Drag & drop your PDF here, or click to browse</p>
            <Input id="pdf-upload" type="file" className="sr-only" onChange={handleFileChange} accept="application/pdf" />
            <Button asChild variant="outline" className="mt-4"><span>Browse File</span></Button>
        </label>
    );
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="text-center">
            <CardTitle className="text-3xl font-bold tracking-tight lg:text-4xl">Compress PDF</CardTitle>
            <CardDescription className="text-base mt-2">
              Reduce the file size of your PDF documents quickly and easily.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>About PDF Compression</CardTitle>
          <CardDescription>
            Learn how reducing PDF file size can improve sharing and storage.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Accordion type="single" collapsible defaultValue="item-1">
            <AccordionItem value="item-1">
              <AccordionTrigger>Why Compress a PDF?</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <p>
                  Compressing a PDF reduces its file size, making it faster to send via email, quicker to upload to websites, and easier to store on your devices. Smaller files consume less bandwidth and storage space. Our tool aims to reduce the file size by optimizing the PDF's internal structure without significantly impacting the visual quality of its content.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>How to Use the PDF Compressor</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <ol className="list-decimal list-inside space-y-2">
                  <li><strong>Upload Your PDF:</strong> Drag and drop your PDF file into the upload area, or click to browse and select it from your device.</li>
                  <li><strong>Start Compression:</strong> Click the "Compress PDF" button. Our tool will analyze and rebuild the PDF to reduce its size.</li>
                  <li><strong>Download:</strong> Once complete, the tool will show you the original and new file sizes. Click "Download Compressed PDF" to save the optimized file.</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Compression and Privacy</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Client-Side Processing:</strong> Your privacy is our priority. The entire compression process happens in your web browser. Your PDF is never uploaded to a server.</li>
                  <li><strong>How It Works:</strong> This tool uses a method of re-saving the PDF, which can remove redundant data and use more efficient formatting. The reduction in size can vary greatly depending on the original file's structure.</li>
                  <li><strong>When to Use:</strong> This tool is ideal for PDFs that need to be shared quickly or for meeting file size limits on web portals and email clients.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
