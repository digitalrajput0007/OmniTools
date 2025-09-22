
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FileDown, UploadCloud, X, CheckCircle2, RefreshCcw, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { CircularProgress } from '@/components/ui/circular-progress';
import { SharePrompt } from '@/components/ui/share-prompt';
import { PDFDocument } from 'pdf-lib';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


const PdfIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" fill="#FADBD8" stroke="#E74C3C" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M14 2V8H20" stroke="#E74C3C" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M8 12H9C10.1046 12 11 12.8954 11 14V18" stroke="#C0392B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 18V12H16" stroke="#C0392B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 15H16" stroke="#C0392B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);


export default function PdfPasswordPage() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [processedFile, setProcessedFile] = useState<Blob | null>(null);
  const [isDragging, setIsDragging] = useState(false);
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
      toast({ title: 'Invalid File Type', description: 'Only PDF files are allowed.', variant: 'destructive' });
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
      toast({ title: 'Missing Information', description: 'Please select a file and enter a password.', variant: 'destructive' });
      return;
    }
    
    setIsProcessing(true);
    setProgress(0);
    setDone(false);

    let processError: Error | null = null;
    let newPdfBytes: Uint8Array | null = null;
    const minDuration = 3000;
    const startTime = Date.now();
    
    const processPromise = (async () => {
      try {
        const fileBuffer = await file.arrayBuffer();
        const loadOptions = mode === 'decrypt' ? { userPassword: password } : {};
        const pdfDoc = await PDFDocument.load(fileBuffer, loadOptions);
        
        if(mode === 'encrypt') {
            pdfDoc.encrypt({
                userPassword: password,
                ownerPassword: password,
            });
        }
        newPdfBytes = await pdfDoc.save();
      } catch (error) {
        processError = error instanceof Error ? error : new Error('An unknown error occurred.');
        console.error(error);
      }
    })();
    
    const progressInterval = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        setProgress(Math.min((elapsedTime / minDuration) * 100, 100));
    }, 50);

    await Promise.all([processPromise, new Promise(resolve => setTimeout(resolve, minDuration))]);
    clearInterval(progressInterval);
    
    setIsProcessing(false);
    
    if (processError) {
        toast({ title: mode === 'encrypt' ? 'Encryption Error' : 'Decryption Error', description: 'Incorrect password or corrupted file.', variant: 'destructive'});
    } else if (newPdfBytes) {
        setProcessedFile(new Blob([newPdfBytes], { type: 'application/pdf' }));
        setDone(true);
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
  
  const renderContent = () => {
    if (done) return (
      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col items-center justify-center space-y-4 rounded-md border p-8">
            <PdfIcon className="h-24 w-24" />
        </div>
        <div className="flex h-full flex-col items-start justify-center space-y-4 text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
          <h3 className="text-2xl font-bold">Success!</h3>
          <p className="text-muted-foreground">Your PDF has been {mode}ed.</p>
          <div className="flex w-full flex-col gap-2 pt-4">
            <Button className="w-full" onClick={handleDownload}><FileDown className="mr-2 h-4 w-4" /> Download PDF</Button>
            <Button className="w-full" variant="secondary" onClick={resetState}><RefreshCcw className="mr-2 h-4 w-4" /> Process Another</Button>
          </div>
          <SharePrompt toolName="PDF Password Tool" />
        </div>
      </div>
    );
    
    if (file) return (
      <div className="grid gap-6 md:grid-cols-2">
        <div className="relative flex flex-col items-center justify-center space-y-4 rounded-md border p-8">
          <PdfIcon className="h-24 w-24" />
          <p className="truncate text-lg font-medium">{file.name}</p>
          <Button variant="destructive" size="icon" className="absolute right-2 top-2" onClick={resetState}><X className="h-4 w-4" /></Button>
        </div>
        <div className="flex flex-col space-y-6 justify-center">
            {isProcessing ? (
                 <div className="flex h-full flex-col items-center justify-center space-y-4">
                    <CircularProgress progress={progress} />
                    <p className="text-center text-sm text-muted-foreground">{mode === 'encrypt' ? 'Encrypting' : 'Decrypting'} PDF...</p>
                 </div>
            ) : (
                <>
                  <div className="space-y-2">
                    <Label>Mode</Label>
                    <RadioGroup value={mode} onValueChange={(v) => setMode(v as 'encrypt' | 'decrypt')} className="grid grid-cols-2 gap-4">
                        <div><RadioGroupItem value="encrypt" id="mode-encrypt" className="peer sr-only"/><Label htmlFor="mode-encrypt" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary">Add Password</Label></div>
                        <div><RadioGroupItem value="decrypt" id="mode-decrypt" className="peer sr-only"/><Label htmlFor="mode-decrypt" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary">Remove Password</Label></div>
                    </RadioGroup>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" />
                  </div>
                  <Button onClick={handleProcess} size="lg" className="w-full">
                    <KeyRound className="mr-2 h-4 w-4" /> {mode === 'encrypt' ? 'Encrypt PDF' : 'Decrypt PDF'}
                  </Button>
                </>
            )}
        </div>
      </div>
    );

    return (
        <label htmlFor="pdf-upload" className={cn('flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 text-center transition-colors', { 'border-primary bg-accent/50': isDragging })} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragEvents} onDrop={handleDrop}>
            <UploadCloud className="h-12 w-12 text-muted-foreground" /><p className="mt-4 text-muted-foreground">Drag & drop your PDF here, or click to browse</p><Input id="pdf-upload" type="file" className="sr-only" onChange={handleFileChange} accept="application/pdf" /><Button asChild variant="outline" className="mt-4"><span>Browse File</span></Button>
        </label>
    );
  };
  
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="text-center">
            <CardTitle className="text-3xl font-bold tracking-tight lg:text-4xl">PDF Password Tool</CardTitle>
            <CardDescription className="text-base mt-2">Secure your PDFs with a password or remove existing protection.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>{renderContent()}</CardContent>
      </Card>
      <Card>
        <CardHeader>
            <CardTitle>About PDF Encryption</CardTitle>
        </CardHeader>
         <CardContent>
            <Accordion type="single" collapsible defaultValue="item-1">
              <AccordionItem value="item-1">
                <AccordionTrigger>Why Password-Protect a PDF?</AccordionTrigger>
                <AccordionContent className="space-y-2 text-muted-foreground">
                    <p>Password-protecting a PDF is a crucial step for securing sensitive information. It adds a layer of encryption that requires a password to view or edit the document, ensuring that only authorized individuals can access its contents. This is essential for confidential business reports, personal records, and any document that should not be publicly accessible.</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>How to Use the Tool</AccordionTrigger>
                <AccordionContent className="space-y-2 text-muted-foreground">
                  <ol className="list-decimal list-inside space-y-2">
                    <li><strong>Upload Your PDF:</strong> Drag and drop your file or click to browse.</li>
                    <li><strong>Select Mode:</strong> Choose whether you want to "Add Password" (encrypt) or "Remove Password" (decrypt).</li>
                    <li><strong>Enter Password:</strong>
                        <ul className="list-disc list-inside pl-4 mt-1">
                           <li>If encrypting, enter the new password you want to set.</li>
                           <li>If decrypting, enter the PDF's existing password.</li>
                        </ul>
                    </li>
                    <li><strong>Process:</strong> Click the button to start the encryption or decryption.</li>
                    <li><strong>Download:</strong> Once complete, download your newly secured or unsecured PDF file.</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Security and Privacy</AccordionTrigger>
                <AccordionContent className="space-y-2 text-muted-foreground">
                    <p>Your security is our priority. The entire encryption and decryption process happens directly in your browser. Your PDF and your password are never sent to a server, ensuring your data remains completely private and secure.</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
