
'use client';

import { useState, useEffect, useRef } from 'react';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FileDown, UploadCloud, X, CheckCircle2, RefreshCcw, Loader2 } from 'lucide-react';
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
import { RelatedTools } from '@/components/ui/related-tools';

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


const signatureFonts = {
    'font-sans': 'Sans Serif',
    'font-serif': 'Serif',
    'font-mono': 'Monospaced',
}

type SignatureFont = keyof typeof signatureFonts;

type Position = 'center' | 'tiled';
type WatermarkMode = 'text' | 'image';

const hexToRgb = (hex: string): {r: number, g: number, b: number} | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return null;
    return {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255,
    };
};

export default function WatermarkPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewDimensions, setPreviewDimensions] = useState<{ width: number, height: number } | null>(null);
  const [mode, setMode] = useState<WatermarkMode>('text');
  
  // Text options
  const [text, setText] = useState('CONFIDENTIAL');
  const [fontStyle, setFontStyle] = useState<SignatureFont>('font-sans');
  const [fontSize, setFontSize] = useState(50);
  const [fontColor, setFontColor] = useState('#808080'); // Grey
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
  const [isLibraryLoaded, setIsLibraryLoaded] = useState(false);
  
  const { toast } = useToast();
  const previewImageRef = useRef<HTMLImageElement>(null);
  
  useEffect(() => {
    import('pdfjs-dist/build/pdf.mjs').then(pdfjsLib => {
      pdfjs = pdfjsLib;
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.mjs',
        import.meta.url
      ).toString();
      setIsLibraryLoaded(true);
    });
  }, []);

  const resetState = () => {
    setFile(null);
    setPreviewUrl(null);
    setPreviewDimensions(null);
    setMode('text');
    setText('CONFIDENTIAL');
    setFontStyle('font-sans');
    setFontSize(50);
    setFontColor('#808080');
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
  
 const handleFileSelect = async (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      toast({ title: 'Invalid PDF File', variant: 'destructive' });
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

    const progressInterval = setInterval(() => {
        setProgress(p => Math.min(p + 5, 95));
    }, 100);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const context = canvas.getContext('2d');
      if (context) {
        await page.render({ canvasContext: context, viewport }).promise;
        setPreviewUrl(canvas.toDataURL());
      }
      setProgress(100);
    } catch (e) {
      toast({ title: 'Error reading PDF', description: 'Could not render a preview for this PDF.', variant: 'destructive' });
      resetState();
    } finally {
      clearInterval(progressInterval);
      setIsProcessing(false);
    }
  };
  
  const handleImageFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) { toast({ title: 'Invalid Image File', variant: 'destructive' }); return; }
    setImageFile(selectedFile);
    setImagePreview(URL.createObjectURL(selectedFile));
  };
  
  const handleDragEvents = (e: React.DragEvent<HTMLElement>) => { e.preventDefault(); e.stopPropagation(); };
  const handleDragEnter = (e: React.DragEvent<HTMLElement>) => { if (!isLibraryLoaded) return; handleDragEvents(e); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent<HTMLElement>) => { handleDragEvents(e); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    if (!isLibraryLoaded) return;
    handleDragEvents(e);
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
  };

  const handleApplyWatermark = async () => {
    if (!file || (mode === 'text' && !text) || (mode === 'image' && !imageFile)) {
      toast({ title: 'Missing Information', description: 'Please provide a PDF and configure the watermark.', variant: 'destructive' });
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
        let watermarkImageDims = { width: 0, height: 0 };
        if (mode === 'image' && imageFile) {
           const imageBytes = await imageFile.arrayBuffer();
           watermarkImage = imageFile.type === 'image/png' 
             ? await pdfDoc.embedPng(imageBytes) 
             : await pdfDoc.embedJpg(imageBytes);
            watermarkImageDims = watermarkImage.scale(1);
        }
        
        const fontMap: Record<SignatureFont, StandardFonts> = {
            'font-sans': StandardFonts.Helvetica,
            'font-serif': StandardFonts.TimesRoman,
            'font-mono': StandardFonts.Courier,
        };
        const font = await pdfDoc.embedFont(fontMap[fontStyle]);
        
        const colorRgb = hexToRgb(fontColor);
        if (!colorRgb) {
            processError = new Error('Invalid color format.');
            return;
        }
        const color = rgb(colorRgb.r, colorRgb.g, colorRgb.b);

        const pages = pdfDoc.getPages();
        for (const page of pages) {
            const { width: pageWidthPt, height: pageHeightPt } = page.getSize();
            
            if (mode === 'text') {
                const textWidthPt = font.widthOfTextAtSize(text, fontSize);
                const textHeightPt = font.heightAtSize(fontSize);
                
                if (position === 'center') {
                     page.drawText(text, {
                        x: pageWidthPt / 2 - textWidthPt / 2 + 10,
                        y: pageHeightPt / 2 - textHeightPt / 4,
                        font,
                        size: fontSize,
                        color,
                        opacity: opacity[0],
                        rotate: degrees(-rotation[0]),
                    });
                } else { // Tiled
                    const tileGap = 150;
                    for (let x = 0; x < pageWidthPt + pageHeightPt; x += (textWidthPt + tileGap)) {
                        for (let y = 0; y < pageHeightPt + pageHeightPt; y += (fontSize + tileGap)) {
                             page.drawText(text, {
                                x: x - pageHeightPt,
                                y: y,
                                font, size: fontSize,
                                color: color,
                                opacity: opacity[0],
                                rotate: degrees(-rotation[0]),
                            });
                        }
                    }
                }
            } else if (watermarkImage) {
                const imgScale = 0.5; 
                const imgWidthPt = watermarkImageDims.width * imgScale;
                const imgHeightPt = watermarkImageDims.height * imgScale;

                if(position === 'center') {
                    page.drawImage(watermarkImage, {
                        x: pageWidthPt / 2 - imgWidthPt / 2 + 10,
                        y: pageHeightPt / 2 - imgHeightPt / 2,
                        width: imgWidthPt,
                        height: imgHeightPt,
                        opacity: opacity[0],
                        rotate: degrees(-rotation[0]),
                    });
                } else {
                    const tileWidthPt = 150;
                    const tileHeightPt = (tileWidthPt / watermarkImageDims.width) * watermarkImageDims.height;
                    const tileGapPt = 50;
                    
                    for (let x = 0; x < pageWidthPt; x += tileWidthPt + tileGapPt) {
                        for (let y = 0; y < pageHeightPt; y += tileHeightPt + tileGapPt) {
                             page.drawImage(watermarkImage, {
                                x, y,
                                width: tileWidthPt,
                                height: tileHeightPt,
                                opacity: opacity[0],
                                rotate: degrees(-rotation[0]),
                            });
                        }
                    }
                }
            }
        }
        newPdfBytes = await pdfDoc.save();
      } catch (error) {
        processError = error instanceof Error ? error : new Error('An unknown error occurred.');
        console.error("Watermark Error:", processError);
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

  const onImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    if (previewImageRef.current) {
        setPreviewDimensions({
            width: img.offsetWidth,
            height: img.offsetHeight,
        });
    }
  };
  
  const renderContent = () => {
    if (!file) {
       return (
        <label htmlFor="pdf-upload" className={cn('flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 text-center transition-colors bg-muted/20', { 'border-primary bg-accent/50': isDragging, 'opacity-50 cursor-not-allowed': !isLibraryLoaded })} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragEvents} onDrop={handleDrop}>
            {isLibraryLoaded ? (
              <>
                <UploadCloud className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">Drag & drop your PDF here, or click to browse</p>
                <Input id="pdf-upload" type="file" className="sr-only" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} accept="application/pdf" disabled={!isLibraryLoaded} />
                <Button asChild variant="outline" className="mt-4" disabled={!isLibraryLoaded}><span>Browse File</span></Button>
              </>
            ) : (
               <>
                <Loader2 className="h-12 w-12 text-muted-foreground animate-spin" />
                <p className="mt-4 text-muted-foreground">Loading PDF library...</p>
               </>
            )}
        </label>
      );
    }
    
    if (done) {
        return (
            <div className="grid gap-6 md:grid-cols-2">
                <div className="relative flex flex-col items-center justify-center space-y-4 rounded-md border p-8">
                    <CheckCircle2 className="h-24 w-24 text-green-500" />
                    <h3 className="text-2xl font-bold">Watermark Applied!</h3>
                </div>
                <div className="flex flex-col items-center justify-center space-y-6 text-center">
                    <div className="flex w-full max-w-sm flex-col gap-2 pt-4">
                        <Button onClick={handleDownload}><FileDown className="mr-2"/>Download PDF</Button>
                        <Button variant="secondary" onClick={resetState}><RefreshCcw className="mr-2"/>Start Over</Button>
                    </div>
                    <SharePrompt toolName="Watermark PDF" />
                </div>
            </div>
        );
    }
    
    if (isProcessing && !previewUrl) {
      return (
        <div className="flex min-h-[300px] flex-col items-center justify-center space-y-4">
          <CircularProgress progress={progress} />
          <p className="text-center text-sm text-muted-foreground">Loading PDF preview...</p>
        </div>
      );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <div className="relative flex flex-col items-center justify-center space-y-4 rounded-md border p-4 bg-muted/20">
                {previewUrl ? (
                    <div className="relative w-full h-full min-h-[400px] overflow-hidden">
                        <Image
                            ref={previewImageRef}
                            src={previewUrl}
                            alt="PDF Preview"
                            layout="fill"
                            objectFit="contain"
                            onLoad={onImageLoad}
                         />
                        
                        {/* Watermark Preview Overlay */}
                        <div className="absolute inset-0 pointer-events-none" style={{ opacity: opacity[0] }}>
                            {position === 'center' ? (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    {mode === 'text' ? (
                                        <p style={{ transform: `rotate(${rotation[0]}deg)`, fontSize: `${fontSize * 0.75}px`, color: fontColor }} className={cn('font-bold whitespace-nowrap', fontStyle)}>
                                            {text}
                                        </p>
                                    ) : imagePreview && (
                                         <div className="relative h-32 w-32" style={{ transform: `rotate(${rotation[0]}deg)`}}>
                                            <Image src={imagePreview} alt="watermark" layout="fill" objectFit="contain" />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // Tiled Preview (simplified)
                                <div className="absolute inset-0 grid grid-cols-3 grid-rows-4 gap-8">
                                    {[...Array(12)].map((_, i) => (
                                        <div key={i} className="flex items-center justify-center opacity-70">
                                            {mode === 'text' ? (
                                                <p style={{ transform: `rotate(${rotation[0]}deg)`, fontSize: `${fontSize * 0.5}px`, color: fontColor, whiteSpace: 'nowrap' }} className={cn('font-bold', fontStyle)}>
                                                    {text}
                                                </p>
                                            ) : imagePreview && (
                                                <div className="relative h-12 w-12" style={{ transform: `rotate(${rotation[0]}deg)`}}>
                                                    <Image src={imagePreview} alt="watermark" layout="fill" objectFit="contain" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <PdfIcon className="h-24 w-24" />
                )}
                 <Button variant="destructive" size="icon" className="absolute right-2 top-2" onClick={resetState}><X className="h-4 w-4" /></Button>
            </div>
             <div className="flex flex-col space-y-4 justify-center">
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
                            <div className="space-y-2"><Label>Font Style</Label><Select value={fontStyle} onValueChange={(v) => setFontStyle(v as SignatureFont)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{Object.entries(signatureFonts).map(([id, name]) => <SelectItem key={id} value={id} className={id}>{name}</SelectItem>)}</SelectContent></Select></div>
                            <div className="space-y-2"><Label>Font Size</Label><Input type="number" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value, 10))}/></div>
                       </div>
                       <div className="space-y-2"><Label>Color</Label><Input type="color" className="p-1 h-10 w-full" value={fontColor} onChange={(e) => setFontColor(e.target.value)} /></div>
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
             <CardTitle className="text-3xl font-bold tracking-tight lg:text-4xl">Add Watermark to PDF</CardTitle>
             <CardDescription className="text-base mt-2">Add a text or image watermark to your PDF documents to protect and brand them.</CardDescription>
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
                            <li><strong>Upload Your PDF:</strong> Drag and drop your PDF file or click to browse and select it. A preview of the first page will be shown.</li>
                            <li><strong>Choose Watermark Type:</strong> Select either "Text" or "Image" mode.</li>
                            <li><strong>Configure Your Watermark:</strong>
                                <ul className="list-disc list-inside pl-4 mt-1">
                                    <li>For text, enter your desired text and customize the font, size, color, rotation, and position.</li>
                                    <li>For an image, upload your logo or image file.</li>
                                </ul>
                            </li>
                            <li><strong>Live Preview:</strong> See how your watermark will look directly on the PDF preview as you make changes.</li>
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
      <RelatedTools toolPath="/watermark-pdf" />
    </div>
  );
}

    