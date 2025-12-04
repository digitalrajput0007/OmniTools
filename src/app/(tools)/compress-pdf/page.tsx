
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
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { RelatedTools } from '@/components/ui/related-tools';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compress PDF Online - Reduce PDF File Size for Free | OmniToolbox',
  description: 'Easily compress your PDF files to a smaller size online. Our free tool reduces PDF size while maintaining quality, making them easier to share and store.',
};


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


export default function CompressPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [compressedFile, setCompressedFile] = useState<Blob | null>(null);
  const [compressionQuality, setCompressionQuality] = useState([75]);
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
    setOriginalSize(null);
    setCompressedSize(null);
    setIsProcessing(false);
    setProgress(0);
    setDone(false);
    setCompressedFile(null);
    setCompressionQuality([75]);
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
    if (!pdfjs) {
        toast({ title: 'PDF library not loaded', description: 'Please wait a moment and try again.', variant: 'destructive' });
        return;
    }
    setIsProcessing(true);
    setDone(false);
    setProgress(0);

    let newPdfBytes: Uint8Array | null = null;
    let compressionError: Error | null = null;
    
    const startTime = Date.now();
    const minDuration = 3000;

    const compressionPromise = (async () => {
        try {
            const existingPdfBytes = await file.arrayBuffer();
            const loadingTask = pdfjs.getDocument({ data: existingPdfBytes });
            const pdf = await loadingTask.promise;
            const numPages = pdf.numPages;

            const newPdfDoc = await PDFDocument.create();
            const quality = compressionQuality[0] / 100;

            for (let i = 1; i <= numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 1.5 }); // Use a reasonable scale

                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                
                if(context) {
                    const renderContext = {
                        canvasContext: context,
                        viewport: viewport,
                    };
                    await page.render(renderContext).promise;

                    const jpegDataUrl = canvas.toDataURL('image/jpeg', quality);
                    const jpegImage = await newPdfDoc.embedJpg(jpegDataUrl);
                    
                    const newPage = newPdfDoc.addPage([viewport.width, viewport.height]);
                    newPage.drawImage(jpegImage, {
                        x: 0,
                        y: 0,
                        width: viewport.width,
                        height: viewport.height,
                    });
                }
            }

            newPdfBytes = await newPdfDoc.save();
        } catch (error) {
            compressionError = error instanceof Error ? error : new Error('An unknown error occurred during compression.');
        }
    })();
    
    const progressInterval = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const p = Math.min((elapsedTime / minDuration) * 100, 100);
        setProgress(p);
    }, 50);


    await Promise.all([compressionPromise, new Promise(resolve => setTimeout(resolve, minDuration))]);
    clearInterval(progressInterval);
    setIsProcessing(false);

    if (compressionError) {
      toast({
        title: 'Compression Error',
        description: compressionError.message,
        variant: 'destructive',
      });
      resetState();
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
  
  const formatFileSize = (bytes: number | null | undefined): string => {
    if (!bytes) return '0 KB';
    if (bytes >= 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    } else {
      return (bytes / 1024).toFixed(2) + ' KB';
    }
  };

  const compressionPercentage =
    originalSize && compressedSize
      ? Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100))
      : 0;

  const renderContent = () => {
    if (done) {
      return (
        <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col items-center justify-center space-y-4 rounded-md border p-8">
                <PdfIcon className="h-24 w-24" />
                <p className="truncate text-lg font-medium">{file?.name}</p>
                <p className="text-sm text-muted-foreground">Your compressed PDF is ready!</p>
            </div>
            <div className="flex h-full flex-col items-start justify-center space-y-4">
                <div className="w-full text-center space-y-2">
                    <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
                    <h3 className="text-2xl font-bold">Compression Complete</h3>
                    <p className="text-muted-foreground">
                    Your PDF has been compressed by {compressionPercentage}%.
                    </p>
                </div>
                <div className="w-full text-sm rounded-lg border p-4">
                    <p>Original Size: <span className="font-medium text-foreground">{formatFileSize(originalSize)}</span></p>
                    <p>Compressed Size: <span className="font-medium text-foreground">{formatFileSize(compressedSize)}</span></p>
                </div>
                <div className="flex w-full flex-col gap-2 pt-4">
                  <Button className="w-full" onClick={handleDownload}>
                    <FileDown className="mr-2 h-4 w-4" /> Download Compressed PDF
                  </Button>
                  <Button className="w-full" variant="secondary" onClick={resetState}>
                    <RefreshCcw className="mr-2 h-4 w-4" /> Compress Another
                  </Button>
                </div>
                <SharePrompt toolName="Compress PDF" />
            </div>
        </div>
      );
    }

    if (file) {
      return (
        <div className="grid gap-6 md:grid-cols-2">
           <div className="relative flex flex-col items-center justify-center space-y-4 rounded-md border p-8">
                <PdfIcon className="h-24 w-24" />
                <p className="truncate text-lg font-medium">{file.name}</p>
                <Button variant="destructive" size="icon" className="absolute right-2 top-2" onClick={resetState}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
            <div className="flex flex-col space-y-6 justify-center">
              {isProcessing ? (
                 <div className="flex h-full flex-col items-center justify-center space-y-4">
                    <CircularProgress progress={progress} />
                    <p className="text-center text-sm text-muted-foreground">Compressing PDF... This may take a moment.</p>
                 </div>
              ) : (
                <>
                  <div>
                    <h3 className="mb-2 font-semibold">File Information</h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Name: {file?.name}</p>
                      <p>Original Size: {formatFileSize(file?.size)}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Label htmlFor="compression-quality">Compression Quality: {compressionQuality[0]}%</Label>
                    <Slider
                      id="compression-quality"
                      min={0}
                      max={100}
                      step={1}
                      value={compressionQuality}
                      onValueChange={setCompressionQuality}
                    />
                    <p className="text-xs text-muted-foreground">
                      Lower percentage means smaller file size but lower image quality.
                    </p>
                  </div>
                  <Button onClick={handleCompress} size="lg" className="w-full">Compress PDF</Button>
                </>
              )}
            </div>
        </div>
      );
    }

    return (
      <label
        htmlFor="pdf-upload"
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 text-center transition-colors bg-muted/20',
          { 'border-primary bg-accent/50': isDragging }
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
    );
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="text-center">
            <CardTitle className="text-3xl font-bold tracking-tight lg:text-4xl">Compress PDF Online Free</CardTitle>
            <CardDescription className="text-base mt-2">
              Reduce the file size of your PDF documents quickly and easily.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>{renderContent()}</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>About PDF Compression</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm md:prose-base max-w-none text-muted-foreground space-y-4">
          <p>
            Compressing a PDF reduces its file size, making it faster to send via email, quicker to upload to websites, and easier to store on your devices. Smaller files consume less bandwidth and storage space. Our tool aims to reduce the file size by optimizing the PDF's internal structure without significantly impacting the visual quality of its content.
          </p>
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>How to Use the PDF Compressor</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <ol className="list-decimal list-inside space-y-2">
                  <li><strong>Upload Your PDF:</strong> Drag and drop your PDF file into the upload area, or click to browse and select it from your device.</li>
                  <li><strong>Choose a Compression Level:</strong> Select the desired level of compression. "Recommended" offers a good balance, while "High" prioritizes smaller file size.</li>
                  <li><strong>Start Compression:</strong> Click the "Compress PDF" button. Our tool will analyze and rebuild the PDF to reduce its size.</li>
                  <li><strong>Download:</strong> Once complete, the tool will show you the original and new file sizes. Click "Download Compressed PDF" to save the optimized file.</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Compression and Privacy</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Client-Side Processing:</strong> Your privacy is our priority. The entire compression process happens in your web browser. Your PDF is never uploaded to a server.</li>
                  <li><strong>How It Works:</strong> This tool renders each page of your PDF into an image and then recompresses that image at a lower quality to save space. This is highly effective for PDFs with many images but will cause text to become non-selectable.</li>
                  <li><strong>When to Use:</strong> This tool is ideal for PDFs that need to be shared quickly or for meeting file size limits on web portals and email clients.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
      <RelatedTools toolPath="/compress-pdf" />
    </div>
  );
}
