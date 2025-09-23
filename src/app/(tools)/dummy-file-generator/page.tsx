
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
import { useToast } from '@/hooks/use-toast';
import { Download, FilePlus2, RefreshCcw, FileText, FileSpreadsheet } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CircularProgress } from '@/components/ui/circular-progress';
import { SharePrompt } from '@/components/ui/share-prompt';
import { PDFDocument } from 'pdf-lib';
import * as XLSX from 'xlsx';
import { RelatedTools } from '@/components/ui/related-tools';

type FileType = 'pdf' | 'docx' | 'xlsx';
type SizeUnit = 'KB' | 'MB';

const getFileIcon = (fileType: FileType) => {
    switch(fileType) {
        case 'pdf': return <FileText className="h-24 w-24 text-red-500" />;
        case 'docx': return <FileText className="h-24 w-24 text-blue-500" />;
        case 'xlsx': return <FileSpreadsheet className="h-24 w-24 text-green-500" />;
    }
}

const LOREM_IPSUM = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. '.repeat(5);

const generateDummyPdf = async (sizeInBytes: number, onProgress: (p: number) => void): Promise<Blob> => {
  const pdfDoc = await PDFDocument.create();
  let currentBytes = new Uint8Array(0);

  while (currentBytes.length < sizeInBytes) {
    const page = pdfDoc.addPage([600, 800]);
    page.drawText(LOREM_IPSUM, {
        x: 50,
        y: 750,
        size: 10,
        lineHeight: 14,
        maxWidth: 500,
    });
    currentBytes = await pdfDoc.save();
    onProgress(Math.min(99, (currentBytes.length / sizeInBytes) * 100));
  }
  
  return new Blob([currentBytes], { type: 'application/pdf' });
};

const generateDummyDocx = (sizeInBytes: number): Blob => {
  const repeatCount = Math.floor(sizeInBytes / LOREM_IPSUM.length);
  const finalContent = LOREM_IPSUM.repeat(repeatCount || 1);
  return new Blob([finalContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
};

const generateDummyXlsx = (sizeInBytes: number): Blob => {
    // Heuristic: Estimate rows needed. A simple row is ~100-200 bytes.
    const rows = Math.ceil(sizeInBytes / 150);
    const data = Array(rows).fill(null).map((_, r) => ({
        ID: r + 1,
        UUID: `dummy-uuid-${r+1}-${Math.random().toString(36).substring(2)}`,
        Content: `This is sample content for row ${r+1} to add weight to the file. Lorem ipsum dolor sit amet.`,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dummy Data');
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([wbout], {type: 'application/octet-stream'});
};

const formatFileSize = (bytes: number | null | undefined): string => {
  if (!bytes) return '0 KB';
  if (bytes >= 1024 * 1024) {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  } else {
    return (bytes / 1024).toFixed(2) + ' KB';
  }
};


export default function DummyFileGeneratorPage() {
  const [fileType, setFileType] = useState<FileType>('pdf');
  const [fileSize, setFileSize] = useState('100');
  const [sizeUnit, setSizeUnit] = useState<SizeUnit>('KB');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedFile, setGeneratedFile] = useState<{ blob: Blob; name: string; type: FileType } | null>(null);

  const { toast } = useToast();
  
  const resetState = () => {
    setIsGenerating(false);
    setProgress(0);
    setGeneratedFile(null);
  }

  const handleGenerate = async () => {
    const size = parseInt(fileSize, 10);
    if (isNaN(size) || size <= 0) {
      toast({
        title: 'Invalid Size',
        description: 'Please enter a valid file size greater than 0.',
        variant: 'destructive',
      });
      return;
    }

    if (sizeUnit === 'MB' && size > 200) {
        toast({
            title: 'Size Limit Exceeded',
            description: 'Please choose a size under 200MB to avoid browser instability.',
            variant: 'destructive',
        });
        return;
    }
    
    resetState();
    setIsGenerating(true);

    let blob: Blob | null = null;
    const sizeInBytes = sizeUnit === 'MB' ? size * 1024 * 1024 : size * 1024;
    const fileName = `dummy-${size}${sizeUnit}.${fileType}`;
    
    const onProgress = (p: number) => {
        setProgress(p);
    };

    let generationError: Error | null = null;
    const startTime = Date.now();
    const minDuration = 3000;
    
    const generationPromise = (async () => {
        try {
            switch (fileType) {
                case 'pdf': blob = await generateDummyPdf(sizeInBytes, onProgress); break;
                case 'docx': blob = generateDummyDocx(sizeInBytes); break;
                case 'xlsx': blob = generateDummyXlsx(sizeInBytes); break;
            }
        } catch (error) {
            generationError = error instanceof Error ? error : new Error('Could not generate the file.');
        }
    })();

    const progressInterval = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const currentProgress = Math.min((elapsedTime / minDuration) * 100, 100);
        // Only update progress from the timer if the generation function isn't providing it
        if (fileType !== 'pdf') {
            setProgress(currentProgress);
        }
    }, 50);

    await Promise.all([generationPromise, new Promise(resolve => setTimeout(resolve, minDuration))]);
    clearInterval(progressInterval);
    setProgress(100);
    setIsGenerating(false);

    if (generationError) {
        console.error(generationError);
        toast({ title: 'Generation Error', description: generationError.message, variant: 'destructive' });
        resetState();
    } else if (blob) {
        setGeneratedFile({ blob, name: fileName, type: fileType });
    } else {
        toast({ title: 'Generation Error', description: 'File generation resulted in an empty file.', variant: 'destructive' });
        resetState();
    }
  };
  
  const handleDownload = () => {
    if (!generatedFile) return;
    const url = URL.createObjectURL(generatedFile.blob);
    const a = document.createElement('a');
a.href = url;
    a.download = generatedFile.name;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };
  
  const renderInitialOrProgress = () => {
     if (isGenerating) {
        return (
            <div className="flex min-h-[200px] flex-col items-center justify-center space-y-4">
                <CircularProgress progress={progress} />
                <p className="text-center text-sm text-muted-foreground">Generating your dummy file...</p>
                 <Button onClick={() => window.location.reload()} variant="outline">Cancel</Button>
            </div>
        );
     }
     
     return (
        <div className='mx-auto max-w-lg space-y-6'>
            <div className="space-y-2">
                <Label htmlFor="file-type">File Type</Label>
                <Select value={fileType} onValueChange={(v) => setFileType(v as FileType)}>
                <SelectTrigger id="file-type">
                    <SelectValue placeholder="Select file type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                    <SelectItem value="docx">Word (.docx)</SelectItem>
                    <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="file-size">File Size</Label>
                <div className="flex items-center gap-2">
                   <Input
                    id="file-size"
                    type="number"
                    value={fileSize}
                    onChange={(e) => setFileSize(e.target.value)}
                    placeholder="e.g., 100"
                    min="1"
                   />
                   <Select value={sizeUnit} onValueChange={(v) => setSizeUnit(v as SizeUnit)}>
                     <SelectTrigger className="w-[100px]">
                        <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value="KB">KB</SelectItem>
                        <SelectItem value="MB">MB</SelectItem>
                     </SelectContent>
                   </Select>
                </div>
                 <p className="text-xs text-muted-foreground">
                    Note: The final file size will be an approximation.
                </p>
            </div>
            
            <Button onClick={handleGenerate} className="w-full" size="lg">
                Generate File
            </Button>
        </div>
     );
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="text-center">
            <CardTitle className="text-3xl font-bold tracking-tight lg:text-4xl">Dummy File Generator</CardTitle>
            <CardDescription className="text-base mt-2">
              Create dummy files of a specific type and size for testing purposes.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
            {generatedFile ? (
                 <div className="grid gap-6 md:grid-cols-2">
                    <div className="flex flex-col items-center justify-center space-y-4 rounded-md border p-8 bg-muted/20">
                        {getFileIcon(generatedFile.type)}
                        <div className='text-center'>
                            <p className="font-medium">{generatedFile.name}</p>
                            <p className="text-sm text-muted-foreground">Final Size: {formatFileSize(generatedFile.blob.size)}</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center space-y-6">
                        <div className='flex w-full max-w-sm flex-col gap-2'>
                            <Button onClick={handleDownload} size="lg">
                                <Download className="mr-2 h-4 w-4" /> Download File
                            </Button>
                            <Button onClick={resetState} variant="outline" size="lg">
                                <RefreshCcw className="mr-2 h-4 w-4" /> Generate Another
                            </Button>
                        </div>
                         <SharePrompt toolName="Dummy File Generator" />
                    </div>
                </div>
            ) : renderInitialOrProgress() }
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>About the Dummy File Generator</CardTitle>
          <CardDescription>
            Learn why and how to use placeholder files in your testing workflows.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Accordion type="single" collapsible defaultValue="item-1">
            <AccordionItem value="item-1">
              <AccordionTrigger>Why Use a Dummy File Generator?</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <p>
                  Developers and testers often need placeholder files to test application features like file uploads, processing pipelines, or storage limits. A dummy file generator provides a quick and easy way to create files with specific sizes and formats without needing to find or create them manually. This is essential for testing edge cases, like how an application handles a 10MB PDF upload versus a 50KB one.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>How to Use This Tool</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <ol className="list-decimal list-inside space-y-2">
                  <li><strong>Select File Type:</strong> Choose the desired format for your dummy file (e.g., PDF, DOCX, XLSX).</li>
                  <li><strong>Enter File Size:</strong> Specify the target size of the file and select the unit (KB or MB).</li>
                  <li><strong>Generate:</strong> Click the "Generate File" button. The tool will create the file in your browser.</li>
                  <li><strong>Download:</strong> Once complete, click the "Download File" button to save it to your device.</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>A Note on File Size Accuracy</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <p>
                  Generating a file to an exact byte-for-byte size is complex due to compression and file structure overhead. This tool uses various techniques to create a file that is as close as possible to the target size.
                </p>
                 <ul className="list-disc list-inside space-y-2">
                  <li><strong>PDF/Word/Excel:</strong> Size is approximated by adding dummy data or content until the target is met. These are generally quite accurate.</li>
                  <li><strong>Images (JPG/PNG):</strong> Size is approximated by creating a canvas with random pixel data. The final size is heavily influenced by the format's compression algorithm and can vary.</li>
                </ul>
                <p>
                  The downloaded file's size should be very close to your requested size, making it perfect for most testing scenarios.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
      <RelatedTools toolPath="/dummy-file-generator" />
    </div>
  );
}
