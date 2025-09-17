'use client';

import { useState } from 'react';
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
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { FileDown, RefreshCcw, UploadCloud, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Helper function to compress image on the client
async function compressImage(
  file: File,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Failed to get canvas context'));
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas to Blob conversion failed'));
          }
        },
        'image/jpeg',
        quality / 100
      );
    };
    img.onerror = (err) => {
      reject(err);
    };
  });
}


export default function ImageCompressorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [compressedPreview, setCompressedPreview] = useState<string | null>(
    null
  );
  const [compressionLevel, setCompressionLevel] = useState([50]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [compressed, setCompressed] = useState(false);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setCompressed(false);
    setCompressedPreview(null);
    setProgress(0);
    setIsCompressing(false);
    setCompressedSize(null);
    setCompressionLevel([50]);
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
       if (e.dataTransfer.files[0].type.startsWith('image/')) {
        handleFileSelect(e.dataTransfer.files[0]);
      } else {
        toast({
          title: 'Invalid File Type',
          description: 'Please drop an image file.',
          variant: 'destructive',
        });
      }
    }
  };


  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    setCompressed(false);
    setCompressedPreview(null);
    setProgress(0);
    setCompressedSize(null);
    setCompressionLevel([50]);
  };

  const handleCompress = async () => {
    if (!file) return;

    setIsCompressing(true);
    setProgress(0);

    const startTime = Date.now();
    const minDuration = 3000;

    let compressedBlob: Blob | null = null;
    let compressionError: Error | null = null;
    
    try {
      compressedBlob = await compressImage(file, compressionLevel[0]);
    } catch (error) {
       compressionError = error instanceof Error ? error : new Error('An unknown error occurred during compression.');
    }
    
    const progressInterval = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const currentProgress = Math.min((elapsedTime / minDuration) * 100, 100);
        setProgress(currentProgress);

        if (currentProgress >= 100) {
            clearInterval(progressInterval);

            if (compressionError) {
              toast({
                  title: 'Compression Error',
                  description: compressionError.message,
                  variant: 'destructive',
              });
            } else if (compressedBlob) {
                const finalSizeKB = compressedBlob.size / 1024;
                setCompressedPreview(URL.createObjectURL(compressedBlob));
                setCompressedSize(finalSizeKB);
                setCompressed(true);
            }
            
            setIsCompressing(false);
        }
    }, 50);
  };
  
  const handleGoBack = () => {
    setCompressed(false);
    setCompressedPreview(null);
    setProgress(0);
    setCompressedSize(null);
  };

  const handleDownload = () => {
    if (!compressedPreview || !file) return;

    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = compressedPreview;
    const name = file.name;
    const ext = name.substring(name.lastIndexOf('.'));
    const baseName = name.substring(0, name.lastIndexOf('.'));
    a.download = `${baseName}-compressed${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const originalSizeInKB = file ? (file.size / 1024).toFixed(2) : '0';

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Image Compressor</CardTitle>
          <CardDescription>
            Upload an image, adjust the compression level, and download the optimized
            file.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!preview ? (
            <label
              htmlFor="image-upload"
              className={cn("flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 text-center transition-colors", {
                "bg-accent/50 border-primary": isDragging
              })}
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
            <div className="grid gap-6 md:grid-cols-2">
              <div className="relative">
                {preview && (
                  <img
                    src={compressed && compressedPreview ? compressedPreview : preview}
                    alt={
                      compressed
                        ? 'Compressed image preview'
                        : 'Original image preview'
                    }
                    className="max-h-[400px] w-full rounded-lg object-contain"
                  />
                )}
                {!compressed && !isCompressing && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={handleRemoveFile}
                    disabled={isCompressing}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                <div className="absolute bottom-2 left-2 rounded-md bg-black/50 px-2 py-1 text-xs text-white">
                  {compressed ? 'Compressed Preview' : 'Original'}
                </div>
              </div>
              <div className="flex flex-col space-y-6">
                <div>
                  <h3 className="mb-2 font-semibold">File Information</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>Name: {file?.name}</p>
                    <p>Original Size: {originalSizeInKB} KB</p>
                    {compressedSize !== null && (
                      <p className="font-medium text-foreground">
                        Compressed Size: {compressedSize.toFixed(2)} KB
                      </p>
                    )}
                  </div>
                </div>
                {!compressed && !isCompressing && (
                  <>
                    <div className="space-y-4">
                      <Label htmlFor="compression-level">
                        Compression Level: {compressionLevel[0]}%
                      </Label>
                      <Slider
                        id="compression-level"
                        min={0}
                        max={100}
                        step={1}
                        value={compressionLevel}
                        onValueChange={setCompressionLevel}
                        disabled={isCompressing}
                      />
                      <p className="text-xs text-muted-foreground">
                        Lower percentage means smaller file size but lower
                        quality.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <Button
                        onClick={handleCompress}
                        className="w-full"
                        disabled={isCompressing}
                      >
                        Compress Image
                      </Button>
                    </div>
                  </>
                )}

                {isCompressing && !compressed && (
                  <div className="flex h-full flex-col items-center justify-center space-y-4">
                    <Progress value={progress} className="w-full" />
                    <p className="text-center text-sm text-muted-foreground">
                      Compressing...
                    </p>
                  </div>
                )}

                {compressed && (
                  <div className="flex h-full flex-col justify-center space-y-4">
                    <div className="space-y-2 text-center">
                      <p className="font-semibold text-green-600">
                        Compression Complete!
                      </p>
                      <Button
                        className="w-full"
                        variant="secondary"
                        onClick={handleDownload}
                      >
                        <FileDown className="mr-2 h-4 w-4" />
                        Download Compressed Image
                      </Button>
                      <Button
                        onClick={handleGoBack}
                        className="w-full"
                        variant="outline"
                      >
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Go Back & Re-compress
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
