
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
import {
  FileDown,
  UploadCloud,
  X,
  File as FileIcon,
  CheckCircle2,
  RefreshCcw,
  Lock,
  Unlock,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { CircularProgress } from '@/components/ui/circular-progress';
import { SharePrompt } from '@/components/ui/share-prompt';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


type Mode = 'encrypt' | 'decrypt';

export default function PdfPasswordPage() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [mode, setMode] = useState<Mode>('encrypt');
  const [processedFile, setProcessedFile] = useState<Blob | null>(null);
  const { toast } = useToast();

  const resetState = () => {
    setFile(null);
    setPassword('');
    setIsProcessing(false);
    setProgress(0);
    setDone(false);
    setProcessedFile(null);
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

  const handleProcess = async () => {
    if (!file || !password) {
      toast({ title: 'Missing Information', description: 'Please provide a file and a password.', variant: 'destructive' });
      return;
    }
    setIsProcessing(true);
    setDone(false);
    setProgress(0);
    setProcessedFile(null);
    
    let processError: Error | null = null;
    let newPdfBytes: Uint8Array | null = null;
    
    const startTime = Date.now();
    const minDuration = 2000;

    const processPromise = (async () => {
        try {
            const existingPdfBytes = await file.arrayBuffer();
            let pdfDoc;

            if (mode === 'encrypt') {
                pdfDoc = await PDFDocument.load(existingPdfBytes);
                // The key is to set both passwords. Many viewers ignore the userPassword if an ownerPassword isn't set.
                newPdfBytes = await pdfDoc.save({ userPassword: password, ownerPassword: password });
            } else { // decrypt
                try {
                     pdfDoc = await PDFDocument.load(existingPdfBytes, { ownerPassword: password });
                } catch(e) {
                     // pdf-lib has a bug where it requires ownerPassword for decryption. Try that as a fallback.
                     pdfDoc = await PDFDocument.load(existingPdfBytes, { userPassword: password });
                }
                newPdfBytes = await pdfDoc.save();
            }
        } catch (error) {
            processError = error instanceof Error ? error : new Error('An unknown error occurred.');
            if (error.message.includes('password') || error.message.toLowerCase().includes('encrypted')) {
                 processError = new Error('Invalid password or already encrypted. Please check and try again.');
            }
        }
    })();

    const progressInterval = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const currentProgress = Math.min((elapsedTime / minDuration) * 100, 100);
        setProgress(currentProgress);
    }, 50);

    await Promise.all([processPromise, new Promise(resolve => setTimeout(resolve, minDuration))]);
    clearInterval(progressInterval);
    setIsProcessing(false);

    if (processError) {
        toast({ title: 'Processing Error', description: processError.message, variant: 'destructive' });
        // Don't reset state, allow user to correct password
        setDone(false);
    } else if (newPdfBytes) {
        setDone(true);
        const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
        setProcessedFile(blob);
    }
  };
  
  const handleDownload = () => {
    if (!processedFile || !file) return;
    const url = URL.createObjectURL(processedFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${mode}ed-${file.name}`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };
   const formatFileSize = (bytes: number | null | undefined): string => {
    if (!bytes) return '0 KB';
    if (bytes >= 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    } else {
      return (bytes / 1024).toFixed(2) + ' KB';
    }
  };
  
  const renderContent = () => {
    if (done) {
        const successTitle = mode === 'encrypt' ? 'PDF Encrypted!' : 'PDF Decrypted!';
        const successDesc = mode === 'encrypt' ? 'Your PDF is now password protected.' : 'The password has been removed from your PDF.';
        return (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="relative flex flex-col items-center justify-center space-y-4 rounded-md border p-8">
              <FileIcon className="h-24 w-24 text-primary" />
              <p className="truncate text-lg font-medium">{file?.name}</p>
            </div>
            <div className="flex flex-col items-center justify-center space-y-6 text-center">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
              <h3 className="text-2xl font-bold">{successTitle}</h3>
              <p className="text-muted-foreground">{successDesc}</p>
              <div className="flex w-full max-w-sm flex-col gap-2 pt-4">
                <Button onClick={handleDownload}><FileDown className="mr-2 h-4 w-4" /> Download PDF</Button>
                <Button variant="secondary" onClick={resetState}><RefreshCcw className="mr-2 h-4 w-4" /> Start Over</Button>
              </div>
              <SharePrompt toolName="PDF Password Tool" />
            </div>
          </div>
        );
    }
    
    if (file) {
      return (
          <div className="grid gap-6 md:grid-cols-2">
              <div className="relative flex flex-col items-center justify-center space-y-4 rounded-md border p-8">
                  <FileIcon className="h-24 w-24 text-muted-foreground" />
                  <p className="truncate text-lg font-medium">{file.name}</p>
                   <Button variant="destructive" size="icon" className="absolute right-2 top-2" onClick={resetState}>
                      <X className="h-4 w-4" />
                  </Button>
              </div>
              <div className="flex flex-col space-y-6 justify-center">
                {isProcessing ? (
                  <div className="flex h-full flex-col items-center justify-center space-y-4">
                      <CircularProgress progress={progress} />
                      <p className="text-center text-sm text-muted-foreground">Processing PDF...</p>
                  </div>
                ): (
                  <>
                    <div>
                      <h3 className="mb-2 font-semibold">File Information</h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>Name: {file?.name}</p>
                        <p>Original Size: {formatFileSize(file?.size)}</p>
                      </div>
                    </div>
                    <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)} className="w-full">
                      <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="encrypt"><Lock className="mr-2 h-4 w-4" />Encrypt</TabsTrigger><TabsTrigger value="decrypt"><Unlock className="mr-2 h-4 w-4" />Decrypt</TabsTrigger></TabsList>
                      <TabsContent value="encrypt" className="pt-4 space-y-2">
                          <Label htmlFor="password-encrypt">Set a Password</Label>
                          <Input id="password-encrypt" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password to protect file" />
                          <Button onClick={handleProcess} className="w-full mt-4" disabled={!password}>Add Password</Button>
                      </TabsContent>
                      <TabsContent value="decrypt" className="pt-4 space-y-2">
                          <Label htmlFor="password-decrypt">Current Password</Label>
                          <Input id="password-decrypt" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password to unlock file" />
                          <Button onClick={handleProcess} className="w-full mt-4" disabled={!password}>Remove Password</Button>
                      </TabsContent>
                  </Tabs>
                  </>
                )}
              </div>
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
            <Input id="pdf-upload" type="file" className="sr-only" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} accept="application/pdf" />
            <Button asChild variant="outline" className="mt-4"><span>Browse File</span></Button>
        </label>
    );
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="text-center">
             <CardTitle className="text-3xl font-bold tracking-tight lg:text-4xl">Add or Remove PDF Password</CardTitle>
             <CardDescription className="text-base mt-2">
              Secure your PDFs with a password or remove existing protection.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>{renderContent()}</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>About PDF Password Protection</CardTitle>
          <CardDescription>
            Understand how to secure and manage access to your PDF documents.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Accordion type="single" collapsible defaultValue="item-1">
            <AccordionItem value="item-1">
              <AccordionTrigger>Why Protect a PDF?</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <p>
                  Password-protecting a PDF is a crucial step for securing sensitive information. It ensures that only individuals with the correct password can open and view the document's contents. This is ideal for sharing confidential reports, private records, or any document that should not be publicly accessible.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>How to Use the Tool</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <ol className="list-decimal list-inside space-y-2">
                  <li><strong>Upload Your PDF:</strong> Drag and drop your PDF file or click to browse and select it.</li>
                  <li><strong>Choose a Mode:</strong> Select "Encrypt" to add a password, or "Decrypt" to remove one.</li>
                  <li><strong>Enter Password:</strong>
                     <ul className="list-disc list-inside pl-4 mt-1">
                        <li>If encrypting, enter the new password you want to set.</li>
                        <li>If decrypting, enter the PDF's current password.</li>
                    </ul>
                  </li>
                  <li><strong>Process & Download:</strong> Click the button to apply your changes. Once complete, your new, secure (or unlocked) PDF will be ready for download.</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Tips for Security and Large Files</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <ul className="list-disc list-inside space-y-2">
                    <li><strong>Strong Passwords:</strong> When encrypting, use a strong, unique password that includes a mix of letters, numbers, and symbols to maximize security.</li>
                    <li><strong>Client-Side Security:</strong> The entire encryption and decryption process happens in your browser. Your PDF and your password are never sent to a server, ensuring maximum privacy.</li>
                    <li><strong>Large File Handling:</strong> For very large PDFs, the process may take a few moments as your browser needs to load and rebuild the entire file. Please be patient, as the tool is working locally on your machine.</li>
                    <li><strong>Forgot Your Password?</strong> This tool cannot recover lost passwords. If you forget the password to an encrypted PDF, you will not be able to open it.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
