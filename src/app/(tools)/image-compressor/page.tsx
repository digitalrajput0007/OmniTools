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
      const finalSizeKB = compressedBlob.size / 1024;
      setCompressedPreview(URL.createObjectURL(compressedBlob));
      setCompressedSize(finalSizeKB);
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

  const originalSizeInKB = file ? file.size / 1024 : 0;
  const compressionPercentage =
    file && compressedSize
      ? Math.round(((originalSizeInKB - compressedSize) / originalSizeInKB) * 100)
      : 0;

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className='text-2xl'>Image Compressor</CardTitle>
          <CardDescription className="text-base">
            Upload an image, adjust the compression level, and download the
            optimized file.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!file ? (
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
                        <p>Original Size: {originalSizeInKB.toFixed(2)} KB</p>
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
                  <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
                    <CheckCircle2 className="h-16 w-16 text-green-500" />
                    <h3 className="text-2xl font-bold">
                      Compression Complete
                    </h3>
                    <p className="text-muted-foreground">
                      Your image has been compressed by {compressionPercentage}
                      %.
                      <br />
                      Ready to download!
                    </p>
                    <div className="text-sm">
                      <p>
                        Original Size:{' '}
                        <span className="font-medium text-foreground">
                          {originalSizeInKB.toFixed(2)} KB
                        </span>
                      </p>
                      <p>
                        Compressed Size:{' '}
                        <span className="font-medium text-foreground">
                          {compressedSize.toFixed(2)} KB
                        </span>
                      </p>
                    </div>
                    <div className="flex w-full flex-col gap-2 pt-4 sm:flex-row">
                      <Button
                        className="w-full"
                        onClick={handleDownload}
                      >
                        Download Image
                      </Button>
                      <Button
                        className="w-full"
                        variant="secondary"
                        onClick={handleCompressAnother}
                      >
                        Compress another
                      </Button>
                    </div>
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
          <CardDescription>
            Learn more about how to optimize your images for the web and other uses.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Accordion type="single" collapsible defaultValue="item-1">
            <AccordionItem value="item-1">
              <AccordionTrigger>What is Image Compression?</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <p>
                  Image compression is the process of reducing the file size of an image without significantly compromising its quality. This is crucial for web performance, as smaller images load faster, improving user experience and saving bandwidth.
                </p>
                <p>
                  Our tool uses a "lossy" compression technique, which means it intelligently removes some data from the image that is least perceptible to the human eye. This allows for a significant reduction in file size.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>How to Use the Image Compressor</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <ol className="list-decimal list-inside space-y-2">
                  <li><strong>Upload Your Image:</strong> Drag and drop your image file onto the upload area, or click the "Browse File" button to select it from your device.</li>
                  <li><strong>Adjust Compression Level:</strong> Use the slider to set your desired compression level. A lower percentage results in a smaller file size but may reduce quality more noticeably. A higher percentage preserves more quality at the cost of a larger file.</li>
                  <li><strong>Compress:</strong> Click the "Compress Image" button to start the process. Our tool will quickly optimize your image.</li>
                  <li><strong>Download:</strong> Once complete, you'll see a preview of the compressed image along with the new file size. Click the "Download Image" button to save it.</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Tips for Optimal Compression</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Balance is Key:</strong> For websites, a compression level between 40% and 70% usually provides the best balance of quality and file size.</li>
                  <li><strong>Preview the Result:</strong> Always check the preview of the compressed image to ensure you're happy with the quality before downloading.</li>
                  <li><strong>Batch Processing:</strong> If you need to compress multiple images, you can use the "Compress another" button to quickly start over without refreshing the page.</li>
                  <li><strong>Consider the Format:</strong> Our compressor outputs images in JPEG format, which is ideal for photographs. If you have graphics with sharp lines or transparency (like logos), a format like PNG might be better, which you can convert to using our Image Format Converter tool.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}

    