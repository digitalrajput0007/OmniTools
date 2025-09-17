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
import { Progress } from '@/components/ui/progress';
import { FileDown, RefreshCcw, UploadCloud, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ImageCompressorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [compressedPreview, setCompressedPreview] = useState<string | null>(
    null
  );
  const [targetSize, setTargetSize] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [compressed, setCompressed] = useState(false);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setCompressed(false);
      setCompressedPreview(null);
      setProgress(0);
      setIsCompressing(false);
      setCompressedSize(null);
      setTargetSize(String(Math.round(selectedFile.size / 1024 / 2))); // Default to 50%
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    setCompressed(false);
    setCompressedPreview(null);
    setProgress(0);
    setCompressedSize(null);
    setTargetSize('');
  };

  const compressImage = (
    file: File,
    targetSizeKB: number,
    onProgress: (p: number) => void
  ): Promise<{ compressedBlob: Blob; finalSizeKB: number }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return reject(new Error('Could not get canvas context.'));
          }

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          let low = 0;
          let high = 1;
          let quality = 0.9;
          let bestBlob: Blob | null = null;
          const maxAttempts = 10;
          let attempts = 0;

          const search = () => {
            attempts++;
            onProgress((attempts / maxAttempts) * 90); // Update progress

            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  return reject(new Error('Canvas to Blob conversion failed.'));
                }

                const currentSizeKB = blob.size / 1024;
                bestBlob = blob;

                if (
                  attempts >= maxAttempts ||
                  Math.abs(currentSizeKB - targetSizeKB) < 10
                ) {
                  // Within 10KB tolerance or max attempts reached
                  resolve({
                    compressedBlob: bestBlob,
                    finalSizeKB: bestBlob.size / 1024,
                  });
                  return;
                }

                if (currentSizeKB > targetSizeKB) {
                  high = quality;
                } else {
                  low = quality;
                }
                quality = (low + high) / 2;
                search();
              },
              file.type,
              quality
            );
          };

          search();
        };
        img.onerror = () => {
          reject(new Error('Image failed to load.'));
        };
      };
      reader.onerror = () => {
        reject(new Error('File could not be read.'));
      };
    });
  };

  const handleCompress = async () => {
    if (!file || !targetSize || isCompressing) return;

    const targetSizeKB = parseFloat(targetSize);
    if (isNaN(targetSizeKB) || targetSizeKB <= 0) {
      toast({
        title: 'Invalid Target Size',
        description: 'Please enter a valid target size in KB.',
        variant: 'destructive',
      });
      return;
    }

    const originalSizeKB = file.size / 1024;
    if (targetSizeKB >= originalSizeKB) {
      toast({
        title: 'Target Too Large',
        description: 'Target size must be smaller than the original size.',
        variant: 'destructive',
      });
      return;
    }

    setIsCompressing(true);
    setCompressed(false);
    setProgress(0);
    setCompressedSize(null);
    setCompressedPreview(null);

    try {
      const { compressedBlob, finalSizeKB } = await compressImage(
        file,
        targetSizeKB,
        setProgress
      );
      setCompressedPreview(URL.createObjectURL(compressedBlob));
      setCompressedSize(finalSizeKB);
      setProgress(100);
      setCompressed(true);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Compression Error',
        description:
          error instanceof Error
            ? error.message
            : 'An unknown error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsCompressing(false);
    }
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
            Upload an image, set a target file size, and download the optimized
            file.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!preview ? (
            <label
              htmlFor="image-upload"
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 text-center"
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
                    src={compressed ? compressedPreview! : preview}
                    alt={
                      compressed
                        ? 'Compressed image preview'
                        : 'Original image preview'
                    }
                    className="max-h-[400px] w-full rounded-lg object-contain"
                  />
                )}
                {!compressed && (
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
                    <div className="space-y-2">
                      <Label htmlFor="target-size">Target Size (KB)</Label>
                      <Input
                        id="target-size"
                        type="number"
                        value={targetSize}
                        onChange={(e) => setTargetSize(e.target.value)}
                        placeholder={`e.g., ${Math.round(
                          (file?.size || 0) / 1024 / 2
                        )}`}
                        disabled={isCompressing}
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter your desired file size in kilobytes.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <Button
                        onClick={handleCompress}
                        className="w-full"
                        disabled={!targetSize || isCompressing}
                      >
                        Compress Image
                      </Button>
                    </div>
                  </>
                )}

                {isCompressing && (
                  <div className="flex h-full flex-col items-center justify-center space-y-4">
                    <Progress value={progress} className="w-full" />
                    <p className="text-center text-sm text-muted-foreground">
                      Compressing...
                    </p>
                  </div>
                )}

                {compressed && !isCompressing && (
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
