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
import { Slider } from '@/components/ui/slider';
import { FileDown, UploadCloud, X } from 'lucide-react';

export default function ImageCompressorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [compression, setCompression] = useState(80);
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [compressed, setCompressed] = useState(false);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setCompressed(false);
      setProgress(0);
      setIsCompressing(false);
      setCompressedSize(null);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    setCompressed(false);
    setProgress(0);
    setCompressedSize(null);
  };

  const handleCompress = () => {
    if (!file) return;
    setIsCompressing(true);
    setCompressed(false);
    setProgress(0);
    setCompressedSize(null);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsCompressing(false);
          setCompressed(true);
          const newSize = (file.size * (compression / 100)) / 1024;
          setCompressedSize(newSize);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Image Compressor</CardTitle>
          <CardDescription>
            Upload an image, adjust the compression level, and download the
            optimized file.
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
                    src={preview}
                    alt="Image preview"
                    className="max-h-[400px] w-full rounded-lg object-contain"
                  />
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute right-2 top-2"
                  onClick={handleRemoveFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-col space-y-6">
                <div>
                  <h3 className="mb-2 font-semibold">File Information</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>Name: {file?.name}</p>
                    <p>
                      Original Size:{' '}
                      {file ? (file.size / 1024).toFixed(2) : 0} KB
                    </p>
                    {compressedSize !== null && (
                      <p className="font-medium text-foreground">
                        Compressed Size: {compressedSize.toFixed(2)} KB
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <Label htmlFor="compression">
                    Compression Level: {compression}%
                  </Label>
                  <Slider
                    id="compression"
                    min={10}
                    max={100}
                    step={1}
                    value={[compression]}
                    onValueChange={(value) => setCompression(value[0])}
                    disabled={isCompressing || compressed}
                  />
                </div>
                <div className="space-y-4">
                  {!isCompressing && !compressed && (
                    <Button
                      onClick={handleCompress}
                      className="w-full"
                    >
                      Compress Image
                    </Button>
                  )}
                  {isCompressing && (
                    <>
                      <Progress value={progress} className="w-full" />
                      <p className="text-center text-sm text-muted-foreground">
                        Compressing...
                      </p>
                    </>
                  )}
                  {compressed && (
                    <div className="space-y-2 text-center">
                      <p className="font-semibold text-green-600">
                        Compression Complete!
                      </p>
                      <Button
                        className="w-full"
                        variant="secondary"
                        onClick={() => alert('Simulating download...')}
                      >
                        <FileDown className="mr-2 h-4 w-4" />
                        Download Compressed Image
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
