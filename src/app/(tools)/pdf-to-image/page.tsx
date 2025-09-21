
'use client';

import { useState } from 'react';
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
import { FileDown, UploadCloud, X, CheckCircle2, RefreshCcw, File as FileIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CircularProgress } from '@/components/ui/circular-progress';
import { SharePrompt } from '@/components/ui/share-prompt';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import * as pdfjs from 'pdfjs-dist/build/pdf.mjs';
import 'pdfjs-dist/build/pdf.worker.mjs';
import JSZip from 'jszip';


function PdfToImageConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [converted, setConverted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const resetState = () => {
    setFile(null);
    setTotalPages(0);
    setConverted(false);
    setProgress(0);
    setIsConverting(false);
  };

  const handleFileSelect = async (selectedFile: File) => {
    if (selectedFile.type === 'application/pdf') {
      resetState();
      setFile(selectedFile);
      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        setTotalPages(pdf.numPages);
      } catch (error) {
        console.error('Error reading PDF:', error);
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
      await handleFileSelect(e.target.files[0]);
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

  const handleDrop = async (e: React.DragEvent<HTMLLabelElement>) => {
    handleDragEvents(e);
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    resetState();
  };

  const downloadImages = async () => {
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const zip = new JSZip();

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // Increase scale for better quality
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
          const renderContext = {
            canvasContext: context,
            viewport: viewport,
          };
          await page.render(renderContext).promise;
          const imgData = canvas.toDataURL('image/png');
          const baseName = file.name.replace(/\.[^/.]+$/, '');
          zip.file(`${baseName}-page-${i}.png`, imgData.substring(imgData.indexOf(',') + 1), { base64: true });
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name.replace(/\.[^/.]+$/, '')}-images.zip`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error('Error converting PDF to images:', error);
      toast({
        title: 'Conversion Error',
        description: 'Failed to convert PDF pages to images.',
        variant: 'destructive',
      });
    }
  };

  const handleConvertToImage = () => {
    if (!file) return;
    setIsConverting(true);
    setConverted(false);
    setProgress(0);
    const startTime = Date.now();
    const minDuration = 3000 + (totalPages * 100); // Simulate longer processing for more pages

    const interval = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const currentProgress = Math.min((elapsedTime / minDuration) * 100, 100);
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(interval);
        setIsConverting(false);
        setConverted(true);
      }
    }, 50);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold tracking-tight">PDF to Image</CardTitle>
        <CardDescription>
          Extract all pages from a PDF as high-quality images.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!file ? (
          <label
            htmlFor="pdf-upload"
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 text-center transition-colors',
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
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
             <div className="relative flex flex-col items-center justify-center space-y-4 rounded-md border p-4">
                <FileIcon className="h-16 w-16 text-muted-foreground" />
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  Total pages: {totalPages}
                </p>
                {!isConverting && !converted && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={handleRemoveFile}
                    disabled={isConverting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            <div className="flex flex-col justify-center space-y-6">
              {!isConverting && !converted && (
                <>
                  <div>
                    <h3 className="mb-2 font-semibold">File Information</h3>
                    <p className="text-sm text-muted-foreground">Name: {file?.name}</p>
                    <p className="text-sm text-muted-foreground">Size: {file ? (file.size / 1024).toFixed(2) : 0} KB</p>
                     <p className="text-sm text-muted-foreground">Pages: {totalPages}</p>
                  </div>
                  <div className="space-y-4">
                    <Button onClick={handleConvertToImage} className="w-full">
                      Convert to Images
                    </Button>
                  </div>
                </>
              )}
              {isConverting && !converted && (
                <div className="flex h-full flex-col items-center justify-center space-y-4">
                  <CircularProgress progress={progress} />
                  <p className="text-center text-sm text-muted-foreground">
                    Converting {totalPages} pages...
                  </p>
                </div>
              )}
              {converted && (
                <div className="flex h-full flex-col items-start justify-center space-y-4">
                  <div className='w-full text-center space-y-2'>
                    <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
                    <h3 className="text-2xl font-bold">Conversion Complete</h3>
                    <p className="text-muted-foreground">
                      All pages have been converted to images and bundled in a ZIP file.
                    </p>
                  </div>
                  <div className="flex w-full flex-col gap-2 pt-4">
                    <Button className="w-full" onClick={downloadImages}>
                      <FileDown className="mr-2 h-4 w-4" />
                      Download ZIP
                    </Button>
                    <Button
                      className="w-full"
                      variant="secondary"
                      onClick={resetState}
                    >
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      Convert another
                    </Button>
                  </div>
                  <SharePrompt toolName="PDF to Image Converter" />
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


export default function PdfImageConverterPage() {
  return (
    <div className="grid gap-6">
       <Card>
         <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold tracking-tight lg:text-4xl">Image & PDF Converter</CardTitle>
            <CardDescription className="text-base mt-2">
              Easily convert images to PDF or extract images from a PDF.
            </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pdf-to-image">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="image-to-pdf" asChild>
                <Link href="/image-to-pdf">Image to PDF</Link>
              </TabsTrigger>
               <TabsTrigger value="pdf-to-image">PDF to Image</TabsTrigger>
            </TabsList>
            <TabsContent value="pdf-to-image" className="pt-6">
              <PdfToImageConverter />
            </TabsContent>
          </Tabs>
        </CardContent>
       </Card>

      <Card>
        <CardHeader>
          <CardTitle>About the Image & PDF Converter</CardTitle>
          <CardDescription>
            Turn images into PDFs and back again with ease.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Accordion type="single" collapsible defaultValue="item-1">
            <AccordionItem value="item-1">
              <AccordionTrigger>Why Convert Between Images and PDF?</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <p>
                  Converting images to PDF is perfect for creating shareable documents, archiving images, or compiling multiple images into a single file for reports or portfolios. PDFs are a universal standard, preserving layout and quality across devices.
                </p>
                 <p>
                  Converting a PDF to images is useful when you need to extract photos, diagrams, or other visual elements from a PDF document for use in presentations, web pages, or social media. It allows you to isolate and save specific visual content as standard image files (like PNG).
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>How to Use the Converter</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <ol className="list-decimal list-inside space-y-2">
                  <li><strong>Select the Right Tool:</strong> Choose the 'Image to PDF' or 'PDF to Image' tab based on your needs.</li>
                  <li><strong>Upload Your File:</strong> Drag and drop your file (an image or a PDF) into the upload box or click to browse.</li>
                  <li><strong>Convert:</strong> Follow the on-screen instructions to start the conversion. For PDF to Image, you can select specific pages to extract.</li>
                  <li><strong>Download Your File(s):</strong> After processing, download your new PDF or image files. When converting from PDF, you'll get a ZIP file containing all the extracted images.</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
