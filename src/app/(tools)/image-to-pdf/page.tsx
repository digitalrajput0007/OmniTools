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
import { FileDown, UploadCloud, X } from 'lucide-react';

export default function ImageToPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type.startsWith('image/')) {
        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
      } else {
        alert('Please select an image file.');
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
  };

  const handleConvertToPdf = () => {
    if (!file || !preview) return;

    setIsConverting(true);
    const img = new Image();
    img.src = preview;
    img.onload = () => {
      // Create a new jsPDF instance.
      // The orientation is determined by the image aspect ratio.
      const orientation = img.width > img.height ? 'l' : 'p';
      const pdf = new jsPDF(orientation, 'px', [img.width, img.height]);

      // Add the image to the PDF.
      pdf.addImage(img, 'PNG', 0, 0, img.width, img.height);
      
      // Generate and download the PDF.
      pdf.save(`${file.name.replace(/\.[^/.]+$/, '')}.pdf`);
      setIsConverting(false);
    };
    img.onerror = () => {
      alert('Failed to load image for PDF conversion.');
      setIsConverting(false);
    }
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
                <Button
                  onClick={handleConvertToPdf}
                  disabled={isConverting}
                  className="w-full"
                >
                  {isConverting ? (
                    'Converting...'
                  ) : (
                    <>
                      <FileDown className="mr-2 h-4 w-4" />
                      Convert & Download PDF
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
