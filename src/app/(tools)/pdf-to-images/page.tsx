
'use client';

import { useState, useEffect } from 'react';
import JSZip from 'jszip';
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
  CheckCircle2,
  RefreshCcw,
  X,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CircularProgress } from '@/components/ui/circular-progress';
import { SharePrompt } from '@/components/ui/share-prompt';
import { Label } from '@/components/ui/label';

let pdfjs: any;

const JpgIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" fill="#D6EAF8" stroke="#3498DB" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M14 2V8H20" stroke="#3498DB" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M10 12H8V18H10V15H11C11.5523 15 12 14.5523 12 14V13C12 12.4477 11.5523 12 11 12H10Z" stroke="#2980B9" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M15 12H14V18H15C16.1046 18 17 17.1046 17 16V13C17 12.4477 16.5523 12 16 12H15Z" stroke="#2980B9" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
);

const PngIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" fill="#D5F5E3" stroke="#2ECC71" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M14 2V8H20" stroke="#2ECC71" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M8 12H9C10.1046 12 11 12.8954 11 14V18" stroke="#28B463" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M13 18V12L15 18V12" stroke="#28B463" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const WebpIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" fill="#FDEBD0" stroke="#F39C12" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M14 2V8H20" stroke="#F39C12" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M8 18L10 12L12 18L14 12L16 18" stroke="#D35400" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const GenericImageIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" fill="#EAECEE" stroke="#7F8C8D" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M14 2V8H20" stroke="#7F8C8D" strokeWidth="1.5" strokeLinejoin="round"/>
        <circle cx="9.5" cy="14.5" r="1.5" stroke="#95A5A6" strokeWidth="1.5"/>
        <path d="M12 18L14 16L17 18" stroke="#95A5A6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const PdfIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" fill="#FADBD8" stroke="#E74C3C" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M14 2V8H20" stroke="#E74C3C" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M8 12H9C10.1046 12 11 12.8954 11 14V18" stroke="#C0392B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 18V12H16" stroke="#C0392B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 15H16" stroke="#C0392B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);



export default function PdfToImagesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
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
    setIsProcessing(false);
    setProgress(0);
    setDone(false);
    setPreviews([]);
    setCurrentPreviewIndex(0);
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

  const handleConvert = async () => {
    if (!file) {
      toast({ title: 'No File', description: 'Please select a PDF file.', variant: 'destructive' });
      return;
    }
    if (!pdfjs) {
        toast({ title: 'PDF library not loaded', description: 'Please wait a moment and try again.', variant: 'destructive' });
        return;
    }
    setIsProcessing(true);
    setDone(false);
    setProgress(0);
    setPreviews([]);
    setCurrentPreviewIndex(0);
    
    let conversionError: Error | null = null;
    let imageUrls: string[] = [];
    
    const minDuration = 3000;
    const startTime = Date.now();

    const conversionPromise = (async () => {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
          const numPages = pdf.numPages;
          const imagePromises: Promise<string>[] = [];

          for (let i = 1; i <= numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 2 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            if (context) {
              await page.render({ canvasContext: context, viewport: viewport }).promise;
              imagePromises.push(Promise.resolve(canvas.toDataURL('image/jpeg')));
            }
          }
          
          imageUrls = await Promise.all(imagePromises);

        } catch (error) {
           conversionError = error instanceof Error ? error : new Error('An unknown error occurred during conversion.');
        }
    })();

    const progressInterval = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const p = Math.min((elapsedTime / minDuration) * 100, 100);
        setProgress(p);
    }, 50);

    await Promise.all([conversionPromise, new Promise(resolve => setTimeout(resolve, minDuration))]);
    clearInterval(progressInterval);
    setIsProcessing(false);
    
    if (conversionError) {
       toast({ title: 'Conversion Error', description: conversionError.message, variant: 'destructive' });
    } else {
      setPreviews(imageUrls);
      setDone(true);
    }
  };
  
  const handleDownloadAll = async () => {
    if (previews.length === 0 || !file) return;

    const zip = new JSZip();
    previews.forEach((dataUrl, index) => {
      const baseName = file.name.replace('.pdf', '');
      const blob = dataURLtoBlob(dataUrl);
      zip.file(`${baseName}-page-${index + 1}.jpg`, blob);
    });

    zip.generateAsync({ type: 'blob' }).then(content => {
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name.replace('.pdf', '')}-images.zip`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    });
  };

  const handleDownloadSingle = () => {
    if (!previews[currentPreviewIndex] || !file) return;

    const dataUrl = previews[currentPreviewIndex];
    const baseName = file.name.replace('.pdf', '');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${baseName}-page-${currentPreviewIndex + 1}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  function dataURLtoBlob(dataurl: string) {
    const arr = dataurl.split(',');
    if (arr.length < 2) return new Blob();
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) return new Blob();
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

  const formatFileSize = (bytes: number | null | undefined): string => {
    if (!bytes) return '0 KB';
    if (bytes >= 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    } else {
      return (bytes / 1024).toFixed(2) + ' KB';
    }
  };
  
  const renderContent = () => {
    if (!file) {
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
    }

    if (done) {
      return (
        <div className="grid gap-6 md:grid-cols-2">
            <div className="relative flex flex-col items-center justify-center rounded-lg border bg-muted/20 p-4">
                <div className="relative w-full h-[400px]">
                    <Image src={previews[currentPreviewIndex]} alt={`Page ${currentPreviewIndex + 1} preview`} layout="fill" objectFit="contain" className="shadow-md" />
                </div>
                {previews.length > 1 && (
                    <div className="mt-4 flex items-center justify-center gap-4">
                        <Button variant="outline" size="icon" onClick={() => setCurrentPreviewIndex(p => Math.max(0, p - 1))} disabled={currentPreviewIndex === 0}>
                            <ChevronLeft />
                        </Button>
                        <p className="text-sm font-medium text-muted-foreground">
                            Page {currentPreviewIndex + 1} of {previews.length}
                        </p>
                        <Button variant="outline" size="icon" onClick={() => setCurrentPreviewIndex(p => Math.min(previews.length - 1, p + 1))} disabled={currentPreviewIndex === previews.length - 1}>
                            <ChevronRight />
                        </Button>
                    </div>
                )}
            </div>

            <div className="flex h-full flex-col items-start justify-center space-y-4">
              <div className="w-full text-center space-y-2">
                  <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
                  <h3 className="text-2xl font-bold">Conversion Complete</h3>
                  <p className="text-muted-foreground">{previews.length} pages converted to JPG images.</p>
              </div>
              <div className="w-full text-sm rounded-lg border p-4">
                <p>File: <span className="font-medium text-foreground">{file.name}</span></p>
                <p>Pages converted: <span className="font-medium text-foreground">{previews.length}</span></p>
              </div>
              <div className="flex w-full flex-col gap-2 pt-4">
                <Button className="w-full" onClick={handleDownloadSingle}>
                  <FileDown className="mr-2 h-4 w-4" /> Download Current Image
                </Button>
                <Button className="w-full" variant="secondary" onClick={handleDownloadAll}>
                  <FileDown className="mr-2 h-4 w-4" /> Download All as ZIP
                </Button>
                <Button className="w-full" variant="outline" onClick={resetState}>
                  <RefreshCcw className="mr-2 h-4 w-4" /> Convert Another
                </Button>
              </div>
              <SharePrompt toolName="PDF to Images" />
            </div>
        </div>
      );
    }

    return (
      <div className="grid gap-6 md:grid-cols-2">
         <div className="relative flex flex-col items-center justify-center space-y-4 rounded-md border p-8">
            <FileText className="h-24 w-24 text-primary" />
            <p className="truncate text-lg font-medium">{file.name}</p>
            <Button variant="destructive" size="icon" className="absolute right-2 top-2" onClick={resetState}>
                <X className="h-4 w-4" />
            </Button>
        </div>

        <div className="flex flex-col space-y-6 justify-center">
            {isProcessing ? (
                <div className="flex h-full flex-col items-center justify-center space-y-4">
                    <CircularProgress progress={progress} />
                    <p className="text-center text-sm text-muted-foreground">Converting PDF to images...</p>
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
                <Button onClick={handleConvert} size="lg" className="w-full">
                  Convert to Images
                </Button>
              </>
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
            <CardTitle className="text-3xl font-bold tracking-tight lg:text-4xl">PDF to Images Converter</CardTitle>
            <CardDescription className="text-base mt-2">
              Extract each page of a PDF as a high-quality JPG image.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>About PDF to Image Conversion</CardTitle>
          <CardDescription>
            Learn how to turn your PDF documents into versatile image files.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Accordion type="single" collapsible defaultValue="item-1">
            <AccordionItem value="item-1">
              <AccordionTrigger>Why Convert PDF to Images?</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <p>
                  Converting PDF pages into images (like JPG) makes them easy to use in presentations, social media posts, or websites where PDFs aren't supported. It allows you to isolate a specific page as a standalone visual, embed it directly into other documents, or share it on platforms that favor image formats.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>How to Use the Converter</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <ol className="list-decimal list-inside space-y-2">
                  <li><strong>Upload Your PDF:</strong> Drag and drop your PDF file into the upload area, or click to browse and select it from your device.</li>
                  <li><strong>Start Conversion:</strong> Click the "Convert to Images" button. The tool will begin processing each page of the document.</li>
                  <li><strong>Preview and Download:</strong> Once complete, you can navigate through the generated images. You can download the current image or click "Download All as ZIP" to get a single file containing all the images, conveniently named by page number.</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Features and Privacy</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Secure and Private:</strong> All processing is done on your device. Your PDF never leaves your computer, ensuring your data is safe.</li>
                  <li><strong>High-Quality Output:</strong> The tool converts pages at a high resolution to ensure the resulting JPG images are clear and readable.</li>
                  <li><strong>Batch Download:</strong> The ZIP file download makes it easy to manage all the converted images at once, saving you from having to download each one individually.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
