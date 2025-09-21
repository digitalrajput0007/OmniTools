
'use client';

import { useState } from 'react';
import * as pdfjs from 'pdfjs-dist/build/pdf.mjs';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  UploadCloud,
  File as FileIcon,
  CheckCircle2,
  RefreshCcw,
  X,
  Copy
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { CircularProgress } from '@/components/ui/circular-progress';
import { SharePrompt } from '@/components/ui/share-prompt';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

export default function ExtractTextPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const resetState = () => {
    setFile(null);
    setExtractedText('');
    setIsProcessing(false);
    setProgress(0);
    setDone(false);
  };

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      toast({ title: 'Invalid File Type', variant: 'destructive' });
      return;
    }
    resetState();
    setFile(selectedFile);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) handleFileSelect(e.target.files[0]);
  };

  const handleDragEvents = (e: React.DragEvent<HTMLElement>) => { e.preventDefault(); e.stopPropagation(); };
  const handleDragEnter = (e: React.DragEvent<HTMLElement>) => { handleDragEvents(e); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent<HTMLElement>) => { handleDragEvents(e); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    handleDragEvents(e);
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
  };
  
  const handleExtract = async () => {
    if (!file) return;
    setIsProcessing(true);
    setDone(false);
    setProgress(0);
    setExtractedText('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      let fullText = '';

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => ('str' in item ? item.str : '')).join(' ');
        fullText += pageText + '\n\n';
        setProgress(Math.round((i / numPages) * 100));
      }
      setExtractedText(fullText.trim());
      setDone(true);
    } catch (error) {
      toast({ title: 'Extraction Error', description: 'Could not extract text from the PDF.', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const copyToClipboard = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText).then(() => {
      toast({ title: 'Text Copied!', description: 'The extracted text has been copied to your clipboard.' });
    });
  };

  const renderContent = () => {
    if (isProcessing) {
      return (
        <div className="flex min-h-[300px] flex-col items-center justify-center space-y-4">
          <CircularProgress progress={progress} />
          <p className="text-center text-sm text-muted-foreground">Extracting text from PDF...</p>
        </div>
      );
    }

    if (done) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="extracted-text">Extracted Text</Label>
            <Button variant="ghost" size="sm" onClick={copyToClipboard}><Copy className="mr-2 h-4 w-4" />Copy All</Button>
          </div>
          <Textarea
            id="extracted-text"
            value={extractedText}
            readOnly
            className="min-h-[400px] font-mono"
          />
          <div className="flex flex-col sm:flex-row justify-center gap-2 pt-4">
            <Button onClick={resetState} variant="secondary"><RefreshCcw className="mr-2 h-4 w-4" />Extract from Another PDF</Button>
          </div>
           <div className="flex justify-center pt-4">
              <SharePrompt toolName="Extract Text from PDF" />
           </div>
        </div>
      );
    }

    if (file) {
      return (
        <div className="flex flex-col items-center space-y-6">
          <div className="relative flex flex-col items-center justify-center space-y-4 rounded-md border p-8 w-full max-w-md">
            <FileIcon className="h-16 w-16 text-muted-foreground" />
            <p className="truncate text-sm font-medium">{file.name}</p>
            <Button variant="destructive" size="icon" className="absolute right-2 top-2" onClick={resetState}><X className="h-4 w-4" /></Button>
          </div>
          <Button onClick={handleExtract} size="lg" className="w-full max-w-md">Extract Text</Button>
        </div>
      );
    }

    return (
      <label
          htmlFor="pdf-upload"
          className={cn('flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 text-center transition-colors', { 'border-primary bg-accent/50': isDragging })}
          onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragEvents} onDrop={handleDrop}
      >
        <UploadCloud className="h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">Drag & drop your PDF here, or click to browse</p>
        <Input id="pdf-upload" type="file" className="sr-only" onChange={handleFileChange} accept="application/pdf" />
        <Button asChild variant="outline" className="mt-4"><span>Browse File</span></Button>
      </label>
    );
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="text-center">
            <CardTitle className="text-3xl font-bold tracking-tight lg:text-4xl">Extract Text from PDF</CardTitle>
            <CardDescription className="text-base mt-2">
              Pull all text content from your PDF file, making it easy to copy and edit.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}
