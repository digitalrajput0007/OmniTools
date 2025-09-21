
'use client';

import { useState, useEffect, useRef } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
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
  RotateCw,
  RefreshCcw,
  X,
  CheckCircle2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { CircularProgress } from '@/components/ui/circular-progress';
import { SharePrompt } from '@/components/ui/share-prompt';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


let pdfjs: any;

interface PagePreview {
  id: number;
  src: string;
  rotation: number;
}

const PdfIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" fill="#FADBD8" stroke="#E74C3C" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M14 2V8H20" stroke="#E74C3C" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M8 12H9C10.1046 12 11 12.8954 11 14V18" stroke="#C0392B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 18V12H16" stroke="#C0392B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 15H16" stroke="#C0392B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);


export default function ReorderRotatePdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previews, setPreviews] = useState<PagePreview[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [processedFileBlob, setProcessedFileBlob] = useState<Blob | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

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
    setIsProcessing(false);
    setProgress(0);
    setDone(false);
    setIsSaving(false);
    setProcessedFileBlob(null);
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
    setProgress(0);
    
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      const pagePreviews: PagePreview[] = [];

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
          await page.render({ canvasContext: context, viewport: viewport }).promise;
          pagePreviews.push({
            id: i,
            src: canvas.toDataURL(),
            rotation: page.rotate,
          });
        }
        setProgress(Math.round((i / numPages) * 100));
      }
      setPreviews(pagePreviews);
    } catch (error) {
      toast({ title: 'Error Loading PDF', description: 'Could not render PDF previews.', variant: 'destructive' });
      resetState();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDragEvents = (e: React.DragEvent<HTMLElement>) => { e.preventDefault(); e.stopPropagation(); };
  const handleDragEnter = (e: React.DragEvent<HTMLElement>) => { handleDragEvents(e); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent<HTMLElement>) => { handleDragEvents(e); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    handleDragEvents(e);
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
  };

  const handleRotate = (index: number) => {
    setPreviews(prev => prev.map((p, i) => i === index ? { ...p, rotation: (p.rotation + 90) % 360 } : p));
  };
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    dragItem.current = position;
  };
  
  const handleDragEnterDiv = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    dragOverItem.current = position;
  };

  const handleDropDiv = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    
    const newPreviews = [...previews];
    const dragItemContent = newPreviews.splice(dragItem.current, 1)[0];
    newPreviews.splice(dragOverItem.current, 0, dragItemContent);
    
    dragItem.current = null;
    dragOverItem.current = null;
    setPreviews(newPreviews);
  };
  
  const handleSaveChanges = async () => {
      if (!file) return;
      setIsSaving(true);
      setDone(false);
      setProgress(0);

      let newPdfBlob: Blob | null = null;
      let saveError: Error | null = null;
      const minDuration = 3000;
      const startTime = Date.now();

      const savePromise = (async () => {
        try {
            const existingPdfBytes = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(existingPdfBytes);
            const newPdfDoc = await PDFDocument.create();
            const pageIndices = previews.map(p => p.id - 1);
            const copiedPages = await newPdfDoc.copyPages(pdfDoc, pageIndices);

            copiedPages.forEach((page, index) => {
                const addedPage = newPdfDoc.addPage(page);
                const previewForThisCopiedPage = previews.find((p) => p.id === pageIndices[index] + 1);

                if (previewForThisCopiedPage) {
                    const originalPage = pdfDoc.getPage(pageIndices[index]);
                    const originalRotation = originalPage.getRotation().angle;
                    const additionalRotation = previews[index].rotation;
                    addedPage.setRotation(degrees(originalRotation + additionalRotation));
                }
            });

            const pdfBytes = await newPdfDoc.save();
            newPdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
        } catch (error) {
            saveError = error instanceof Error ? error : new Error('An unknown error occurred.');
            console.error("Save Error:", saveError);
        }
      })();

      const progressInterval = setInterval(() => {
          const elapsedTime = Date.now() - startTime;
          const p = Math.min((elapsedTime / minDuration) * 100, 100);
          setProgress(p);
      }, 50);
      
      await Promise.all([savePromise, new Promise(resolve => setTimeout(resolve, minDuration))]);
      clearInterval(progressInterval);
      
      setIsSaving(false);

      if (saveError) {
          toast({ title: "Error Saving PDF", description: saveError.message, variant: 'destructive' });
      } else if (newPdfBlob) {
          setProcessedFileBlob(newPdfBlob);
          setDone(true);
      }
  };

  const handleDownload = () => {
    if (!processedFileBlob || !file) return;
    const url = URL.createObjectURL(processedFileBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `edited-${file.name}`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };


  const renderContent = () => {
    if (isProcessing) {
      return (
        <div className="flex min-h-[300px] flex-col items-center justify-center space-y-4">
          <CircularProgress progress={progress} />
          <p className="text-center text-sm text-muted-foreground">Loading PDF previews...</p>
        </div>
      );
    }

    if(isSaving) {
        return (
            <div className="flex min-h-[300px] flex-col items-center justify-center space-y-4">
                <CircularProgress progress={progress} />
                <p className="text-center text-sm text-muted-foreground">Saving your changes...</p>
            </div>
        );
    }
    
    if (done) {
         return (
            <div className="grid gap-6 md:grid-cols-2">
                <div className="flex flex-col items-center justify-center space-y-4 rounded-md border p-8">
                    <PdfIcon className="h-24 w-24" />
                    <p className="truncate text-lg font-medium">{file?.name}</p>
                </div>
                 <div className="flex flex-col items-center justify-center space-y-6 text-center">
                    <CheckCircle2 className="h-16 w-16 text-green-500" />
                    <h3 className="text-2xl font-bold">PDF Saved Successfully!</h3>
                    <p className="text-muted-foreground">Your reordered and rotated PDF is ready.</p>
                    <div className="flex w-full max-w-sm flex-col gap-2 pt-4">
                        <Button onClick={handleDownload}>
                            <FileDown className="mr-2 h-4 w-4" /> Download PDF
                        </Button>
                        <Button variant="secondary" onClick={resetState}>
                            <RefreshCcw className="mr-2 h-4 w-4" /> Edit Another PDF
                        </Button>
                    </div>
                     <SharePrompt toolName="Reorder/Rotate PDF" />
                </div>
            </div>
        );
    }

    if (previews.length > 0) {
      return (
          <div className="space-y-6">
              <p className="text-center text-muted-foreground">Drag and drop pages to reorder them. Use the button to rotate.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {previews.map((p, index) => (
                      <div 
                        key={`${p.id}-${index}`} 
                        className="relative group border rounded-lg p-2 flex flex-col items-center gap-2 cursor-grab active:cursor-grabbing"
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnter={(e) => handleDragEnterDiv(e, index)}
                        onDragEnd={handleDropDiv}
                        onDragOver={(e) => e.preventDefault()}
                      >
                          <Image src={p.src} alt={`Page ${index + 1}`} width={100} height={141} className="w-full h-auto object-contain shadow-md" style={{ transform: `rotate(${p.rotation}deg)`}}/>
                          <span className="text-xs font-bold">{index + 1}</span>
                          <Button size="icon" variant="outline" className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => handleRotate(index)}>
                              <RotateCw className="h-4 w-4"/>
                          </Button>
                      </div>
                  ))}
              </div>
               <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button onClick={handleSaveChanges} disabled={isSaving} size="lg">
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button onClick={resetState} variant="outline" size="lg">
                    Start Over
                  </Button>
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
            <CardTitle className="text-3xl font-bold tracking-tight lg:text-4xl">Reorder & Rotate PDF</CardTitle>
            <CardDescription className="text-base mt-2">
              Visually reorder pages and rotate them as needed.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>About the PDF Page Manager</CardTitle>
          <CardDescription>
            Learn how to easily rearrange and orient your PDF pages.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Accordion type="single" collapsible defaultValue="item-1">
            <AccordionItem value="item-1">
              <AccordionTrigger>What is Page Reordering and Rotation?</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <p>
                  This tool gives you full control over the structure of your PDF. <strong>Reordering</strong> lets you change the sequence of pages, perfect for correcting a scanning order or organizing a document. <strong>Rotation</strong> allows you to change the orientation of individual pages, which is ideal for fixing pages that were scanned upside down or sideways.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>How to Use the Tool</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <ol className="list-decimal list-inside space-y-2">
                  <li><strong>Upload Your PDF:</strong> Drag and drop your file or click to browse. The tool will generate a preview for every page.</li>
                  <li><strong>Reorder Pages:</strong> Simply click and drag any page preview to a new position in the sequence.</li>
                  <li><strong>Rotate a Page:</strong> Hover over a page and click the rotate icon (<RotateCw />) in the top-right corner. Each click rotates the page 90 degrees clockwise.</li>
                  <li><strong>Save Changes:</strong> Once your pages are perfectly arranged and oriented, click the "Save Changes" button.</li>
                  <li><strong>Download:</strong> Your new PDF with all the changes applied will be downloaded automatically.</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Tips for Page Management</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Fix Scanning Errors:</strong> This is the perfect tool for correcting documents that were scanned out of order or with incorrect page orientations.</li>
                  <li><strong>Combine with Other Tools:</strong> First, use the "PDF Merger" to combine several documents, then use this tool to arrange all the pages into a final, coherent order.</li>
                  <li><strong>Visual Confirmation:</strong> The live previews ensure you know exactly how your document will look before you save it.</li>
                  <li><strong>Secure and Private:</strong> All page manipulation happens directly in your browser. Your document is never sent to a server, keeping your information secure.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
