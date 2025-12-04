
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UploadCloud, X, CheckCircle2, FileDown, RefreshCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CircularProgress } from '@/components/ui/circular-progress';
import { SharePrompt } from '@/components/ui/share-prompt';
import { RelatedTools } from '@/components/ui/related-tools';

type OutputFormat = 'jpeg' | 'png' | 'webp';

async function convertImage(
  file: File,
  outputFormat: OutputFormat
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
        `image/${outputFormat}`
      );
    };
    img.onerror = (err) => {
      reject(err);
    };
  });
}

export default function ImageFormatConverterClientPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('png');
  const [convertedImageUrl, setConvertedImageUrl] = useState<string | null>(
    null
  );
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [converted, setConverted] = useState(false);
  const [convertedSize, setConvertedSize] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setConverted(false);
    setConvertedImageUrl(null);
    setProgress(0);
    setIsConverting(false);
    setConvertedSize(null);
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
    setConverted(false);
    setConvertedImageUrl(null);
    setProgress(0);
    setConvertedSize(null);
  };

  const handleRemoveFile = () => {
    resetState();
  };

  const handleConvert = async () => {
    if (!file) return;

    setIsConverting(true);
    setProgress(0);
    setConverted(false);

    let convertedBlob: Blob | null = null;
    let conversionError: Error | null = null;
    
    const conversionPromise = convertImage(file, outputFormat)
        .then(blob => { convertedBlob = blob; })
        .catch(error => {
            conversionError = error instanceof Error ? error : new Error('An unknown error occurred during conversion.');
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

    await Promise.all([conversionPromise, new Promise(resolve => setTimeout(resolve, minDuration))]);

    setIsConverting(false);

    if (conversionError) {
      toast({
        title: 'Conversion Error',
        description: conversionError.message,
        variant: 'destructive',
      });
    } else if (convertedBlob) {
      setConvertedImageUrl(URL.createObjectURL(convertedBlob));
      setConvertedSize(convertedBlob.size);
      setConverted(true);
    }
  };

  const handleDownload = () => {
    if (!convertedImageUrl || !file) return;

    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = convertedImageUrl;
    const baseName = file.name.substring(0, file.name.lastIndexOf('.'));
    a.download = `${baseName}.${outputFormat}`;
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

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="text-center">
            <CardTitle className="text-3xl font-bold tracking-tight lg:text-4xl">Image Format Converter</CardTitle>
            <CardDescription className="text-base mt-2">
              Convert your image to JPG, PNG, or WEBP instantly.
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
                    src={convertedImageUrl ?? preview}
                    alt={
                      converted
                        ? 'Converted image preview'
                        : 'Original image preview'
                    }
                    className="max-h-[400px] w-full rounded-lg object-contain"
                  />
                )}
                {!converted && !isConverting && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={handleRemoveFile}
                    disabled={isConverting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                <div className="absolute bottom-2 left-2 rounded-md bg-black/50 px-2 py-1 text-xs text-white">
                  {converted ? 'Converted Preview' : 'Original'}
                </div>
              </div>
              <div className="flex flex-col space-y-6">
                {!converted && !isConverting && (
                  <>
                    <div>
                      <h3 className="mb-2 font-semibold">File Information</h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>Name: {file?.name}</p>
                        <p>Original Size: {formatFileSize(file?.size)}</p>
                      </div>
                    </div>
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="output-format">Output Format</Label>
                        <Select
                          value={outputFormat}
                          onValueChange={(v) =>
                            setOutputFormat(v as OutputFormat)
                          }
                        >
                          <SelectTrigger id="output-format">
                            <SelectValue placeholder="Select format" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="png">PNG</SelectItem>
                            <SelectItem value="jpeg">JPEG</SelectItem>
                            <SelectItem value="webp">WEBP</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-4">
                        <Button
                          onClick={handleConvert}
                          className="w-full"
                          disabled={isConverting}
                        >
                          Convert Image
                        </Button>
                      </div>
                    </>
                  </>
                )}

                {isConverting && !converted && (
                  <div className="flex h-full flex-col items-center justify-center space-y-4">
                    <CircularProgress progress={progress} />
                    <p className="text-center text-sm text-muted-foreground">
                      Converting...
                    </p>
                  </div>
                )}

                {converted && convertedSize !== null && (
                  <div className="flex h-full flex-col items-start justify-center space-y-4">
                    <div className="w-full text-center space-y-2">
                        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
                        <h3 className="text-2xl font-bold">
                        Conversion Complete
                        </h3>
                        <p className="text-muted-foreground">
                        Your image has been converted to {outputFormat.toUpperCase()}.
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
                        New Size:{' '}
                        <span className="font-medium text-foreground">
                          {formatFileSize(convertedSize)}
                        </span>
                      </p>
                    </div>
                    <div className="flex w-full flex-col gap-2 pt-4">
                      <Button className="w-full" onClick={handleDownload}>
                        <FileDown className="mr-2 h-4 w-4" />
                        Download Image
                      </Button>
                      <Button
                        className="w-full"
                        variant="secondary"
                        onClick={resetState}
                      >
                         <RefreshCcw className="mr-2 h-4 w-4" />
                        Convert another
                      </Button>
                    </div>
                     <SharePrompt toolName="Image Format Converter" />
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>About the Image Format Converter</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm md:prose-base max-w-none text-muted-foreground space-y-4">
          <p>
            This tool allows you to convert your images to different file formats. Each format has its own strengths, and choosing the right one can impact image quality, file size, and features like transparency.
          </p>
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>Which Image Format Should I Choose?</AccordionTrigger>
              <AccordionContent className="space-y-4 text-muted-foreground">
                <div>
                  <h4 className="font-semibold text-foreground">PNG (Portable Network Graphics)</h4>
                  <p>Best for graphics with sharp lines, text, or transparency (e.g., logos, icons). It uses lossless compression, which means no quality is lost, but file sizes can be larger than JPEGs.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">JPEG (Joint Photographic Experts Group)</h4>
                  <p>Ideal for photographs and complex images with many colors and gradients. It uses lossy compression to achieve smaller file sizes, which is great for web use, but can lose some quality.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">WEBP (WebP)</h4>
                  <p>A modern format developed by Google. WEBP offers both lossy and lossless compression, often providing smaller file sizes than both JPEG and PNG at similar quality levels. It's excellent for web performance but may not be supported by very old browsers.</p>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Privacy and Security</AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground">
                  Your privacy is protected. All image conversions happen directly in your browser, and your files are never uploaded to our servers.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
      <RelatedTools toolPath="/image-format-converter" />
    </div>
  );
}
