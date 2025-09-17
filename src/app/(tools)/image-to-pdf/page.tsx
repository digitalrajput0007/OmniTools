'use client';

import { useState } from 'react';
import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { FileDown, UploadCloud, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function ImageToPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [converted, setConverted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setConverted(false);
      setProgress(0);
      setIsConverting(false);
    } else {
      toast({
        title: 'Invalid File Type',
        description: 'Please select an image file.',
        variant: 'destructive',
      });
    }
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


  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    setConverted(false);
    setProgress(0);
  };

  const downloadPdf = () => {
    if (!file || !preview) return;
    const img = new Image();
    img.src = preview;
    img.onload = () => {
      const orientation = img.width > img.height ? 'l' : 'p';
      const pdf = new jsPDF(orientation, 'px', [img.width, img.height]);
      pdf.addImage(img, 'PNG', 0, 0, img.width, img.height);
      pdf.save(`${file.name.replace(/\.[^/.]+$/, '')}.pdf`);
    };
    img.onerror = () => {
      toast({
        title: 'Conversion Error',
        description: 'Failed to load image for PDF conversion.',
        variant: 'destructive',
      });
    };
  };

  const handleConvertToPdf = () => {
    if (!file) return;
    setIsConverting(true);
    setConverted(false);
    setProgress(0);
    const startTime = Date.now();
    const minDuration = 3000;

    const interval = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const currentProgress = Math.min((elapsedTime / minDuration) * 100, 100);
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(interval);
        setIsConverting(false);
        setConverted(true);
      }
    }, 50);
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Image to PDF</CardTitle>
          <CardDescription>
            Convert your JPG, PNG, and other images to a PDF document.
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
                  disabled={isConverting}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-col justify-center space-y-6">
                <div>
                  <h3 className="mb-2 font-semibold">File Information</h3>
                  <p className="text-sm text-muted-foreground">
                    Name: {file?.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Size: {file ? (file.size / 1024).toFixed(2) : 0} KB
                  </p>
                </div>

                <div className="space-y-4">
                  {!isConverting && !converted && (
                    <Button onClick={handleConvertToPdf} className="w-full">
                      Convert to PDF
                    </Button>
                  )}
                  {isConverting && (
                    <>
                      <Progress value={progress} className="w-full" />
                      <p className="text-center text-sm text-muted-foreground">
                        Converting...
                      </p>
                    </>
                  )}
                  {converted && (
                    <div className="space-y-2 text-center">
                      <p className="font-semibold text-green-600">
                        Conversion Complete!
                      </p>
                      <Button
                        className="w-full"
                        variant="secondary"
                        onClick={downloadPdf}
                      >
                        <FileDown className="mr-2 h-4 w-4" />
                        Download PDF
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
