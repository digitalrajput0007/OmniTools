'use client';

import { useState, useRef } from 'react';
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
import {
  UploadCloud,
  X,
  Download,
  CheckCircle2,
  RefreshCw,
  CropIcon,
  Scaling,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import ReactCrop, {
  type Crop,
  centerCrop,
  makeAspectCrop,
} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Progress } from '@/components/ui/progress';

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
        const newFileName = `cropped-${fileName}`;
        const file = new File([blob], newFileName, { type: blob.type });
        resolve(file);
      },
      'image/png',
      1
    );
  });
}

function getResizedImg(
  image: HTMLImageElement,
  width: number,
  height: number,
  fileType: string,
  fileName: string
): Promise<{ url: string; file: File }> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return Promise.reject(new Error('Failed to get canvas context'));
  }
  ctx.drawImage(image, 0, 0, width, height);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        return;
      }
      const newFileName = `resized-${fileName}`;
      const file = new File([blob], newFileName, { type: blob.type });
      const url = URL.createObjectURL(file);
      resolve({ url, file });
    }, fileType);
  });
}

type Step = 'upload' | 'choose' | 'resize' | 'crop' | 'processing' | 'download';

export default function ImageResizerCropperPage() {
  const [file, setFile] = useState<File | null>(null);
  const [downloadableFile, setDownloadableFile] = useState<File | null>(null);
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
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState<Step>('upload');
  const [operation, setOperation] = useState<'resize' | 'crop' | null>(null);

  const resetState = () => {
    setFile(null);
    setDownloadableFile(null);
    setPreview(null);
    setWidth('');
    setHeight('');
    setAspectLock(true);
    setCrop(undefined);
    setCompletedCrop(undefined);
    setProgress(0);
    setStep('upload');
    setOperation(null);
    if(imgRef.current) imgRef.current = null;
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
    reader.addEventListener('load', () => {
      setPreview(reader.result as string);
      setStep('choose');
    });
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
    const img = e.currentTarget;
    imgRef.current = img;
    const { width, height } = img;
    setOriginalAspectRatio(width / height);
    if (step === 'choose') {
      setWidth(width);
      setHeight(height);
    }
  };

  const centerAspectCrop = (
    mediaWidth: number,
    mediaHeight: number,
    aspect: number
  ) => {
    setCrop(
      centerCrop(
        makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
        mediaWidth,
        mediaHeight
      )
    );
  };

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWidth = e.target.value === '' ? '' : Number(e.target.value);
    setWidth(newWidth);
    if (aspectLock && newWidth !== '' && originalAspectRatio) {
      setHeight(Math.round(Number(newWidth) / originalAspectRatio));
    }
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHeight = e.target.value === '' ? '' : Number(e.target.value);
    setHeight(newHeight);
    if (aspectLock && newHeight !== '' && originalAspectRatio) {
      setWidth(Math.round(Number(newHeight) * originalAspectRatio));
    }
  };

  const runWithProgress = async (
    action: () => Promise<void>
  ) => {
    setStep('processing');
    setProgress(0);
    const startTime = Date.now();
    const minDuration = 3000;

    const interval = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const currentProgress = Math.min((elapsedTime / minDuration) * 100, 100);
      setProgress(currentProgress);
      if (currentProgress >= 100) {
        clearInterval(interval);
      }
    }, 50);

    try {
      await action();
    } catch (error) {
      toast({
        title: 'An error occurred',
        description:
          error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
      resetState();
      return;
    }
    
    // Ensure the progress bar runs for the minimum duration
    const elapsedTime = Date.now() - startTime;
    if (elapsedTime < minDuration) {
      await new Promise(resolve => setTimeout(resolve, minDuration - elapsedTime));
    }

    setStep('download');
  };

  const handleApplyResize = async () => {
    if (!imgRef.current || !file) return;
    const w = Number(width);
    const h = Number(height);

    await runWithProgress(async () => {
      const { url, file: resizedFile } = await getResizedImg(
        imgRef.current!,
        w,
        h,
        file.type,
        file.name
      );
      setPreview(url);
      setDownloadableFile(resizedFile);
    });
  };

  const handleApplyCrop = async () => {
    if (!completedCrop || !imgRef.current || !file) return;

    await runWithProgress(async () => {
      const croppedFile = await getCroppedImg(
        imgRef.current!,
        completedCrop,
        file.name
      );
      setPreview(URL.createObjectURL(croppedFile));
      setDownloadableFile(croppedFile);
    });
  };

  const handleDownload = () => {
    if (!preview || !downloadableFile) return;
    const a = document.createElement('a');
    a.href = preview;
    a.download = downloadableFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  const handleStartCrop = () => {
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      centerAspectCrop(width, height, width / height);
    }
    setOperation('crop');
    setStep('crop');
  }

  const handleStartResize = () => {
    setOperation('resize');
    setStep('resize');
  }
  
  const renderContent = () => {
    switch(step) {
      case 'upload':
        return (
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

      case 'choose':
      case 'resize':
      case 'crop':
        return (
          <div className="grid gap-8 md:grid-cols-2">
            <div className="relative">
              {preview && (
                <>
                  {step === 'crop' ? (
                     <ReactCrop
                      crop={crop}
                      onChange={(_, percentCrop) => setCrop(percentCrop)}
                      onComplete={(c) => setCompletedCrop(c)}
                      aspect={aspectLock ? (crop?.width && crop.height ? crop.width/crop.height : undefined) : undefined}
                    >
                      <img src={preview} alt="Image to crop" onLoad={onImageLoad} className="max-h-[60vh] w-full object-contain" />
                    </ReactCrop>
                  ) : (
                     <img src={preview} alt="Image preview" onLoad={onImageLoad} className="max-h-[60vh] w-full object-contain" />
                  )}
                </>
              )}
               <Button variant="destructive" size="icon" className="absolute right-2 top-2 z-10" onClick={resetState}>
                  <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="flex flex-col space-y-6">
              {step === 'choose' && (
                <div className="flex h-full flex-col justify-center space-y-4">
                   <h3 className="mb-4 text-lg font-semibold text-center">
                      Step 1: Choose an Operation
                    </h3>
                  <Button onClick={handleStartResize} className="w-full" size="lg"><Scaling className="mr-2"/> Resize Image</Button>
                  <Button onClick={handleStartCrop} className="w-full" size="lg"><CropIcon className="mr-2"/> Crop Image</Button>
                </div>
              )}
              {step === 'resize' && (
                 <>
                    <div>
                      <h3 className="mb-4 text-lg font-semibold">
                        Step 2: Set New Dimensions
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="width">Width (px)</Label>
                          <Input id="width" type="number" value={width} onChange={handleWidthChange} placeholder="e.g., 1920" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="height">Height (px)</Label>
                          <Input id="height" type="number" value={height} onChange={handleHeightChange} placeholder="e.g., 1080" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center space-x-2">
                        <Switch id="aspect-lock" checked={aspectLock} onCheckedChange={setAspectLock}/>
                        <Label htmlFor="aspect-lock">Lock aspect ratio</Label>
                      </div>
                      <Button onClick={handleApplyResize} className="mt-4 w-full"><RefreshCw className="mr-2 h-4 w-4" /> Apply Resize</Button>
                      <Button onClick={() => setStep('choose')} className="mt-2 w-full" variant="ghost">Back</Button>
                    </div>
                  </>
              )}
              {step === 'crop' && (
                <div className="flex h-full flex-col justify-center space-y-4">
                  <h3 className="text-lg font-semibold">Step 2: Adjust Crop Selection</h3>
                   <div className="mt-4 flex items-center space-x-2">
                      <Switch id="aspect-lock-crop" checked={aspectLock} onCheckedChange={setAspectLock}/>
                      <Label htmlFor="aspect-lock-crop">Lock aspect ratio</Label>
                    </div>
                  <Button onClick={handleApplyCrop} className="w-full" disabled={!completedCrop?.width}><CropIcon className="mr-2 h-4 w-4" /> Apply Crop</Button>
                  <Button onClick={() => setStep('choose')} className="mt-2 w-full" variant="ghost">Back</Button>
                </div>
              )}
            </div>
          </div>
        );

      case 'processing':
        return (
          <div className="flex min-h-[300px] flex-col items-center justify-center space-y-4">
            <Progress value={progress} className="w-full max-w-md" />
            <p className="text-center text-sm text-muted-foreground">{operation === 'resize' ? 'Resizing...' : 'Cropping...'}</p>
          </div>
        );

      case 'download':
        return (
          <div className="grid gap-8 md:grid-cols-2">
            <div className="relative">
              {preview && <img src={preview} alt="Final image" className="max-h-[60vh] w-full rounded-lg object-contain" />}
            </div>
            <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
              <h3 className="text-2xl font-bold">
                {operation === 'resize' ? 'Resize' : 'Crop'} Complete
              </h3>
              <p className="text-muted-foreground">Your image is ready for download.</p>
              <div className="flex w-full flex-col gap-2 pt-4 sm:flex-row">
                <Button className="w-full" onClick={handleDownload}><Download className="mr-2 h-4 w-4" /> Download Image</Button>
                <Button className="w-full" variant="ghost" onClick={resetState}>Start Over</Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Image Resizer & Cropper</CardTitle>
          <CardDescription>Resize or crop your images with ease.</CardDescription>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}
