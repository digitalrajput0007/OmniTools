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
import {
  FileDown,
  RefreshCcw,
  UploadCloud,
  X,
  CheckCircle2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CircularProgress } from '@/components/ui/circular-progress';
import { SharePrompt } from '@/components/ui/share-prompt';
import { RelatedTools } from '@/components/ui/related-tools';

// Helper function to compress image on the client
async function compressImage(file: File, quality: number): Promise<Blob> {
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

export default function ImageCompressorClientPage() {
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

  const resetState = () => {
    setFile(null);
    setPreview(null);
    setCompressed(false);
    setCompressedPreview(null);
    setProgress(0);
    setCompressedSize(null);
    setCompressionLevel([50]);
  };

  const handleRemoveFile = () => {
    resetState();
  };

  const handleCompress = async () => {
    if (!file) return;

    setIsCompressing(true);
    setProgress(0);
    setCompressed(false);

    let compressedBlob: Blob | null = null;
    let compressionError: Error | null = null;

    const compressionPromise = compressImage(file, compressionLevel[0])
      .then(blob => { compressedBlob = blob; })
      .catch(error => {
        compressionError = error instanceof Error ? error : new Error('An unknown error occurred during compression.');
      });


    const minDuration = 3000;
    const startTime = Date.now();

    const progressInterval = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const currentProgress = Math.min((elapsedTime / minDuration) * 100, 100);
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(progressInterval);
      }
    }, 50);

    await Promise.all([compressionPromise, new Promise(resolve => setTimeout(resolve, minDuration))]);
    
    setIsCompressing(false);
    if (compressionError) {
      toast({
        title: 'Compression Error',
        description: compressionError.message,
        variant: 'destructive',
      });
      handleGoBack();
    } else if (compressedBlob) {
      setCompressedPreview(URL.createObjectURL(compressedBlob));
      setCompressedSize(compressedBlob.size);
      setCompressed(true);
    }
  };

  const handleGoBack = () => {
    setCompressed(false);
    setCompressedPreview(null);
    setProgress(0);
    setCompressedSize(null);
  };

  const handleCompressAnother = () => {
    resetState();
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

  const formatFileSize = (bytes: number | null | undefined): string => {
    if (!bytes) return '0 KB';
    if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(2) + ' KB';
    } else {
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
  };
  
  const compressionPercentage =
    file && compressedSize
      ? Math.round(((file.size - compressedSize) / file.size) * 100)
      : 0;

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="text-center">
            <CardTitle className="text-3xl font-bold tracking-tight lg:text-4xl">Compress Your Images Instantly</CardTitle>
            <CardDescription className="text-base mt-2">
              Upload an image to reduce its file size with our free image compressor.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {!file ? (
            <label
              htmlFor="image-upload"
              className={cn(
                'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 text-center transition-colors bg-muted/20',
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
            <div className="grid gap-6 md:grid-cols-2">
              <div className="relative">
                {preview && (
                  <img
                    src={
                      compressed && compressedPreview
                        ? compressedPreview
                        : preview
                    }
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
                {!compressed && !isCompressing && (
                  <>
                    <div>
                      <h3 className="mb-2 font-semibold">File Information</h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>Name: {file?.name}</p>
                        <p>Original Size: {formatFileSize(file?.size)}</p>
                      </div>
                    </div>
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
                  </>
                )}

                {isCompressing && !compressed && (
                  <div className="flex h-full flex-col items-center justify-center space-y-4">
                    <CircularProgress progress={progress} />
                    <p className="text-center text-sm text-muted-foreground">
                      Compressing...
                    </p>
                  </div>
                )}

                {compressed && compressedSize !== null && (
                  <div className="flex h-full flex-col items-start justify-center space-y-4">
                    <div className="text-center w-full space-y-2">
                        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
                        <h3 className="text-2xl font-bold">
                        Compression Complete
                        </h3>
                        <p className="text-muted-foreground">
                        Your image has been compressed by {compressionPercentage}
                        %.
                        </p>
                    </div>
                    <div className="w-full text-sm rounded-lg border p-4">
                      <p>
                        Original Size:{' '}
                        <span className="font-medium text-foreground">
                          {formatFileSize(file?.size)}
                        </span>
                      </p>
                      <p>
                        Compressed Size:{' '}
                        <span className="font-medium text-foreground">
                          {formatFileSize(compressedSize)}
                        </span>
                      </p>
                    </div>
                    <div className="flex w-full flex-col gap-2 pt-4">
                      <Button
                        className="w-full"
                        onClick={handleDownload}
                      >
                        <FileDown className="mr-2 h-4 w-4" />
                        Download Image
                      </Button>
                      <Button
                        className="w-full"
                        variant="secondary"
                        onClick={handleCompressAnother}
                      >
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Compress another
                      </Button>
                    </div>
                    <SharePrompt toolName="Image Compressor" />
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>About the Image Compressor</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm md:prose-base max-w-none text-muted-foreground space-y-4">
          <p>
            Our Image Compressor helps you reduce the file size of your images (like JPG, PNG, and WEBP) without sacrificing too much quality. This is essential for speeding up website load times, saving storage space, and making images easier to share.
          </p>
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>How to Use the Image Compressor</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <ol className="list-decimal list-inside space-y-2">
                  <li><strong>Upload Image:</strong> Drag and drop your image or click to browse.</li>
                  <li><strong>Adjust Quality:</strong> Use the slider to choose a compression level. A lower value means a smaller file size but lower quality.
                  </li>
                  <li><strong>Compress:</strong> Click the "Compress Image" button.</li>
                  <li><strong>Download:</strong> Preview the result and download your optimized image.</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Why is Image Compression Important?</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <p>
                  Large image files can significantly slow down your website, leading to a poor user experience and lower search engine rankings. By compressing your images, you make your site faster, which can improve user engagement and SEO. It also saves bandwidth for users on slower internet connections.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
      <RelatedTools toolPath="/image-compressor" />
    </div>
  );
}
