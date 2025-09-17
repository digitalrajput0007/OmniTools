'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { UploadCloud, X, Download, Scissors, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import ReactCrop, {
  type Crop,
  centerCrop,
  makeAspectCrop,
} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

// Function to get the cropped image
function getCroppedImg(
  image: HTMLImageElement,
  crop: Crop,
  fileName: string
): Promise<File> {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return Promise.reject(new Error('Failed to get canvas context'));
  }

  const pixelRatio = window.devicePixelRatio;
  canvas.width = crop.width * pixelRatio;
  canvas.height = crop.height * pixelRatio;
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        const file = new File([blob], fileName, { type: blob.type });
        resolve(file);
      },
      'image/png',
      1
    );
  });
}

export default function ImageResizerCropperPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [width, setWidth] = useState<number | string>('');
  const [height, setHeight] = useState<number | string>('');
  const [aspectLock, setAspectLock] = useState(true);
  const [originalAspectRatio, setOriginalAspectRatio] = useState(1);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const { toast } = useToast();

  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();

  const resetState = () => {
    setFile(null);
    setPreview(null);
    setWidth('');
    setHeight('');
    setAspectLock(true);
    setCrop(undefined);
    setCompletedCrop(undefined);
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
    setFile(selectedFile);
    const reader = new FileReader();
    reader.addEventListener('load', () => setPreview(reader.result as string));
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

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    imgRef.current = e.currentTarget;
    const { width, height } = e.currentTarget;
    setOriginalAspectRatio(width / height);
    setWidth(width);
    setHeight(height);

    const initialCrop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        width / height,
        width,
        height
      ),
      width,
      height
    );
    setCrop(initialCrop);
  };

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWidth = e.target.value === '' ? '' : Number(e.target.value);
    setWidth(newWidth);
    if (aspectLock && newWidth !== '' && originalAspectRatio) {
      setHeight(Math.round(newWidth / originalAspectRatio));
    }
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHeight = e.target.value === '' ? '' : Number(e.target.value);
    setHeight(newHeight);
    if (aspectLock && newHeight !== '' && originalAspectRatio) {
      setWidth(Math.round(newHeight * originalAspectRatio));
    }
  };

  const handleApplyResize = () => {
    if (!preview || !imgRef.current) return;
    const canvas = document.createElement('canvas');
    const w = Number(width);
    const h = Number(height);
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(imgRef.current, 0, 0, w, h);
    const dataUrl = canvas.toDataURL(file?.type);
    setPreview(dataUrl);
    toast({
      title: 'Resize Applied',
      description: 'The image has been resized. You can now crop or download it.',
    });
  };

  const handleDownload = async () => {
    if (!completedCrop || !imgRef.current || !file) {
      toast({
        title: 'Cannot Download',
        description:
          'Please make sure you have an image and a crop selection.',
        variant: 'destructive',
      });
      return;
    }
    try {
      const croppedFile = await getCroppedImg(
        imgRef.current,
        completedCrop,
        file.name
      );
      const url = URL.createObjectURL(croppedFile);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resized-${file.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      toast({
        title: 'Crop Failed',
        description: 'An error occurred while cropping the image.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Image Resizer & Cropper</CardTitle>
          <CardDescription>
            Resize and crop your images with ease.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!preview ? (
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
            <div className="grid gap-8 md:grid-cols-2">
              <div className="relative">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={aspectLock ? originalAspectRatio : undefined}
                >
                  <img
                    src={preview}
                    alt="Image preview"
                    onLoad={onImageLoad}
                    ref={imgRef}
                    className="max-h-[60vh] w-full object-contain"
                  />
                </ReactCrop>
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute right-2 top-2 z-10"
                  onClick={resetState}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-col space-y-6">
                <div>
                  <h3 className="mb-4 text-lg font-semibold">
                    Resize
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="width">Width (px)</Label>
                      <Input
                        id="width"
                        type="number"
                        value={width}
                        onChange={handleWidthChange}
                        placeholder="e.g., 1920"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="height">Height (px)</Label>
                      <Input
                        id="height"
                        type="number"
                        value={height}
                        onChange={handleHeightChange}
                        placeholder="e.g., 1080"
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center space-x-2">
                    <Switch
                      id="aspect-lock"
                      checked={aspectLock}
                      onCheckedChange={setAspectLock}
                    />
                    <Label htmlFor="aspect-lock">Lock aspect ratio</Label>
                  </div>
                   <Button onClick={handleApplyResize} className="mt-4 w-full">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Apply Resize
                  </Button>
                </div>

                <div className="border-t pt-6">
                  <h3 className="mb-4 text-lg font-semibold">
                    Crop & Download
                  </h3>
                   <p className="text-sm text-muted-foreground mb-4">
                    Adjust the selection on the image to crop it. The final download will be based on this selection.
                  </p>
                  <Button onClick={handleDownload} className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download Cropped Image
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
