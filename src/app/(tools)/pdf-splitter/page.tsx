'use client';

import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
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
import { FileDown, UploadCloud, X, File as FileIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function PdfSplitterPage() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [ranges, setRanges] = useState('');
  const [isSplitting, setIsSplitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [split, setSplit] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setSplit(false);
        setProgress(0);
        setIsSplitting(false);
        setRanges('');
        try {
          const arrayBuffer = await selectedFile.arrayBuffer();
          const pdf = await PDFDocument.load(arrayBuffer);
          setTotalPages(pdf.getPageCount());
        } catch (error) {
          toast({
            title: 'Error Reading PDF',
            description: 'Could not read the selected PDF file.',
            variant: 'destructive',
          });
          setFile(null);
          setTotalPages(0);
        }
      } else {
        toast({
          title: 'Invalid File Type',
          description: 'Please select a PDF file.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setTotalPages(0);
    setSplit(false);
    setProgress(0);
    setRanges('');
  };

  const handleSplit = () => {
    if (!file) return;
    setIsSplitting(true);
    setSplit(false);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSplitting(false);
          setSplit(true);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const downloadSplitPdf = async () => {
    if (!file || !ranges) return;

    try {
      const pageNumbers = new Set<number>();
      const parts = ranges.split(',');
      for (const part of parts) {
        if (part.includes('-')) {
          const [start, end] = part.split('-').map(Number);
          if (
            !isNaN(start) &&
            !isNaN(end) &&
            start <= end &&
            start > 0 &&
            end <= totalPages
          ) {
            for (let i = start; i <= end; i++) {
              pageNumbers.add(i);
            }
          }
        } else {
          const page = Number(part);
          if (!isNaN(page) && page > 0 && page <= totalPages) {
            pageNumbers.add(page);
          }
        }
      }

      if (pageNumbers.size === 0) {
        toast({
          title: 'Invalid Range',
          description: 'Please enter a valid page range to split.',
          variant: 'destructive',
        });
        return;
      }

      const arrayBuffer = await file.arrayBuffer();
      const originalPdf = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();

      const sortedPages = Array.from(pageNumbers).sort((a, b) => a - b);
      const copiedPages = await newPdf.copyPages(
        originalPdf,
        sortedPages.map((p) => p - 1)
      );
      copiedPages.forEach((page) => newPdf.addPage(page));

      const newPdfBytes = await newPdf.save();
      const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `split-${file.name}`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: 'Error Splitting PDF',
        description: 'Could not split the PDF. Please check the page ranges.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">PDF Splitter</CardTitle>
          <CardDescription>
            Extract specific pages or ranges from a PDF file.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!file ? (
            <label
              htmlFor="pdf-upload"
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 text-center"
            >
              <UploadCloud className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">
                Drag & drop your PDF here, or click to browse
              </p>
              <Input
                id="pdf-upload"
                type="file"
                className="sr-only"
                onChange={handleFileChange}
                accept="application/pdf"
              />
              <Button asChild variant="outline" className="mt-4">
                <span>Browse File</span>
              </Button>
            </label>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="relative flex flex-col items-center justify-center space-y-4 rounded-md border p-4">
                <FileIcon className="h-16 w-16 text-muted-foreground" />
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  Total pages: {totalPages}
                </p>
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
                  <Label htmlFor="ranges">Pages to Extract</Label>
                  <Input
                    id="ranges"
                    type="text"
                    value={ranges}
                    onChange={(e) => setRanges(e.target.value)}
                    placeholder="e.g., 1, 3-5, 8"
                    disabled={isSplitting || split}
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Enter page numbers or ranges separated by commas.
                  </p>
                </div>

                <div className="space-y-4">
                  {!isSplitting && !split && (
                    <Button
                      onClick={handleSplit}
                      className="w-full"
                      disabled={!ranges}
                    >
                      Split PDF
                    </Button>
                  )}
                  {isSplitting && (
                    <>
                      <Progress value={progress} className="w-full" />
                      <p className="text-center text-sm text-muted-foreground">
                        Splitting...
                      </p>
                    </>
                  )}
                  {split && (
                    <div className="space-y-2 text-center">
                      <p className="font-semibold text-green-600">
                        Splitting Complete!
                      </p>
                      <Button
                        className="w-full"
                        variant="secondary"
                        onClick={downloadSplitPdf}
                      >
                        <FileDown className="mr-2 h-4 w-4" />
                        Download Split PDF
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
