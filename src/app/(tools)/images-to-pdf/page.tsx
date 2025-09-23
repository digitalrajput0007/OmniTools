
'use client';

import { useState } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
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
import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CircularProgress } from '@/components/ui/circular-progress';
import { SharePrompt } from '@/components/ui/share-prompt';

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

const getFileIcon = (file: File) => {
    if (file.type.includes('jpeg') || file.type.includes('jpg')) {
        return <JpgIcon className="w-full h-auto rounded-md object-cover aspect-square" />;
    }
    if (file.type.includes('png')) {
        return <PngIcon className="w-full h-auto rounded-md object-cover aspect-square" />;
    }
    if (file.type.includes('webp')) {
        return <WebpIcon className="w-full h-auto rounded-md object-cover aspect-square" />;
    }
    return <GenericImageIcon className="w-full h-auto rounded-md object-cover aspect-square" />;
};


export default function ImagesToPdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [convertedPdfBlob, setConvertedPdfBlob] = useState<Blob | null>(null);
  const { toast } = useToast();

  const resetState = () => {
    setFiles([]);
    setIsProcessing(false);
    setProgress(0);
    setDone(false);
    setConvertedPdfBlob(null);
  };

  const handleFileAdd = (newFiles: File[]) => {
    const imageFiles = newFiles.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length !== newFiles.length) {
      toast({
        title: 'Invalid File Type',
        description: 'Only image files are allowed.',
        variant: 'destructive',
      });
    }
    setFiles(prev => [...prev, ...imageFiles]);
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
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleConvertToPdf = async () => {
    if (files.length === 0) {
      toast({
        title: 'No Files Selected',
        description: 'Please select at least one image to convert.',
        variant: 'destructive',
      });
      return;
    }
    setIsProcessing(true);
    setDone(false);
    setProgress(0);
    const startTime = Date.now();
    const minDuration = 3000;

    let conversionError: Error | null = null;
    let mergedPdfBytes: Uint8Array | null = null;
    
    const conversionPromise = (async () => {
        try {
            const pdfDoc = await PDFDocument.create();
            for (const file of files) {
                const arrayBuffer = await file.arrayBuffer();
                let image;
                if (file.type === 'image/png') {
                    image = await pdfDoc.embedPng(arrayBuffer);
                } else {
                    image = await pdfDoc.embedJpg(arrayBuffer);
                }
                const page = pdfDoc.addPage([image.width, image.height]);
                page.drawImage(image, {
                    x: 0,
                    y: 0,
                    width: image.width,
                    height: image.height,
                });
            }
            mergedPdfBytes = await pdfDoc.save();
        } catch (error) {
            conversionError = error instanceof Error ? error : new Error('An unknown error occurred during conversion.');
        }
    })();

    const progressInterval = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const currentProgress = Math.min((elapsedTime / minDuration) * 100, 100);
        setProgress(currentProgress);
    }, 50);

    await Promise.all([conversionPromise, new Promise(resolve => setTimeout(resolve, minDuration))]);
    clearInterval(progressInterval);
    setIsProcessing(false);
    
    if (conversionError) {
        toast({ title: 'Conversion Error', description: conversionError.message, variant: 'destructive'});
    } else if (mergedPdfBytes) {
        setDone(true);
        const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
        setConvertedPdfBlob(blob);
    }
  };
  
  const handleDownload = () => {
    if (!convertedPdfBlob) return;
    const url = URL.createObjectURL(convertedPdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted-images.pdf';
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
  
  const renderContent = () => {
    if (done) {
        return (
             <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
                 <CheckCircle2 className="h-16 w-16 text-green-500" />
                <h3 className="text-2xl font-bold">Conversion Complete!</h3>
                <p className="text-muted-foreground">Your PDF has been created.</p>
                <div className="flex w-full max-w-sm flex-col gap-2 pt-4">
                    <Button onClick={handleDownload}>
                        <FileDown className="mr-2 h-4 w-4" /> Download PDF
                    </Button>
                    <Button variant="secondary" onClick={resetState}>
                        <RefreshCcw className="mr-2 h-4 w-4" /> Convert More Images
                    </Button>
                </div>
                 <SharePrompt toolName="Images to PDF" />
            </div>
        );
    }

    if (isProcessing) {
        return (
            <div className="flex min-h-[300px] flex-col items-center justify-center space-y-4">
                <CircularProgress progress={progress} />
                <p className="text-center text-sm text-muted-foreground">Converting your images to PDF...</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            {files.length === 0 ? (
                <label
                    htmlFor="image-upload"
                    className={cn('flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 text-center transition-colors', { 'border-primary bg-accent/50': isDragging })}
                    onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragEvents} onDrop={handleDrop}
                >
                    <UploadCloud className="h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">Drag & drop your images here, or click to browse</p>
                    <Input id="image-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" multiple />
                    <Button asChild variant="outline" className="mt-4"><span>Browse Files</span></Button>
                </label>
            ) : (
                <>
                    <label
                        htmlFor="image-upload-additional"
                        className={cn('flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 text-center transition-colors', { 'border-primary bg-accent/50': isDragging })}
                        onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragEvents} onDrop={handleDrop}
                    >
                        <UploadCloud className="h-12 w-12 text-muted-foreground" />
                        <p className="mt-4 text-muted-foreground">Drag & drop more images, or click to browse</p>
                        <Input id="image-upload-additional" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" multiple />
                    </label>

                    <div className="space-y-4">
                        <h3 className="font-semibold">Selected Images ({files.length}):</h3>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                            {files.map((file, index) => (
                                <div key={index} className="relative group">
                                    <div className="w-full h-auto rounded-md object-cover aspect-square border p-2 flex items-center justify-center">
                                      {getFileIcon(file)}
                                    </div>
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => handleRemoveFile(index)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <p className="text-xs truncate mt-1 text-muted-foreground">{file.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {files.length > 0 && (
                <Button onClick={handleConvertToPdf} className="w-full" size="lg" disabled={isProcessing}>
                    Convert to PDF
                </Button>
            )}
        </div>
    );
  };
  
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="text-center">
            <CardTitle className="text-3xl font-bold tracking-tight lg:text-4xl">Convert Images to PDF Online</CardTitle>
            <CardDescription className="text-base mt-2">
              Combine multiple JPG, PNG, and other images into a single PDF document.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>About the Images to PDF Converter</CardTitle>
          <CardDescription>
            Learn how to easily compile your images into a portable, shareable PDF file.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Accordion type="single" collapsible defaultValue="item-1">
            <AccordionItem value="item-1">
              <AccordionTrigger>Why Convert Images to PDF?</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <p>
                  Converting a collection of images into a single PDF is an excellent way to organize, share, and archive them. It's perfect for creating photo albums, portfolios, reports with embedded images, or simply sending a batch of pictures in one convenient file. A PDF ensures that your images are viewed in the order you intend and maintains a consistent look across all devices.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>How to Use the Converter</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <ol className="list-decimal list-inside space-y-2">
                  <li><strong>Upload Your Images:</strong> Drag and drop multiple image files (like JPG, PNG, etc.) into the upload area, or click to browse and select them from your device.</li>
                  <li><strong>Add More (Optional):</strong> You can add more images to the queue by dragging them or browsing again.</li>
                  <li><strong>Arrange Images (Soon):</strong> In a future update, you'll be able to drag and drop the uploaded image previews to reorder them before conversion. For now, they are added to the PDF in the order of upload.</li>
                  <li><strong>Convert:</strong> Click the "Convert to PDF" button to start the process.</li>
                  <li><strong>Download:</strong> Your browser will automatically download the new, combined PDF file.</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Tips and Privacy</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Privacy First:</strong> All conversion happens directly in your browser. Your images are never uploaded to a server, ensuring your data remains completely private.</li>
                  <li><strong>Supported Formats:</strong> The tool works best with standard web formats like JPG and PNG.</li>
                  <li><strong>Page Size:</strong> Each page in the resulting PDF will be sized to match the dimensions of the corresponding image.</li>
                  <li><strong>Start Over:</strong> Use the "Convert More Images" button on the success screen to easily start a new conversion without refreshing the page.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
