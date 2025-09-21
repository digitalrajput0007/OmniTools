
'use client';

import { useState } from 'react';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const signatureFonts = {
    'font-sans': 'Sans Serif',
    'font-serif': 'Serif',
    'font-mono': 'Monospaced',
    'font-dancing-script': 'Dancing Script',
    'font-great-vibes': 'Great Vibes',
}

type SignatureFont = keyof typeof signatureFonts;

const colorOptions = {
    black: { name: 'Black', rgb: { r: 0, g: 0, b: 0 } },
    blue: { name: 'Blue', rgb: { r: 0, g: 0, b: 1 } },
    red: { name: 'Red', rgb: { r: 1, g: 0, b: 0 } },
    grey: { name: 'Grey', rgb: { r: 0.5, g: 0.5, b: 0.5 } },
} as const;

type ColorName = keyof typeof colorOptions;
type Position = 'center' | 'tiled';
type WatermarkMode = 'text' | 'image';

export default function WatermarkPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<WatermarkMode>('text');
  
  // Text options
  const [text, setText] = useState('CONFIDENTIAL');
  const [fontStyle, setFontStyle] = useState<SignatureFont>('font-sans');
  const [fontSize, setFontSize] = useState(50);
  const [fontColor, setFontColor] = useState<ColorName>('grey');
  const [rotation, setRotation] = useState([-45]);
  const [position, setPosition] = useState<Position>('center');

  // Image options
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Common options
  const [opacity, setOpacity] = useState([0.3]);
  
  // UI State
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [processedFile, setProcessedFile] = useState<Blob | null>(null);
  
  const { toast } = useToast();

  const resetState = () => {
    setFile(null);
    setMode('text');
    setText('CONFIDENTIAL');
    setFontStyle('font-sans');
    setFontSize(50);
    setFontColor('grey');
    setRotation([-45]);
    setPosition('center');
    setImageFile(null);
    setImagePreview(null);
    setOpacity([0.3]);
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

    let processError: Error | null = null;
    let newPdfBytes: Uint8Array | null = null;

    const processPromise = (async () => {
      try {
        const pdfDoc = await PDFDocument.load(await file.arrayBuffer());
        
        let watermarkImage;
        if (mode === 'image' && imageFile) {
           const imageBytes = await imageFile.arrayBuffer();
           watermarkImage = imageFile.type === 'image/png' 
             ? await pdfDoc.embedPng(imageBytes) 
             : await pdfDoc.embedJpg(imageBytes);
        }
        
        const fontMap = {
            'font-sans': StandardFonts.Helvetica,
            'font-serif': StandardFonts.TimesRoman,
            'font-mono': StandardFonts.Courier,
        };
        const font = await pdfDoc.embedFont(fontMap[fontStyle as keyof typeof fontMap] || StandardFonts.Helvetica);

        for (const page of pdfDoc.getPages()) {
          const { width, height } = page.getSize();
          
          if (mode === 'text') {
              if (position === 'center') {
                 page.drawText(text, {
                    x: width / 2 - (text.length * fontSize / 4),
                    y: height / 2 - fontSize / 2,
                    font,
                    size: fontSize,
                    color: colorOptions[fontColor].rgb,
                    opacity: opacity[0],
                    rotate: degrees(rotation[0]),
                });
              } else { // Tiled
                  for (let x = -width; x < width * 2; x += text.length * fontSize/2.5) {
                      for (let y = -height; y < height * 2; y += fontSize * 2) {
                           page.drawText(text, {
                            x, y, font, size: fontSize,
                            color: colorOptions[fontColor].rgb,
                            opacity: opacity[0],
                            rotate: degrees(rotation[0]),
                        });
                      }
                  }
              }
          } else if (watermarkImage) {
            const imgWidth = watermarkImage.width;
            const imgHeight = watermarkImage.height;
             if(position === 'center') {
                page.drawImage(watermarkImage, {
                    x: width / 2 - imgWidth / 2,
                    y: height / 2 - imgHeight / 2,
                    width: imgWidth,
                    height: imgHeight,
                    opacity: opacity[0],
                });
             } else {
                 for (let x = 0; x < width; x += imgWidth + 50) {
                     for (let y = 0; y < height; y += imgHeight + 50) {
                         page.drawImage(watermarkImage, { x, y, width: imgWidth, height: imgHeight, opacity: opacity[0] });
                     }
                 }
             }
          }
        }
        newPdfBytes = await pdfDoc.save();
      } catch (error) {
        processError = error instanceof Error ? error : new Error('An unknown error occurred.');
      }
    })();
    
    const minDuration = 3000;
    const startTime = Date.now();
    
    const progressInterval = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      setProgress(Math.min((elapsedTime / minDuration) * 100, 100));
    }, 50);
    
    await Promise.all([processPromise, new Promise(resolve => setTimeout(resolve, minDuration))]);
    clearInterval(progressInterval);
    setIsProcessing(false);
    
    if (processError) {
      toast({ title: 'Error Applying Watermark', description: processError.message, variant: 'destructive'});
      resetState();
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
    if (!file) {
       return (
        <label htmlFor="pdf-upload" className={cn('flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 text-center transition-colors', { 'border-primary bg-accent/50': isDragging })} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragEvents} onDrop={handleDrop}>
            <UploadCloud className="h-12 w-12 text-muted-foreground" /><p className="mt-4 text-muted-foreground">Drag & drop your PDF here, or click to browse</p><Input id="pdf-upload" type="file" className="sr-only" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} accept="application/pdf" /><Button asChild variant="outline" className="mt-4"><span>Browse File</span></Button>
        </label>
      );
    }
    
    if (done) {
        return (
            <div className="grid gap-6 md:grid-cols-2">
                <div className="relative flex flex-col items-center justify-center space-y-4 rounded-md border p-8">
                    <FileIcon className="h-24 w-24 text-primary" />
                    <p className="truncate text-lg font-medium">{file.name}</p>
                </div>
                <div className="flex flex-col items-center justify-center space-y-6 text-center">
                    <CheckCircle2 className="h-16 w-16 text-green-500" />
                    <h3 className="text-2xl font-bold">Watermark Applied!</h3>
                    <div className="flex w-full max-w-sm flex-col gap-2 pt-4">
                        <Button onClick={handleDownload}><FileDown className="mr-2"/>Download PDF</Button>
                        <Button variant="secondary" onClick={resetState}><RefreshCcw className="mr-2"/>Start Over</Button>
                    </div>
                    <SharePrompt toolName="Watermark PDF" />
                </div>
            </div>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <div className="relative flex flex-col items-center justify-center space-y-4 rounded-md border p-8">
                <FileIcon className="h-24 w-24 text-muted-foreground" />
                <p className="truncate text-lg font-medium">{file.name}</p>
                <Button variant="destructive" size="icon" className="absolute right-2 top-2" onClick={resetState}><X className="h-4 w-4" /></Button>
            </div>
             <div className="flex flex-col space-y-6 justify-center">
                {isProcessing ? (
                     <div className="flex h-full flex-col items-center justify-center space-y-4">
                        <CircularProgress progress={progress} />
                        <p className="text-sm text-muted-foreground">Applying watermark...</p>
                    </div>
                ) : (
                <>
                  <Tabs value={mode} onValueChange={(v) => setMode(v as WatermarkMode)} className="w-full">
                    <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="text">Text Watermark</TabsTrigger><TabsTrigger value="image">Image Watermark</TabsTrigger></TabsList>
                    <TabsContent value="text" className="pt-4 space-y-4">
                      <Label htmlFor="watermark-text">Watermark Text</Label>
                      <Input id="watermark-text" value={text} onChange={(e) => setText(e.target.value)} />
                       <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Font Style</Label><Select value={fontStyle} onValueChange={(v) => setFontStyle(v as SignatureFont)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{Object.entries(signatureFonts).map(([id, name]) => <SelectItem key={id} value={id}>{name}</SelectItem>)}</SelectContent></Select></div>
                            <div className="space-y-2"><Label>Font Size</Label><Input type="number" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value, 10))}/></div>
                       </div>
                       <div className="space-y-2"><Label>Color</Label><RadioGroup value={fontColor} onValueChange={(v) => setFontColor(v as ColorName)} className="flex gap-4">{Object.entries(colorOptions).map(([key, {name}]) => <RadioGroupItem key={key} value={key} id={`c-${key}`}/>)}</RadioGroup></div>
                    </TabsContent>
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
                        <Label>Position</Label>
                        <RadioGroup value={position} onValueChange={(v) => setPosition(v as Position)} className="grid grid-cols-2 gap-4">
                            <div><RadioGroupItem value="center" id="pos-center" className="peer sr-only"/><Label htmlFor="pos-center" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary">Center</Label></div>
                            <div><RadioGroupItem value="tiled" id="pos-tiled" className="peer sr-only"/><Label htmlFor="pos-tiled" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary">Tiled</Label></div>
                        </RadioGroup>
                   </div>
                   <div className="space-y-2">
                        <Label htmlFor="rotation">Rotation: {rotation[0]}°</Label>
                        <Slider id="rotation" value={rotation} onValueChange={setRotation} min={-90} max={90} step={5} />
                    </div>
                  <div className="space-y-2">
                    <Label htmlFor="opacity">Opacity: {Math.round(opacity[0] * 100)}%</Label>
                    <Slider id="opacity" value={opacity} onValueChange={setOpacity} max={1} step={0.05} />
                  </div>
                  <Button onClick={handleApplyWatermark} size="lg" className="w-full">Apply Watermark</Button>
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
             <CardTitle className="text-3xl font-bold tracking-tight lg:text-4xl">Watermark PDF</CardTitle>
             <CardDescription className="text-base mt-2">Add a text or image watermark to your PDF.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>{renderContent()}</CardContent>
      </Card>
      <Card>
        <CardHeader>
            <CardTitle>About Watermarking PDFs</CardTitle>
            <CardDescription>Learn how to protect and brand your documents.</CardDescription>
        </CardHeader>
        <CardContent>
            <Accordion type="single" collapsible defaultValue="item-1">
                <AccordionItem value="item-1">
                    <AccordionTrigger>What is a Watermark?</AccordionTrigger>
                    <AccordionContent className="space-y-2 text-muted-foreground">
                        <p>A watermark is a semi-transparent text or image placed over a document to identify ownership, mark its status (e.g., "Confidential," "Draft"), or prevent unauthorized use. It's a common way to protect intellectual property and brand documents before sharing them.</p>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger>How to Use the Watermark Tool</AccordionTrigger>
                    <AccordionContent className="space-y-2 text-muted-foreground">
                        <ol className="list-decimal list-inside space-y-2">
                            <li><strong>Upload Your PDF:</strong> Drag and drop your PDF file or click to browse and select it.</li>
                            <li><strong>Choose Watermark Type:</strong> Select either "Text" or "Image" mode.</li>
                            <li><strong>Configure Your Watermark:</strong>
                                <ul className="list-disc list-inside pl-4 mt-1">
                                    <li>For text, enter your desired text and customize the font, size, color, rotation, and position.</li>
                                    <li>For an image, upload your logo or image file.</li>
                                </ul>
                            </li>
                            <li><strong>Adjust Opacity:</strong> Use the slider to control how transparent the watermark is.</li>
                            <li><strong>Apply & Download:</strong> Click "Apply Watermark". After processing, your new, watermarked PDF will be ready for download.</li>
                        </ol>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                    <AccordionTrigger>Tips for Effective Watermarking</AccordionTrigger>
                    <AccordionContent className="space-y-2 text-muted-foreground">
                        <ul className="list-disc list-inside space-y-2">
                            <li><strong>Subtlety is Key:</strong> A good watermark is visible enough to serve its purpose but not so distracting that it makes the document hard to read. Use a lower opacity (10-30%) for best results.</li>
                            <li><strong>Tiled vs. Center:</strong> A single "Center" watermark is great for marking a document's status. "Tiled" watermarks provide more comprehensive protection against screenshots or copying by covering the entire page.</li>
                            <li><strong>Use PNG for Images:</strong> When using an image watermark, a PNG with a transparent background often looks more professional than a JPG with a solid background.</li>
                            <li><strong>Client-Side Privacy:</strong> The entire watermarking process happens in your browser. Your PDF is never sent to a server, ensuring your data remains private.</li>
                        </ul>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
