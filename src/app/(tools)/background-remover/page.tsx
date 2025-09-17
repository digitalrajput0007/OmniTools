'use client';

import { useState } from 'react';
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
import { removeBackground } from '@/ai/flows/remove-background-flow';
import { UploadCloud, Wand2, X, Download, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function BackgroundRemoverPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const resetState = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setIsProcessing(false);
    setIsDone(false);
    setError(null);
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

  const handleRemoveBackground = async () => {
    if (!preview) return;

    setIsProcessing(true);
    setIsDone(false);
    setResult(null);
    setError(null);

    try {
      const resultData = await removeBackground({ photoDataUri: preview });
      setResult(resultData.imageWithBackgroundRemoved);
      setIsDone(true);
    } catch (error) {
      console.error(error);
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred.';
      
      if (errorMessage.includes('REMOVE_BG_API_KEY')) {
        setError('The remove.bg API key is not configured. Please add it to your .env file and restart the server.');
      } else if (errorMessage.includes('402')) {
        setError('You have exceeded your free credits for the remove.bg API. Please check your account on their website.');
      } else {
        setError('Failed to remove background. The API may be overloaded or the image format is not supported. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

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

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">AI Background Remover</CardTitle>
          <CardDescription>
            Upload an image and let our AI automatically remove the background for
            you.
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
            <div>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-center font-semibold text-muted-foreground">Original Image</h3>
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg border">
                    <Image
                      src={preview}
                      alt="Original image"
                      fill
                      className="object-contain"
                    />
                     <Button
                        variant="destructive"
                        size="icon"
                        className="absolute right-2 top-2 z-10"
                        onClick={resetState}
                        disabled={isProcessing}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-center font-semibold text-muted-foreground">Result</h3>
                   <div className="relative aspect-square w-full overflow-hidden rounded-lg border">
                    {isProcessing ? (
                       <div className="flex h-full w-full flex-col items-center justify-center space-y-4 bg-muted/20">
                         <Wand2 className="h-10 w-10 animate-pulse text-primary" />
                         <p className="text-sm text-muted-foreground">Removing background...</p>
                         <Skeleton className='absolute h-full w-full' />
                       </div>
                    ) : result ? (
                      <Image
                        src={result}
                        alt="Image with background removed"
                        fill
                        className="object-contain"
                      />
                    ) : error ? (
                       <div className="flex h-full w-full flex-col items-center justify-center bg-destructive/10 p-4 text-center">
                          <AlertTriangle className="h-10 w-10 text-destructive" />
                           <p className="mt-4 text-sm text-destructive">{error}</p>
                       </div>
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center bg-muted/20 p-4 text-center">
                        <Wand2 className="h-10 w-10 text-muted-foreground" />
                        <p className="mt-4 text-sm text-muted-foreground">
                          Your image with the background removed will appear here.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {!isDone && !error && (
                <div className="mt-6 flex justify-center">
                  <Button
                    onClick={handleRemoveBackground}
                    disabled={isProcessing}
                    size="lg"
                  >
                    <Wand2 className="mr-2 h-5 w-5" />
                    {isProcessing
                      ? 'Processing...'
                      : 'Remove Background'}
                  </Button>
                </div>
              )}

              {isDone && result && (
                <Card className="mt-8 bg-muted/30">
                  <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                    <CheckCircle2 className="h-12 w-12 text-green-500" />
                    <h3 className="mt-4 text-xl font-bold">
                      Background Removed!
                    </h3>
                    <p className="mt-2 text-muted-foreground">
                      Your new image is ready for download.
                    </p>
                    <div className="mt-6 flex w-full max-w-sm flex-col gap-2 sm:flex-row">
                      <Button className="w-full" onClick={handleDownload}>
                        <Download className="mr-2 h-4 w-4" /> Download Image
                      </Button>
                      <Button
                        className="w-full"
                        variant="ghost"
                        onClick={resetState}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" /> Start Over
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

               {error && (
                 <div className="mt-6 flex justify-center">
                    <Button
                        variant="outline"
                        onClick={resetState}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" /> Try Again
                      </Button>
                 </div>
                )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
