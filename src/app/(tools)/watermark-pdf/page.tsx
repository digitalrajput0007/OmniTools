
'use client';

import { useState } from 'react';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FileDown, UploadCloud, X, File as FileIcon, CheckCircle2, RefreshCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { CircularProgress } from '@/components/ui/circular-progress';
import { SharePrompt } from '@/components/ui/share-prompt';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import Image from 'next/image';

type WatermarkMode = 'text' | 'image';

export default function WatermarkPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<WatermarkMode>('text');
  const [text, setText] = useState('CONFIDENTIAL');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [opacity, setOpacity] = useState([0.5]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [processedFile, setProcessedFile] = useState<Blob | null>(null);
  const { toast } = useToast();

  const resetState = () => {
    setFile(null);
    setText('CONFIDENTIAL');
    setImageFile(null);
    setImagePreview(null);
    setOpacity([0.5]);
    setIsProcessing(false);
    setProgress(0);
    setDone(false);
    setProcessedFile(null);
  };
  
  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') { toast({ title: 'Invalid PDF File', variant: 'destructive' }); return; }
    resetState();
    setFile(selectedFile);
  };
  
  const handleImageFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) { toast({ title: 'Invalid Image File', variant: 'destructive' }); return; }
    setImageFile(selectedFile);
    setImagePreview(URL.createObjectURL(selectedFile));
  };
  
  const handleDragEvents = (e: React.DragEvent<HTMLElement>) => { e.preventDefault(); e.stopPropagation(); };
  const handleDragEnter = (e: React.DragEvent<HTMLElement>) => { handleDragEvents(e); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent<HTMLElement>) => { handleDragEvents(e); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    handleDragEvents(e);
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
  };

  const handleApplyWatermark = async () => {
    if (!file || (mode === 'text' && !text) || (mode === 'image' && !imageFile)) {
      toast({ title: 'Missing Information', description: 'Please provide a PDF and watermark content.', variant: 'destructive' });
      return;
    }
    setIsProcessing(true);
    setDone(false);
    setProgress(0);

    const startTime = Date.now();
    const minDuration = 3000;
    
    let processError: Error | null = null;
    let newPdfBytes: Uint8Array | null = null;
    
    const processPromise = (async () => {
      try {
        const pdfDoc = await PDFDocument.load(await file.arrayBuffer());
        const pages = pdfDoc.getPages();
        
        let watermarkImage;
        if (mode === 'image' && imageFile) {
           const imageBytes = await imageFile.arrayBuffer();
           if (imageFile.type === 'image/png') {
              watermarkImage = await pdfDoc.embedPng(imageBytes);
           } else {
              watermarkImage = await pdfDoc.embedJpg(imageBytes);
           }
        }
        
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

        for (const page of pages) {
          const { width, height } = page.getSize();
          
          if (mode === 'text') {
            const textSize = Math.sqrt(width*width + height*height) / 15;
            page.drawText(text, {
              x: width / 2 - (text.length * textSize / 4),
              y: height / 2,
              font,
              size: textSize,
              color: rgb(0.5, 0.5, 0.5),
              opacity: opacity[0],
              rotate: degrees(-45),
            });
          } else if (watermarkImage) {
            const imgWidth = watermarkImage.width / 2;
            const imgHeight = watermarkImage.height / 2;
             page.drawImage(watermarkImage, {
               x: width / 2 - imgWidth / 2,
               y: height / 2 - imgHeight / 2,
               width: imgWidth,
               height: imgHeight,
               opacity: opacity[0],
             });
          }
        }
        newPdfBytes = await pdfDoc.save();
      } catch (error) {
        processError = error instanceof Error ? error : new Error('An unknown error occurred.');
      }
    })();
    
    const progressInterval = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      setProgress(Math.min((elapsedTime / minDuration) * 100, 100));
    }, 50);
    
    await Promise.all([processPromise, new Promise(resolve => setTimeout(resolve, minDuration))]);
    clearInterval(progressInterval);
    setIsProcessing(false);
    
    if (processError) {
      toast({ title: 'Error Applying Watermark', description: processError.message, variant: 'destructive'});
    } else if (newPdfBytes) {
      setDone(true);
      setProcessedFile(new Blob([newPdfBytes], { type: 'application/pdf' }));
    }
  };

  const handleDownload = () => {
    if (!processedFile || !file) return;
    const url = URL.createObjectURL(processedFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = `watermarked-${file.name}`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };
  
  const renderContent = () => {
    if (isProcessing) return <div className="flex min-h-[300px] flex-col items-center justify-center space-y-4"><CircularProgress progress={progress} /><p className="text-sm text-muted-foreground">Applying watermark...</p></div>;
    if (done) return <div className="text-center space-y-4"><CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" /><h3 className="text-2xl font-bold">Watermark Applied!</h3><div className="flex flex-col sm:flex-row gap-2 justify-center"><Button onClick={handleDownload}><FileDown className="mr-2"/>Download PDF</Button><Button variant="secondary" onClick={resetState}><RefreshCcw className="mr-2"/>Start Over</Button></div><SharePrompt toolName="Watermark PDF" /></div>;
    
    if (file) {
      return (
        <div className="mx-auto max-w-lg space-y-6">
          <div className="relative flex flex-col items-center justify-center space-y-4 rounded-md border p-8">
            <FileIcon className="h-16 w-16 text-muted-foreground" />
            <p className="truncate text-sm font-medium">{file.name}</p>
            <Button variant="destructive" size="icon" className="absolute right-2 top-2" onClick={resetState}><X className="h-4 w-4" /></Button>
          </div>
          <Tabs value={mode} onValueChange={(v) => setMode(v as WatermarkMode)} className="w-full">
            <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="text">Text Watermark</TabsTrigger><TabsTrigger value="image">Image Watermark</TabsTrigger></TabsList>
            <TabsContent value="text" className="pt-4 space-y-4"><Label htmlFor="watermark-text">Watermark Text</Label><Input id="watermark-text" value={text} onChange={(e) => setText(e.target.value)} /></TabsContent>
            <TabsContent value="image" className="pt-4 space-y-4">
              <Label>Watermark Image</Label>
              {imagePreview ? (
                <div className="relative w-32 h-32 mx-auto"><Image src={imagePreview} alt="Watermark preview" layout="fill" objectFit="contain" /><Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6" onClick={()=>{setImageFile(null); setImagePreview(null);}}><X className="h-4 w-4"/></Button></div>
              ) : (
                <Input type="file" accept="image/png, image/jpeg" onChange={(e) => e.target.files?.[0] && handleImageFileSelect(e.target.files[0])}/>
              )}
            </TabsContent>
          </Tabs>
          <div className="space-y-2">
            <Label htmlFor="opacity">Opacity: {Math.round(opacity[0] * 100)}%</Label>
            <Slider id="opacity" value={opacity} onValueChange={setOpacity} max={1} step={0.05} />
          </div>
          <Button onClick={handleApplyWatermark} size="lg" className="w-full">Apply Watermark</Button>
        </div>
      );
    }
    
    return (
        <label htmlFor="pdf-upload" className={cn('flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 text-center transition-colors', { 'border-primary bg-accent/50': isDragging })} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragEvents} onDrop={handleDrop}>
            <UploadCloud className="h-12 w-12 text-muted-foreground" /><p className="mt-4 text-muted-foreground">Drag & drop your PDF here, or click to browse</p><Input id="pdf-upload" type="file" className="sr-only" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} accept="application/pdf" /><Button asChild variant="outline" className="mt-4"><span>Browse File</span></Button>
        </label>
    );
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight lg:text-4xl text-center">Watermark PDF</CardTitle>
        </CardHeader>
        <CardContent>{renderContent()}</CardContent>
      </Card>
    </div>
  );
}
