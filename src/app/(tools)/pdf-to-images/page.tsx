
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
  FileText as FileIcon,
  CheckCircle2,
  RefreshCcw,
  X,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CircularProgress } from '@/components/ui/circular-progress';
import { SharePrompt } from '@/components/ui/share-prompt';
import { Label } from '@/components/ui/label';

let pdfjs: any;

export default function PdfToImagesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
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
        setProgress(Math.round((i / numPages) * 100));
      }
      
      const imageUrls = await Promise.all(imagePromises);
      setPreviews(imageUrls);
      setDone(true);
    } catch (error) {
       toast({ title: 'Conversion Error', description: 'Failed to convert PDF pages to images.', variant: 'destructive' });
    } finally {
        setIsProcessing(false);
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
    if (done) {
        return (
            <div className="space-y-6">
                <div className="text-center space-y-2">
                    <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
                    <h3 className="text-2xl font-bold">Conversion Successful!</h3>
                    <p className="text-muted-foreground">{previews.length} pages have been converted to images.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button onClick={handleDownloadAll}><FileDown className="mr-2" /> Download All as ZIP</Button>
                    <Button variant="secondary" onClick={resetState}><RefreshCcw className="mr-2" /> Convert Another PDF</Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {previews.map((src, index) => (
                    <div key={index} className="relative group border rounded-lg overflow-hidden">
                        <Image src={src} alt={`Page ${index + 1}`} width={200} height={280} className="w-full h-auto object-contain" />
                        <p className="text-center text-xs p-1 bg-secondary/50">{`Page ${index + 1}`}</p>
                    </div>
                    ))}
                </div>
                <div className="flex justify-center">
                    <SharePrompt toolName="PDF to Images" />
                </div>
            </div>
        );
    }
    
    if (file) {
      return (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="relative flex flex-col items-center justify-center space-y-4 rounded-md border p-8 bg-muted/20">
            <FileIcon className="h-24 w-24 text-primary" />
            <p className="truncate text-lg font-medium">{file?.name}</p>
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
            <CardTitle className="text-3xl font-bold tracking-tight lg:text-4xl">PDF to Images</CardTitle>
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
                  <li><strong>Preview and Download:</strong> Once complete, you will see a preview of all the generated images. You can click "Download All as ZIP" to get a single file containing all the images, conveniently named by page number.</li>
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
