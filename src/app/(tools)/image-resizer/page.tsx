
'use client';

import type { Metadata } from 'next';
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
import {
  UploadCloud,
  X,
  Download,
  CheckCircle2,
  RefreshCw,
  CropIcon,
  Scaling,
  Undo2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import ReactCrop, {
  type Crop,
  centerCrop,
  makeAspectCrop,
} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CircularProgress } from '@/components/ui/circular-progress';
import { SharePrompt } from '@/components/ui/share-prompt';

export const metadata: Metadata = {
  title: 'Free Image Resizer and Cropper - Resize & Crop Images Online',
  description: 'Easily resize and crop your images online for free. Adjust dimensions, maintain aspect ratio, and crop with a live preview. Perfect for social media and websites.',
  openGraph: {
    title: 'Free Image Resizer and Cropper - Resize & Crop Images Online',
    description: 'Easily resize and crop your images online for free. Adjust dimensions, maintain aspect ratio, and crop with a live preview. Perfect for social media and websites.',
    url: '/image-resizer',
    type: 'website',
  },
};

// Utility to create a file from a data URL
async function dataUrlToFile(
  dataUrl: string,
  fileName: string
): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], fileName, { type: blob.type });
}

function getCroppedImg(
  image: HTMLImageElement,
  crop: Crop,
  fileName: string
): Promise<{ url: string; file: File }> {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return Promise.reject(new Error('Failed to get canvas context'));
  }

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

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const newFileName = `cropped-${fileName}`;
        const file = new File([blob], newFileName, { type: blob.type });
        const url = URL.createObjectURL(file);
        resolve({ url, file });
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
      if (!blob) return;
      const newFileName = `resized-${fileName}`;
      const file = new File([blob], newFileName, { type: blob.type });
      const url = URL.createObjectURL(file);
      resolve({ url, file });
    }, fileType);
  });
}

type Step = 'upload' | 'edit' | 'processing' | 'download';
type EditMode = 'resize' | 'crop';

export default function ImageResizerCropperPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [lastPreview, setLastPreview] = useState<string | null>(null);

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
  const [editMode, setEditMode] = useState<EditMode>('resize');

  const resetState = () => {
    setFile(null);
    setOriginalFile(null);
    setPreview(null);
    setOriginalPreview(null);
    setLastPreview(null);
    setWidth('');
    setHeight('');
    setAspectLock(true);
    setCrop(undefined);
    setCompletedCrop(undefined);
    setProgress(0);
    setStep('upload');
    setEditMode('resize');
    if (imgRef.current) imgRef.current = null;
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
    setOriginalFile(selectedFile);

    const reader = new FileReader();
    reader.addEventListener('load', () => {
      const result = reader.result as string;
      setPreview(result);
      setOriginalPreview(result);
      setStep('edit');
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
    if (width && height && !lastPreview) {
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
  
  useEffect(() => {
    if(editMode === 'crop' && imgRef.current){
      const { width, height } = imgRef.current;
      centerAspectCrop(width, height, aspectLock ? originalAspectRatio : width / height);
    } else {
      setCrop(undefined);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editMode, aspectLock]);

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

  const handleApplyResize = async () => {
    if (!imgRef.current || !file) return;
    const w = Number(width);
    const h = Number(height);
    
    setLastPreview(preview);
    const { url, file: resizedFile } = await getResizedImg(imgRef.current, w, h, file.type, file.name);
    setPreview(url);
    setFile(resizedFile);
    toast({ title: "Resize Applied", description: "The image preview has been updated." });
  };

  const handleApplyCrop = async () => {
    if (!completedCrop || !imgRef.current || !file) return;

    setLastPreview(preview);
    const { url, file: croppedFile } = await getCroppedImg(imgRef.current, completedCrop, file.name);
    setPreview(url);
    setFile(croppedFile);
    toast({ title: "Crop Applied", description: "The image preview has been updated." });
  };
  
  const handleUndo = () => {
    if(!lastPreview || !originalFile) return;

    setPreview(lastPreview);
    dataUrlToFile(lastPreview, originalFile.name).then(setFile);
    setLastPreview(null);
    toast({ title: "Undo Successful", description: "Reverted to the previous image state." });
  };

  const handleFinalize = async () => {
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
        setStep('download');
      }
    }, 50);
  };
  
  const handleDownload = () => {
    if (!preview || !file) return;
    const a = document.createElement('a');
    a.href = preview;
    a.download = file.name;
    document.body.appendChild(a);
a.click();
    document.body.removeChild(a);
  };
  
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

      case 'edit':
        return (
          <div className="grid gap-8 md:grid-cols-2">
            <div className="relative flex items-center justify-center rounded-lg bg-muted/20 p-4">
              {preview && (
                <>
                  {editMode === 'crop' ? (
                     <ReactCrop
                      crop={crop}
                      onChange={(_, percentCrop) => setCrop(percentCrop)}
                      onComplete={(c) => setCompletedCrop(c)}
                      aspect={aspectLock ? originalAspectRatio : undefined}
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
                <Card>
                  <CardHeader>
                    <CardTitle>Edit Image</CardTitle>
                    <CardDescription>Select an edit mode and apply your changes.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <RadioGroup
                      value={editMode}
                      onValueChange={(value) => setEditMode(value as EditMode)}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div>
                        <RadioGroupItem value="resize" id="mode-resize" className="peer sr-only" />
                        <Label
                          htmlFor="mode-resize"
                          className="flex h-full flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <Scaling className="mb-3 h-6 w-6" />
                          Resize
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="crop" id="mode-crop" className="peer sr-only" />
                        <Label
                          htmlFor="mode-crop"
                          className="flex h-full flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <CropIcon className="mb-3 h-6 w-6" />
                          Crop
                        </Label>
                      </div>
                    </RadioGroup>

                    {editMode === 'resize' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="width">Width (px)</Label>
                            <Input id="width" type="number" value={width} onChange={handleWidthChange} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="height">Height (px)</Label>
                            <Input id="height" type="number" value={height} onChange={handleHeightChange} />
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="aspect-lock-resize" checked={aspectLock} onCheckedChange={setAspectLock}/>
                          <Label htmlFor="aspect-lock-resize">Lock aspect ratio</Label>
                        </div>
                        <Button onClick={handleApplyResize} className="w-full"><Scaling className="mr-2 h-4 w-4" /> Apply Resize</Button>
                      </div>
                    )}

                    {editMode === 'crop' && (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Switch id="aspect-lock-crop" checked={aspectLock} onCheckedChange={setAspectLock}/>
                          <Label htmlFor="aspect-lock-crop">Lock aspect ratio</Label>
                        </div>
                        <Button onClick={handleApplyCrop} className="w-full" disabled={!completedCrop?.width}><CropIcon className="mr-2 h-4 w-4" /> Apply Crop</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className='flex-grow' />

                <div className="flex w-full items-center gap-2">
                  <Button onClick={handleFinalize} className="w-full" size="lg">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Finalize & Download
                  </Button>
                  {lastPreview && (
                    <Button onClick={handleUndo} variant="outline" size="lg" className="w-full">
                      <Undo2 className="mr-2 h-4 w-4" />
                      Undo Last Change
                    </Button>
                  )}
                </div>
            </div>
          </div>
        );

      case 'processing':
        return (
          <div className="flex min-h-[300px] flex-col items-center justify-center space-y-4">
            <CircularProgress progress={progress} />
            <p className="text-center text-sm text-muted-foreground">Finalizing your image...</p>
          </div>
        );

      case 'download':
        return (
          <div className="grid gap-8 md:grid-cols-2">
            <div className="relative flex items-center justify-center rounded-lg bg-muted/20 p-4">
              {preview && <img src={preview} alt="Final image" className="max-h-[60vh] w-full rounded-lg object-contain" />}
            </div>
            <div className="flex h-full flex-col items-center justify-center space-y-4">
              <div className="text-center w-full space-y-2">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
                <h3 className="text-2xl font-bold">
                  Image Ready!
                </h3>
                <p className="text-muted-foreground">Your image has been processed and is ready for download.</p>
              </div>
              <div className="flex w-full flex-col gap-2 pt-4">
                <Button className="w-full" onClick={handleDownload}><Download className="mr-2 h-4 w-4" /> Download Image</Button>
                <Button className="w-full" variant="secondary" onClick={resetState}><RefreshCw className="mr-2 h-4 w-4" />Start Over</Button>
              </div>
              <SharePrompt toolName="Image Resizer/Cropper" />
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
          <div className="text-center">
            <CardTitle className="text-3xl font-bold tracking-tight lg:text-4xl">Resize and Crop Images Online</CardTitle>
            <CardDescription className="text-base mt-2">Adjust your image dimensions and crop to perfection with a live preview.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>About the Image Resizer & Cropper</CardTitle>
          <CardDescription>
            Master the art of image resizing and cropping for perfect dimensions every time.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Accordion type="single" collapsible defaultValue="item-1">
            <AccordionItem value="item-1">
              <AccordionTrigger>What are Resizing and Cropping?</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <p>
                  <strong>Resizing</strong> changes the overall dimensions (width and height) of an image, scaling the entire image up or down. This is useful for making an image fit into a specific space, like a profile picture container or a website banner.
                </p>
                <p>
                  <strong>Cropping</strong> involves cutting out a portion of an image to change its composition or aspect ratio. This is useful for focusing on a specific subject, removing unwanted elements, or fitting an image into a different shape (e.g., from landscape to square).
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>How to Use the Resizer & Cropper</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <ol className="list-decimal list-inside space-y-2">
                  <li><strong>Upload Your Image:</strong> Drag and drop your image file or click to browse.</li>
                  <li><strong>Choose an Edit Mode:</strong> Select either "Resize" or "Crop".</li>
                  <li><strong>If Resizing:</strong> Enter your desired width or height in pixels. If "Lock aspect ratio" is on, the other dimension will update automatically. Click "Apply Resize".</li>
                  <li><strong>If Cropping:</strong> Drag the handles on the image preview to select the area you want to keep. You can toggle the aspect ratio lock for freeform or fixed-ratio cropping. Click "Apply Crop".</li>
                  <li><strong>Undo and Iterate:</strong> You can apply multiple resizes and crops. If you make a mistake, the "Undo Last Change" button will revert the last action.</li>
                  <li><strong>Finalize and Download:</strong> Once you're happy with your edits, click "Finalize & Download" to process the image and save it to your device.</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Tips for Perfect Edits</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Lock Aspect Ratio:</strong> Keep the "Lock aspect ratio" switch on when resizing to avoid stretching or distorting your image. Turn it off only when you specifically need to change the proportions.</li>
                  <li><strong>Start Big, Go Small:</strong> For best quality, always start with an image that is larger than your target dimensions. Scaling an image up (making it bigger) will result in a loss of quality and pixelation.</li>
                  <li><strong>Crop for Composition:</strong> Use the crop tool to improve your photo's composition. Apply the "rule of thirds" by placing your subject at the intersections of the grid lines that appear when cropping.</li>
                  <li><strong>Undo is Your Friend:</strong> Don't be afraid to experiment! The undo button lets you easily step back if a resize or crop doesn't look right.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
