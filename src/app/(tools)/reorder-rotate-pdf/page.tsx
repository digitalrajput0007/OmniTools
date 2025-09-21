
'use client';

import { useState, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
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
  File as FileIcon,
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

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PagePreview {
  id: number;
  src: string;
  rotation: number;
}

export default function ReorderRotatePdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previews, setPreviews] = useState<PagePreview[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  
  const dragItem = React.useRef<number | null>(null);
  const dragOverItem = React.useRef<number | null>(null);

  const resetState = () => {
    setFile(null);
    setPreviews([]);
    setIsProcessing(false);
    setProgress(0);
    setDone(false);
    setIsDownloading(false);
  };

  const handleFileSelect = async (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      toast({ title: 'Invalid File Type', variant: 'destructive' });
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
      setIsDownloading(true);
      
      try {
          const existingPdfBytes = await file.arrayBuffer();
          const pdfDoc = await PDFDocument.load(existingPdfBytes);
          const newPdfDoc = await PDFDocument.create();

          const pageIndices = previews.map(p => p.id - 1);
          const copiedPages = await newPdfDoc.copyPages(pdfDoc, pageIndices);

          previews.forEach((p, i) => {
              const newPage = newPdfDoc.addPage(copiedPages[i]);
              newPage.setRotation(p.rotation);
          });
          
          const pdfBytes = await newPdfDoc.save();
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `edited-${file.name}`;
          document.body.appendChild(a);
          a.click();
          URL.revokeObjectURL(url);
          document.body.removeChild(a);
          setDone(true);
      } catch (error) {
          toast({ title: "Error Saving PDF", variant: 'destructive' });
      } finally {
          setIsDownloading(false);
      }
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
    
    if (done) {
         return (
             <div className="flex flex-col items-center justify-center space-y-6 text-center">
                 <CheckCircle2 className="h-16 w-16 text-green-500" />
                <h3 className="text-2xl font-bold">PDF Saved Successfully!</h3>
                <p className="text-muted-foreground">Your reordered and rotated PDF has been downloaded.</p>
                <div className="flex w-full max-w-sm flex-col gap-2 pt-4">
                    <Button onClick={handleSaveChanges} disabled={isDownloading}>
                        <FileDown className="mr-2 h-4 w-4" /> Download Again
                    </Button>
                    <Button variant="secondary" onClick={resetState}>
                        <RefreshCcw className="mr-2 h-4 w-4" /> Edit Another PDF
                    </Button>
                </div>
                 <SharePrompt toolName="Reorder/Rotate PDF" />
            </div>
        );
    }

    if (previews.length > 0) {
      return (
          <div className="space-y-6">
              <p className="text-center text-muted-foreground">Drag and drop pages to reorder them. Use the button to rotate.</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                  {previews.map((p, index) => (
                      <div 
                        key={p.id} 
                        className="relative group border rounded-lg p-2 flex flex-col items-center gap-2 cursor-grab active:cursor-grabbing"
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnter={(e) => handleDragEnterDiv(e, index)}
                        onDragEnd={handleDropDiv}
                        onDragOver={(e) => e.preventDefault()}
                      >
                          <Image src={p.src} alt={`Page ${p.id}`} width={100} height={141} className="w-full h-auto object-contain shadow-md" style={{ transform: `rotate(${p.rotation}deg)`}}/>
                          <span className="text-xs font-bold">{index + 1}</span>
                          <Button size="icon" variant="outline" className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => handleRotate(index)}>
                              <RotateCw className="h-4 w-4"/>
                          </Button>
                      </div>
                  ))}
              </div>
               <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button onClick={handleSaveChanges} disabled={isDownloading} size="lg">
                    {isDownloading ? "Saving..." : "Save Changes"}
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
    </div>
  );
}
