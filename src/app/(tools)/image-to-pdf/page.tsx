
'use client';

import { useState } from 'react';
import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FileDown, UploadCloud, X, CheckCircle2, RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CircularProgress } from '@/components/ui/circular-progress';
import { SharePrompt } from '@/components/ui/share-prompt';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

function ImageToPdfConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [converted, setConverted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const resetState = () => {
    setFile(null);
    setPreview(null);
    setConverted(false);
    setProgress(0);
    setIsConverting(false);
  };

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type.startsWith('image/')) {
      resetState();
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    } else {
      toast({
        title: 'Invalid File Type',
        description: 'Please select an image file.',
        variant: 'destructive',
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const downloadPdf = () => {
    if (!file || !preview) return;
    const img = new Image();
    img.src = preview;
    img.onload = () => {
      const orientation = img.width > img.height ? 'l' : 'p';
      const pdf = new jsPDF(orientation, 'px', [img.width, img.height]);
      pdf.addImage(img, 'PNG', 0, 0, img.width, img.height);
      pdf.save(`${file.name.replace(/\.[^/.]+$/, '')}.pdf`);
    };
    img.onerror = () => {
      toast({
        title: 'Conversion Error',
        description: 'Failed to load image for PDF conversion.',
        variant: 'destructive',
      });
    };
  };

  const handleConvertToPdf = () => {
    if (!file) return;
    setIsConverting(true);
    setConverted(false);
    setProgress(0);
    const startTime = Date.now();
    const minDuration = 3000;

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
          <CardTitle className="text-2xl font-bold tracking-tight">Image to PDF</CardTitle>
          <CardDescription>
            Convert your JPG, PNG, and other images to a PDF document.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!file ? (
            <label
              htmlFor="image-upload"
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
                Drag & drop your image here, or click to browse
              </p>
              <Input
                id="image-upload"
                type="file"
                className="sr-only"
                onChange={handleFileChange}
                accept="image/*"
              />
              <Button asChild variant="outline" className="mt-4">
                <span>Browse File</span>
              </Button>
            </label>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="relative">
                {preview && (
                  <img
                    src={preview}
                    alt="Image preview"
                    className="max-h-[400px] w-full rounded-lg object-contain"
                  />
                )}
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
                      <p className="text-sm text-muted-foreground">
                        Name: {file?.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Size: {file ? (file.size / 1024).toFixed(2) : 0} KB
                      </p>
                    </div>

                    <div className="space-y-4">
                      <Button onClick={handleConvertToPdf} className="w-full">
                        Convert to PDF
                      </Button>
                    </div>
                  </>
                )}
                {isConverting && !converted && (
                  <div className="flex h-full flex-col items-center justify-center space-y-4">
                    <CircularProgress progress={progress} />
                    <p className="text-center text-sm text-muted-foreground">
                      Converting...
                    </p>
                  </div>
                )}
                {converted && (
                  <div className="flex h-full flex-col items-start justify-center space-y-4">
                    <div className='w-full text-center space-y-2'>
                        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
                        <h3 className="text-2xl font-bold">Conversion Complete</h3>
                        <p className="text-muted-foreground">
                        Your image has been converted to PDF.
                        </p>
                    </div>
                    <div className="w-full text-sm rounded-lg border p-4">
                      <h4 className="font-medium">File Information</h4>
                      <p className="text-muted-foreground">
                        Name: {file?.name}
                      </p>
                    </div>
                    <div className="flex w-full flex-col gap-2 pt-4">
                      <Button className="w-full" onClick={downloadPdf}>
                        <FileDown className="mr-2 h-4 w-4" />
                        Download PDF
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
                    <SharePrompt toolName="Image to PDF Converter" />
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
  )
}

export default function ImagePdfConverterPage() {
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
          <Tabs defaultValue="image-to-pdf">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="image-to-pdf">Image to PDF</TabsTrigger>
               <TabsTrigger value="pdf-to-image" asChild>
                <Link href="/pdf-to-image">PDF to Image</Link>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="image-to-pdf" className="pt-6">
              <ImageToPdfConverter />
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
