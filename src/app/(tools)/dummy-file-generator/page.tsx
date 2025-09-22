
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
import { Download, FilePlus2 } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CircularProgress } from '@/components/ui/circular-progress';
import { SharePrompt } from '@/components/ui/share-prompt';
import { PDFDocument } from 'pdf-lib';
import * as XLSX from 'xlsx';

type FileType = 'pdf' | 'jpg' | 'png' | 'docx' | 'xlsx';
type SizeUnit = 'KB' | 'MB';


const generateDummyPdf = async (sizeInBytes: number, onProgress: (p: number) => void): Promise<Blob> => {
  const pdfDoc = await PDFDocument.create();
  let currentBytes = new Uint8Array(0);

  // Add pages with random text until the size is met
  while (currentBytes.length < sizeInBytes) {
    const page = pdfDoc.addPage([600, 800]);
    // Add a chunk of text. The size is an approximation.
    page.drawText('Random dummy content for file size. '.repeat(200), {
        x: 50,
        y: 750,
        size: 12,
    });
    currentBytes = await pdfDoc.save();
    onProgress(Math.min(99, (currentBytes.length / sizeInBytes) * 100));
  }
  
  return new Blob([currentBytes], { type: 'application/pdf' });
};


const generateDummyImage = (sizeInBytes: number, format: 'jpg' | 'png'): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        // Estimate canvas dimensions. This is a heuristic.
        // JPG is more compressed, PNG is less so.
        const compressionFactor = format === 'jpg' ? 0.15 : 0.7;
        const dimension = Math.ceil(Math.sqrt(sizeInBytes / compressionFactor));
        
        const canvas = document.createElement('canvas');
        canvas.width = Math.min(dimension, 8000); // Cap dimensions to avoid browser crashes
        canvas.height = Math.min(dimension, 8000);
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error("Could not get canvas context."));

        // Fill with random noise for less compressibility
        const imageData = ctx.createImageData(canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i++) {
            data[i] = Math.floor(Math.random() * 256);
        }
        ctx.putImageData(imageData, 0, 0);

        // Export with variable quality for JPG to better match size
        let quality = 0.9;
        const tryExport = () => {
            canvas.toBlob((blob) => {
                if (!blob) return reject(new Error("Failed to create blob."));

                // For JPG, try to get closer to the target size by adjusting quality
                if (format === 'jpg' && blob.size < sizeInBytes * 0.8 && quality > 0.2) {
                    quality -= 0.1;
                    tryExport();
                    return;
                }
                
                resolve(blob);

            }, `image/${format}`, quality);
        };
        tryExport();
    });
};

const generateDummyDocx = (sizeInBytes: number): Blob => {
  const baseContent = `This is a dummy .docx file. To reach the target size, we are adding padding content. `;
  const repeatCount = Math.floor(sizeInBytes / baseContent.length);
  const finalContent = baseContent.repeat(repeatCount);
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
  const [generatedFile, setGeneratedFile] = useState<{ blob: Blob; name: string } | null>(null);

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
    
    // Give UI time to update before blocking the main thread
    await new Promise(resolve => setTimeout(resolve, 50));

    try {
        switch (fileType) {
            case 'pdf': blob = await generateDummyPdf(sizeInBytes, onProgress); break;
            case 'jpg': blob = await generateDummyImage(sizeInBytes, 'jpg'); break;
            case 'png': blob = await generateDummyImage(sizeInBytes, 'png'); break;
            case 'docx': blob = generateDummyDocx(sizeInBytes); break;
            case 'xlsx': blob = generateDummyXlsx(sizeInBytes); break;
        }
        setProgress(100);
        if (blob) {
          setGeneratedFile({ blob, name: fileName });
        } else {
            throw new Error('File generation resulted in an empty blob.');
        }
    } catch (error) {
        console.error(error);
        toast({ title: 'Generation Error', description: error instanceof Error ? error.message : 'Could not generate the file.', variant: 'destructive' });
        resetState();
    } finally {
        setIsGenerating(false);
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
        <CardContent className="mx-auto max-w-lg space-y-8">
            {isGenerating ? (
                <div className="flex min-h-[200px] flex-col items-center justify-center space-y-4">
                    <CircularProgress progress={progress} />
                    <p className="text-center text-sm text-muted-foreground">Generating your dummy file...</p>
                </div>
            ) : generatedFile ? (
                 <div className="flex flex-col items-center space-y-6 rounded-md border p-8">
                    <FilePlus2 className="h-24 w-24 text-primary" />
                    <div className='text-center'>
                        <p className="font-medium">{generatedFile.name}</p>
                        <p className="text-sm text-muted-foreground">Final Size: {formatFileSize(generatedFile.blob.size)}</p>
                    </div>
                    <div className='flex w-full gap-2'>
                        <Button onClick={handleDownload} className="w-full">
                            <Download className="mr-2 h-4 w-4" /> Download File
                        </Button>
                        <Button onClick={resetState} variant="outline" className="w-full">Generate Another</Button>
                    </div>
                     <SharePrompt toolName="Dummy File Generator" />
                </div>
            ) : (
                <div className='space-y-6'>
                    <div className="space-y-2">
                        <Label htmlFor="file-type">File Type</Label>
                        <Select value={fileType} onValueChange={(v) => setFileType(v as FileType)}>
                        <SelectTrigger id="file-type">
                            <SelectValue placeholder="Select file type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                            <SelectItem value="jpg">JPG (.jpg)</SelectItem>
                            <SelectItem value="png">PNG (.png)</SelectItem>
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
            )}
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
                  <li><strong>Select File Type:</strong> Choose the desired format for your dummy file (e.g., PDF, JPG, XLSX).</li>
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
    </div>
  );
}
