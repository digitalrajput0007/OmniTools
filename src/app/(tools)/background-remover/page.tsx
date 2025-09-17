'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  UploadCloud,
  Download,
  RefreshCw,
  Palette,
  CheckCircle2,
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type Color = { r: number; g: number; b: number };

export default function BackgroundRemoverPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [tolerance, setTolerance] = useState([10]); // Percentage
  const [backgroundColor, setBackgroundColor] = useState<Color>({ r: 255, g: 255, b: 255 });
  const [newBgColor, setNewBgColor] = useState('#ffffff');
  const [useNewBg, setUseNewBg] = useState(false);
  
  const [step, setStep] = useState<'upload' | 'edit' | 'processing' | 'done'>('upload');
  const [progress, setProgress] = useState(0);

  const { toast } = useToast();
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const resetState = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setTolerance([10]);
    setBackgroundColor({ r: 255, g: 255, b: 255 });
    setNewBgColor('#ffffff');
    setUseNewBg(false);
    setStep('upload');
    setProgress(0);
  };

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      toast({
        title: 'Invalid File Type',
        description: 'Please select an image file.',
        variant: 'destructive',
      });
      return;
    }
    resetState();
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
      setStep('edit');
    };
    reader.readAsDataURL(selectedFile);
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
  
  const handleColorPick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imageRef.current) return;

    const canvas = document.createElement('canvas');
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const naturalWidth = imageRef.current.naturalWidth;
    const naturalHeight = imageRef.current.naturalHeight;
    
    canvas.width = naturalWidth;
    canvas.height = naturalHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    
    ctx.drawImage(imageRef.current, 0, 0, naturalWidth, naturalHeight);

    const pixelX = Math.floor(x * (naturalWidth / rect.width));
    const pixelY = Math.floor(y * (naturalHeight / rect.height));

    const pixelData = ctx.getImageData(pixelX, pixelY, 1, 1).data;
    setBackgroundColor({ r: pixelData[0], g: pixelData[1], b: pixelData[2] });
    toast({ title: 'Color Picked', description: `New background color set to rgb(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]})` });
  };
  
  const hexToRgb = (hex: string): Color | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  useEffect(() => {
    if (step !== 'edit' || !preview || !canvasRef.current) return;

    const image = new window.Image();
    image.src = preview;
    image.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(image, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const toleranceValue = (tolerance[0] / 100) * 255 * 1.732; // Based on distance in RGB cube

      const newRgb = useNewBg ? hexToRgb(newBgColor) : null;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const diff = Math.sqrt(
          Math.pow(r - backgroundColor.r, 2) +
          Math.pow(g - backgroundColor.g, 2) +
          Math.pow(b - backgroundColor.b, 2)
        );

        if (diff < toleranceValue) {
            if (newRgb) {
                data[i] = newRgb.r;
                data[i+1] = newRgb.g;
                data[i+2] = newRgb.b;
                data[i+3] = 255;
            } else {
                data[i + 3] = 0;
            }
        }
      }

      ctx.putImageData(imageData, 0, 0);
      setResult(canvas.toDataURL(useNewBg ? 'image/jpeg' : 'image/png'));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preview, tolerance, backgroundColor, useNewBg, newBgColor, step]);

  const handleApply = () => {
    setStep('processing');
    setProgress(0);
    const startTime = Date.now();
    const duration = 3000;

    const interval = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const p = Math.min((elapsedTime / duration) * 100, 100);
        setProgress(p);

        if (p >= 100) {
            clearInterval(interval);
            setStep('done');
        }
    }, 50);
  };


  const handleDownload = () => {
    if (!result || !file) return;
    const a = document.createElement('a');
    a.href = result;
    const baseName = file.name.substring(0, file.name.lastIndexOf('.'));
    const extension = useNewBg ? 'jpg' : 'png';
    a.download = `${baseName}-bg-removed.${extension}`;
    document.body.appendChild(a);
a.click();
    document.body.removeChild(a);
  };

  const bgColorString = `rgb(${backgroundColor.r}, ${backgroundColor.g}, ${backgroundColor.b})`;

  const renderUploadStep = () => (
     <label
      htmlFor="image-upload"
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 text-center transition-colors',
        { 'border-primary bg-accent/50': isDragging }
      )}
      onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragEvents} onDrop={handleDrop}
    >
      <UploadCloud className="h-12 w-12 text-muted-foreground" />
      <p className="mt-4 text-muted-foreground">Drag & drop your image here, or click to browse</p>
      <Input id="image-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
      <Button asChild variant="outline" className="mt-4"><span>Browse File</span></Button>
    </label>
  );

  const renderEditStep = () => (
     <div className="space-y-6">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="space-y-2">
          <h3 className="text-center font-semibold text-muted-foreground">Original Image</h3>
          <p className="text-center text-xs text-muted-foreground">Click to pick a background color</p>
          <div className="relative mx-auto flex h-64 w-full max-w-sm items-center justify-center overflow-hidden rounded-lg border">
            {preview && <Image
              ref={imageRef}
              src={preview}
              alt="Original image"
              width={400}
              height={400}
              className="h-auto max-h-full w-auto max-w-full cursor-crosshair object-contain"
              onClick={handleColorPick}
            />}
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-center font-semibold text-muted-foreground">Live Preview</h3>
           <p className="text-center text-xs text-muted-foreground">Adjust controls to update</p>
           <div className="relative mx-auto flex h-64 w-full max-w-sm items-center justify-center overflow-hidden rounded-lg border">
            {result ? (
              <Image
                src={result}
                alt="Image with background removed"
                width={400}
                height={400}
                className="h-auto max-h-full w-auto max-w-full object-contain"
                unoptimized
                key={result}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted/20">
                 <p className="text-sm text-muted-foreground">Processing...</p>
              </div>
            )}
             <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>
      </div>
      
      <Card className="mx-auto w-full max-w-2xl">
        <CardContent className="space-y-6 p-6">
           <div className="grid gap-6 sm:grid-cols-2">
             <div className="space-y-4">
               <Label>Color to Remove</Label>
              <div className="flex items-center gap-4 rounded-lg border p-3">
                 <div className="flex flex-1 items-center gap-3">
                   <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border" style={{ backgroundColor: bgColorString }}>
                      <Palette className="h-5 w-5 mix-blend-difference" style={{ color: 'white'}} />
                   </div>
                   <div className="text-sm">
                     <div className="font-medium">Selected</div>
                     <div className="text-muted-foreground">{bgColorString}</div>
                   </div>
                 </div>
              </div>
            </div>
            <div className="space-y-4">
              <Label htmlFor="tolerance">Tolerance: {tolerance[0]}%</Label>
              <Slider
                id="tolerance"
                min={0}
                max={100}
                step={1}
                value={tolerance}
                onValueChange={setTolerance}
              />
            </div>
          </div>
           <div className="space-y-4 rounded-lg border p-4">
                <div className='flex items-center justify-between'>
                    <Label htmlFor="new-bg-switch">Replace background with color</Label>
                    <Switch id="new-bg-switch" checked={useNewBg} onCheckedChange={setUseNewBg} />
                </div>
                 <div className={cn("flex items-center gap-4 transition-opacity", { "opacity-50 pointer-events-none": !useNewBg })}>
                    <Label htmlFor="new-bg-color" className="text-sm">New Color</Label>
                    <Input id="new-bg-color" type="color" value={newBgColor} onChange={(e) => setNewBgColor(e.target.value)} className="h-10 w-16 p-1" disabled={!useNewBg}/>
                </div>
            </div>
          <Button className="w-full" onClick={handleApply}>Apply Changes</Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderProcessingStep = () => (
    <div className="flex min-h-[300px] flex-col items-center justify-center space-y-4">
        <h2 className='text-2xl font-headline font-semibold'>Applying Changes...</h2>
        <Progress value={progress} className="w-full max-w-md" />
        <p className="text-center text-sm text-muted-foreground">Please wait while we process your image.</p>
    </div>
  );

  const renderDoneStep = () => (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="relative flex items-center justify-center overflow-hidden rounded-lg border bg-muted/20 p-4">
        {result && (
          <Image
            src={result}
            alt="Final result"
            width={500}
            height={500}
            className="h-auto max-h-full w-auto max-w-full object-contain"
            unoptimized
          />
        )}
      </div>

      <div className="flex h-full flex-col items-center justify-center space-y-6 text-center">
        <CheckCircle2 className="h-16 w-16 text-green-500" />
        <div className="space-y-2">
          <h2 className="text-3xl font-headline font-bold">Success!</h2>
          <p className="text-muted-foreground">
            Your image is ready to be downloaded.
          </p>
        </div>
        <div className="w-full space-y-1 rounded-lg border p-4 text-left text-sm">
           <h4 className='font-medium'>File Information</h4>
           <p className='text-muted-foreground'>Name: {file?.name}</p>
           <p className='text-muted-foreground'>Original Size: {file ? (file.size / 1024).toFixed(2) : 0} KB</p>
        </div>
        <div className="flex w-full flex-col gap-2 pt-4 sm:flex-row">
          <Button className="w-full" onClick={handleDownload} disabled={!result}>
            <Download className="mr-2 h-4 w-4" /> Download Image
          </Button>
          <Button className="w-full" variant="outline" onClick={resetState}>
            <RefreshCw className="mr-2 h-4 w-4" /> Start Over
          </Button>
        </div>
      </div>
    </div>
  );


  const renderContent = () => {
    switch (step) {
      case 'upload':
        return renderUploadStep();
      case 'edit':
        return renderEditStep();
      case 'processing':
        return renderProcessingStep();
      case 'done':
        return renderDoneStep();
      default:
        return renderUploadStep();
    }
  }


  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Background Remover</CardTitle>
          <CardDescription>
            Upload an image, pick a color, adjust tolerance, and optionally apply a new background.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>About the Background Remover</CardTitle>
          <CardDescription>
            Learn how this tool can help you isolate subjects and create stunning graphics.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Accordion type="single" collapsible defaultValue="item-1">
            <AccordionItem value="item-1">
              <AccordionTrigger>What is Background Removal?</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <p>
                  Background removal is the process of isolating the main subject of an image by erasing its background. This tool uses a color-based approach, often called "chroma keying," which is perfect for images with a solid or mostly uniform background color (like a product shot against a white wall or a person in front of a green screen).
                </p>
                <p>
                  By making the background transparent, you can easily place your subject onto any other background, create professional-looking product photos, or design clean graphics for web and print.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>How to Use the Background Remover</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <ol className="list-decimal list-inside space-y-2">
                  <li><strong>Upload Your Image:</strong> Drag and drop an image or click to browse. Images with a clean, solid-color background work best.</li>
                  <li><strong>Pick the Background Color:</strong> Click anywhere on the background of the original image. The tool will select that color as the one to remove.</li>
                  <li><strong>Adjust Tolerance:</strong> Use the "Tolerance" slider to fine-tune the removal. A higher tolerance will remove a wider range of similar colors, which can help with shadows and gradients but may also remove parts of your subject if they are too similar to the background.</li>
                  <li><strong>(Optional) Replace Background:</strong> Toggle the "Replace background with color" switch and select a new color if you want to replace the background instead of making it transparent.</li>
                  <li><strong>Apply & Download:</strong> Click "Apply Changes" to process the image. Once you're satisfied with the result, click "Download Image" to save it as a transparent PNG or a JPEG with the new background.</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Tips for Best Results</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Use High-Contrast Images:</strong> The tool works best when the subject is clearly distinct from the background. An image of a blue shirt against a blue wall will be difficult to process.</li>
                  <li><strong>Start with Low Tolerance:</strong> Begin with a low tolerance value and gradually increase it. This helps you remove the background without accidentally erasing parts of your subject.</li>
                  <li><strong>Lighting is Key:</strong> Even, consistent lighting on your background will make color-picking more accurate and lead to a cleaner result.</li>
                  <li><strong>Transparent vs. Replaced:</strong> If you plan to use the image on various backgrounds, download it as a transparent PNG. If you just need a solid color background, using the replacement option is quick and easy.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
