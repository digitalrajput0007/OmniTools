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
    <div className="space-y-6">
        <div className="mx-auto max-w-lg space-y-4 text-center">
            <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
            <h2 className="text-3xl font-headline font-bold">Success!</h2>
            <p className="text-muted-foreground">Your image is ready. You can now download it or start over.</p>
        </div>
        <div className="relative mx-auto flex h-80 w-full max-w-lg items-center justify-center overflow-hidden rounded-lg border">
            {result && <Image
            src={result}
            alt="Final result"
            width={500}
            height={500}
            className="h-auto max-h-full w-auto max-w-full object-contain"
            unoptimized
            />}
        </div>
        <div className="mx-auto flex w-full max-w-lg flex-col gap-2 sm:flex-row">
            <Button className="w-full" onClick={handleDownload} disabled={!result}>
            <Download className="mr-2 h-4 w-4" /> Download Image
            </Button>
            <Button
            className="w-full"
            variant="outline"
            onClick={resetState}
            >
            <RefreshCw className="mr-2 h-4 w-4" /> Start Over
            </Button>
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
    </div>
  );
}
