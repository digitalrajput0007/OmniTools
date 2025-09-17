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
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { UploadCloud, X, FileText, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { extractText } from './action';

export default function PdfToWordPage() {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const resetState = () => {
    setFile(null);
    setExtractedText('');
    setIsExtracting(false);
    setProgress(0);
    setCopied(false);
  };

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type === 'application/pdf') {
      resetState();
      setFile(selectedFile);
    } else {
      toast({
        title: 'Invalid File Type',
        description: 'Please select a PDF file.',
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
    resetState();
  };

  const handleExtractText = async () => {
    if (!file) return;

    setIsExtracting(true);
    setProgress(0);
    const formData = new FormData();
    formData.append('file', file);

    const minDuration = 3000;
    const startTime = Date.now();

    try {
      const result = await extractText(formData);

      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < minDuration) {
        const remainingTime = minDuration - elapsedTime;
        let progressValue = (elapsedTime / minDuration) * 100;

        const progressInterval = setInterval(() => {
          const elapsedSinceStart = Date.now() - startTime;
          progressValue = (elapsedSinceStart / minDuration) * 100;
          setProgress(Math.min(progressValue, 100));
        }, 50);

        await new Promise(resolve => setTimeout(resolve, remainingTime));
        clearInterval(progressInterval);
      }
      
      setProgress(100);
      setExtractedText(result.text);

      toast({
        title: 'Extraction Successful',
        description: `Extracted ${result.numPages} pages from your PDF.`,
      });

    } catch (error) {
      toast({
        title: 'Extraction Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsExtracting(false);
    }
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">PDF to Word (Text Extractor)</CardTitle>
          <CardDescription>
            Upload a PDF to extract its text content, which you can then copy and paste into Word or any other editor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!file ? (
            <label
              htmlFor="pdf-upload"
              className={cn(
                'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 text-center transition-colors',
                { 'border-primary bg-accent/50': isDragging }
              )}
              onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragEvents} onDrop={handleDrop}
            >
              <UploadCloud className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">Drag & drop your PDF here, or click to browse</p>
              <Input id="pdf-upload" type="file" className="sr-only" onChange={handleFileChange} accept="application/pdf" />
              <Button asChild variant="outline" className="mt-4"><span>Browse File</span></Button>
            </label>
          ) : (
             <div className="space-y-6">
                <div className={cn("rounded-lg border p-6", extractedText && "grid gap-6 md:grid-cols-2")}>
                    <div className="relative flex flex-col items-center justify-center space-y-4">
                        <FileText className="h-16 w-16 text-muted-foreground" />
                        <div className="text-center">
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                        </div>
                         <Button variant="destructive" size="icon" className="absolute right-0 top-0" onClick={handleRemoveFile} disabled={isExtracting}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                     {extractedText && (
                        <div className="relative">
                            <Textarea
                                value={extractedText}
                                readOnly
                                className="h-48 resize-none"
                                placeholder="Extracted text will appear here..."
                            />
                             <Button size="icon" variant="ghost" className="absolute right-2 top-2" onClick={handleCopy} disabled={!extractedText}>
                                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                    )}
                </div>

                {isExtracting ? (
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <Progress value={progress} className="w-full" />
                        <p className="text-center text-sm text-muted-foreground">Extracting text from PDF...</p>
                    </div>
                ) : extractedText ? (
                    <Button onClick={resetState} className="w-full">Start Over</Button>
                ) : (
                    <Button onClick={handleExtractText} className="w-full" disabled={isExtracting}>Extract Text</Button>
                )}
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
