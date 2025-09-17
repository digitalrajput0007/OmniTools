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
import { UploadCloud, Download, RefreshCw, Palette } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

type Color = { r: number; g: number; b: number };

export default function BackgroundRemoverPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [tolerance, setTolerance] = useState([10]); // Percentage
  const [backgroundColor, setBackgroundColor] = useState<Color>({ r: 255, g: 255, b: 255 });
  const { toast } = useToast();
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const resetState = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setTolerance([10]);
    setBackgroundColor({ r: 255, g: 255, b: 255 });
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
  };

  useEffect(() => {
    if (!preview || !canvasRef.current) return;

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
      const toleranceValue = (tolerance[0] / 100) * 255;

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
          data[i + 3] = 0;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      setResult(canvas.toDataURL('image/png'));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preview, tolerance, backgroundColor]);

  const handleDownload = () => {
    if (!result || !file) return;
    const a = document.createElement('a');
    a.href = result;
    const baseName = file.name.substring(0, file.name.lastIndexOf('.'));
    a.download = `${baseName}-no-bg.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const bgColorString = `rgb(${backgroundColor.r}, ${backgroundColor.g}, ${backgroundColor.b})`;

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Background Remover</CardTitle>
          <CardDescription>
            Upload an image, pick a color, and adjust the tolerance to remove the background.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!preview ? (
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
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="space-y-2">
                  <h3 className="text-center font-semibold text-muted-foreground">Original Image</h3>
                  <p className="text-center text-xs text-muted-foreground">Click to pick a background color</p>
                  <div className="relative mx-auto max-h-[40vh] w-full max-w-sm overflow-hidden rounded-lg border">
                    <Image
                      ref={imageRef}
                      src={preview}
                      alt="Original image"
                      width={400}
                      height={400}
                      className="h-full w-full cursor-crosshair object-contain"
                      onClick={handleColorPick}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-center font-semibold text-muted-foreground">Result</h3>
                   <p className="text-center text-xs text-muted-foreground">Live preview</p>
                   <div className="relative mx-auto max-h-[40vh] w-full max-w-sm overflow-hidden rounded-lg border">
                    {result ? (
                      <Image
                        src={result}
                        alt="Image with background removed"
                        width={400}
                        height={400}
                        className="h-full w-full object-contain"
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
              
              <Card className="mx-auto w-full max-w-lg">
                <CardContent className="space-y-6 p-6">
                   <div className="space-y-4">
                     <Label>Controls</Label>
                    <div className="flex items-center gap-4 rounded-lg border p-3">
                       <div className="flex flex-1 items-center gap-3">
                         <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border" style={{ backgroundColor: bgColorString }}>
                            <Palette className="h-5 w-5 mix-blend-difference" style={{ color: 'white'}} />
                         </div>
                         <div className="text-sm">
                           <div className="font-medium">Selected Color</div>
                           <div className="text-muted-foreground">{bgColorString}</div>
                         </div>
                       </div>
                       <div className="w-px self-stretch bg-border" />
                       <div className="flex-1">
                          <Label htmlFor="tolerance" className="mb-2 block text-sm font-medium">Tolerance: {tolerance[0]}%</Label>
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
                  </div>
                  <div className="flex w-full flex-col gap-2 sm:flex-row">
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
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
