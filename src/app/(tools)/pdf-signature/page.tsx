
'use client';

import { useState, useEffect, useRef } from 'react';
import { PDFDocument, rgb, StandardFonts, PDFImage, PDFFont } from 'pdf-lib';
import SignaturePad from 'signature_pad';
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
  File as FileIcon,
  CheckCircle2,
  RefreshCcw,
  X,
  Plus,
  PenLine,
  Type,
  Trash2,
  Edit,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { CircularProgress } from '@/components/ui/circular-progress';
import { SharePrompt } from '@/components/ui/share-prompt';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

let pdfjs: any;

const signatureFonts = {
    'font-great-vibes': 'Great Vibes',
    'font-sacramento': 'Sacramento',
    'font-allura': 'Allura',
    'font-dancing-script': 'Dancing Script',
    'font-sans': 'Sans Serif'
}

type SignatureFont = keyof typeof signatureFonts;

const colorOptions = {
    black: { name: 'Black', value: '#000000', rgb: { r: 0, g: 0, b: 0 } },
    blue: { name: 'Blue', value: '#0000FF', rgb: { r: 0, g: 0, b: 1 } },
    red: { name: 'Red', value: '#FF0000', rgb: { r: 1, g: 0, b: 0 } },
} as const;

type ColorName = keyof typeof colorOptions;

type DraggableObject = {
  id: number;
  type: 'image' | 'text';
  pageIndex: number;
  x: number; // as percentage of page width
  y: number; // as percentage of page height
  content: string; // data URL for image, text content for text
  width: number; // width in pixels
  height: number; // height in pixels
  fontSize?: number;
  color?: ColorName;
  font?: SignatureFont;
};

const DraggableItem = ({
  obj,
  page,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onEdit,
}: {
  obj: DraggableObject;
  page: { width: number; height: number };
  isSelected: boolean;
  onSelect: (e: React.MouseEvent, id: number) => void;
  onUpdate: (updatedObj: DraggableObject) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
}) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if(e.target instanceof HTMLButtonElement || e.target.parentElement instanceof HTMLButtonElement) return;
    onSelect(e, obj.id);
    setIsDragging(true);
    const pageRect = e.currentTarget.parentElement?.getBoundingClientRect();
    if (pageRect) {
      const currentX = (obj.x / 100) * pageRect.width;
      const currentY = (obj.y / 100) * pageRect.height;
      
      dragStartPos.current = {
        x: e.clientX - pageRect.left - currentX,
        y: e.clientY - pageRect.top - currentY,
      };
    }
    e.stopPropagation();
  };
  
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    e.stopPropagation();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging && !isResizing) return;
      e.preventDefault();
      
      const parent = itemRef.current?.parentElement;
      if (!parent) return;
      const pageRect = parent.getBoundingClientRect();
      
      if (isDragging) {
         let newX = ((e.clientX - pageRect.left - dragStartPos.current.x) / pageRect.width) * 100;
         let newY = ((e.clientY - pageRect.top - dragStartPos.current.y) / pageRect.height) * 100;
         onUpdate({ ...obj, x: newX, y: newY });
      } else if (isResizing) {
         const dx = e.clientX - dragStartPos.current.x;
         const dy = e.clientY - dragStartPos.current.y;
         onUpdate({ ...obj, width: Math.max(20, obj.width + dx), height: Math.max(20, obj.height + dy) });
         dragStartPos.current = { x: e.clientX, y: e.clientY };
      }
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      if(isDragging || isResizing) {
        e.stopPropagation();
      }
      setIsDragging(false);
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, obj, onUpdate]);

  return (
    <div
      ref={itemRef}
      onMouseDown={handleMouseDown}
      className={cn(
        "absolute cursor-move border border-dashed group",
        isSelected ? 'border-primary z-20' : 'border-transparent'
      )}
      style={{
        left: `${obj.x}%`,
        top: `${obj.y}%`,
        width: obj.width,
        height: obj.height,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {obj.type === 'image' ? (
        <Image src={obj.content} alt="signature" layout="fill" />
      ) : (
        <div style={{ fontSize: obj.fontSize, whiteSpace: 'nowrap', color: colorOptions[obj.color || 'black'].value }} className={cn('h-full w-full flex items-center justify-center', obj.font)}>{obj.content}</div>
      )}
      
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-md bg-secondary p-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEdit(obj.id)}><Edit className="h-4 w-4"/></Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onDelete(obj.id)}><Trash2 className="h-4 w-4"/></Button>
      </div>
      {isSelected && (
          <div
            className="absolute -bottom-1 -right-1 h-3 w-3 cursor-se-resize rounded-full bg-primary border-2 border-background"
            onMouseDown={handleResizeMouseDown}
          />
      )}
    </div>
  );
};


export default function PdfSignaturePage() {
  const [file, setFile] = useState<File | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [pageDimensions, setPageDimensions] = useState<{width: number, height: number}[]>([]);
  const [objects, setObjects] = useState<DraggableObject[]>([]);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [processedFile, setProcessedFile] = useState<Blob | null>(null);
  const [isAddTextOpen, setIsAddTextOpen] = useState(false);
  const [isAddSigOpen, setIsAddSigOpen] = useState(false);
  const [editingObject, setEditingObject] = useState<DraggableObject | null>(null);
  const [selectedObjectId, setSelectedObjectId] = useState<number | null>(null);
  const [signatureColor, setSignatureColor] = useState<ColorName>('black');


  const signaturePadRef = useRef<SignaturePad | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { toast } = useToast();

  useEffect(() => {
    import('pdfjs-dist/build/pdf.mjs').then(pdfjsLib => {
      pdfjs = pdfjsLib;
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.mjs',
        import.meta.url
      ).toString();
    });
  }, []);

  useEffect(() => {
    if (isAddSigOpen) {
      const timeoutId = setTimeout(() => {
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          const ratio = Math.max(window.devicePixelRatio || 1, 1);
          canvas.width = canvas.offsetWidth * ratio;
          canvas.height = canvas.offsetHeight * ratio;
          const ctx = canvas.getContext("2d");
          ctx?.scale(ratio, ratio);
          
          signaturePadRef.current = new SignaturePad(canvas, {
              penColor: colorOptions[signatureColor].value,
          });
          
          if (editingObject?.type === 'image') {
            signaturePadRef.current.fromDataURL(editingObject.content);
          } else {
            signaturePadRef.current.clear();
          }
        }
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        if (signaturePadRef.current) {
            signaturePadRef.current.off();
        }
        signaturePadRef.current = null;
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAddSigOpen, editingObject, signatureColor]);

  const resetState = () => {
    setFile(null);
    setPreviews([]);
    setPageDimensions([]);
    setObjects([]);
    setIsProcessing(false);
    setProgress(0);
    setDone(false);
    setProcessedFile(null);
    setSelectedObjectId(null);
    setEditingObject(null);
  };

  const handleFileSelect = async (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      toast({ title: 'Invalid File Type', variant: 'destructive' });
      return;
    }
    if (!pdfjs) {
        toast({ title: 'PDF library not loaded', description: 'Please wait a moment and try again.', variant: 'destructive' });
        return;
    }
    resetState();
    setFile(selectedFile);
    setIsProcessing(true);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      const pagePreviews: string[] = [];
      const pageDims: {width: number, height: number}[] = [];

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const context = canvas.getContext('2d');
        
        if (context) {
          await page.render({ canvasContext: context, viewport }).promise;
          pagePreviews.push(canvas.toDataURL());
          pageDims.push({ width: viewport.width, height: viewport.height });
        }
        setProgress(Math.round((i / numPages) * 100));
      }
      setPreviews(pagePreviews);
      setPageDimensions(pageDims);
    } catch (error) {
      toast({ title: 'Error Loading PDF', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragEvents = (e: React.DragEvent<HTMLElement>) => { e.preventDefault(); e.stopPropagation(); };
  const handleDragEnter = (e: React.DragEvent<HTMLElement>) => { handleDragEvents(e); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent<HTMLElement>) => { handleDragEvents(e); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    handleDragEvents(e);
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
  };
  
  const handleObjectDrop = (e: React.DragEvent<HTMLDivElement>, pageIndex: number) => {
    e.preventDefault();
    const objectId = parseInt(e.dataTransfer.getData('text/plain'), 10);
    const pageElement = e.currentTarget.getBoundingClientRect();
    
    setObjects(prev => prev.map(obj => {
      if (obj.id === objectId) {
        const x = ((e.clientX - pageElement.left) / pageElement.width) * 100;
        const y = ((e.clientY - pageElement.top) / pageElement.height) * 100;
        return { ...obj, pageIndex, x, y };
      }
      return obj;
    }));
  };

  const handleAddOrUpdateText = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const text = formData.get('text-input') as string;
    const fontSize = parseInt(formData.get('font-size') as string, 10);
    const color = formData.get('color') as ColorName;
    const font = formData.get('font') as SignatureFont;
    if (!text) return;

    if (editingObject) {
      setObjects(prev => prev.map(o => o.id === editingObject.id ? { ...o, content: text, fontSize, width: text.length * (fontSize * 0.6), height: fontSize * 1.2, color, font } : o));
      setEditingObject(null);
    } else {
      const newObject: DraggableObject = {
        id: Date.now(), type: 'text', pageIndex: -1, x: 50, y: 50, content: text,
        width: text.length * (fontSize * 0.6), height: fontSize * 1.2, fontSize, color, font
      };
      setObjects(prev => [...prev, newObject]);
    }
    setIsAddTextOpen(false);
  };
  
  const handleAddOrUpdateSignature = () => {
    if (!signaturePadRef.current || signaturePadRef.current.isEmpty()) {
      toast({ title: "Signature is empty", variant: 'destructive' });
      return;
    }
    const dataUrl = signaturePadRef.current.toDataURL('image/png');
    
    if (editingObject) {
      setObjects(prev => prev.map(o => o.id === editingObject.id ? { ...o, content: dataUrl, color: signatureColor } : o));
      setEditingObject(null);
    } else {
      const newObject: DraggableObject = {
        id: Date.now(), type: 'image', pageIndex: -1, x: 50, y: 50, content: dataUrl,
        width: 150, height: 75, color: signatureColor
      };
      setObjects(prev => [...prev, newObject]);
    }
    setIsAddSigOpen(false);
  };

  const handleDeleteObject = (id: number) => {
    setObjects(prev => prev.filter(o => o.id !== id));
    if (selectedObjectId === id) setSelectedObjectId(null);
  }

  const handleUpdateObject = (updatedObj: DraggableObject) => {
    setObjects(prev => prev.map(o => o.id === updatedObj.id ? updatedObj : o));
  };

  const handleEditObject = (id: number) => {
    const objectToEdit = objects.find(o => o.id === id);
    if (!objectToEdit) return;
    setEditingObject(objectToEdit);
    if(objectToEdit.type === 'text') {
      setIsAddTextOpen(true);
    } else {
      setSignatureColor(objectToEdit.color || 'black');
      setIsAddSigOpen(true);
    }
  }
  
  const handleSave = async () => {
    if (!file) return;
    setIsProcessing(true);
    setDone(false);
    setProgress(0);
    
    try {
        const pdfDoc = await PDFDocument.load(await file.arrayBuffer());
        const pages = pdfDoc.getPages();
        const fontMap: Partial<Record<SignatureFont, PDFFont>> = {};
        
        fontMap['font-sans'] = await pdfDoc.embedFont(StandardFonts.Helvetica);
        // We will embed other fonts on demand

        const objectsToPlace = objects.filter(obj => obj.pageIndex !== -1);

        for (const obj of objectsToPlace) {
            const page = pages[obj.pageIndex];
            const { width: pageWidth, height: pageHeight } = page.getSize();
            
            const objFinalWidth = obj.width;
            const objFinalHeight = obj.height;

            const x = (obj.x / 100 * pageWidth) - (objFinalWidth / 2);
            const y = pageHeight - ((obj.y / 100 * pageHeight) + (objFinalHeight / 2));
            
            const objColor = colorOptions[obj.color || 'black'].rgb;

            if (obj.type === 'text') {
                let currentFont = fontMap[obj.font || 'font-sans'];
                 if(!currentFont) {
                     const fontBytes = await fetch(`https://fonts.gstatic.com/s/${(obj.font || 'dancingscript').replace('font-', '')}/v25/FpJG-AG5sZgAA5L6i24T321L0Gg.ttf`).then(res => res.arrayBuffer());
                     currentFont = await pdfDoc.embedFont(fontBytes);
                     fontMap[obj.font || 'font-sans'] = currentFont;
                 }

                 page.drawText(obj.content, {
                    x, y: y, font: currentFont, size: obj.fontSize, color: objColor,
                });
            } else if (obj.type === 'image') {
                const pngImage = await pdfDoc.embedPng(obj.content);
                page.drawImage(pngImage, {
                    x, y, width: objFinalWidth, height: objFinalHeight,
                    color: objColor,
                    blendMode: 'Normal'
                });
            }
        }
        
        const pdfBytes = await pdfDoc.save();
        setProcessedFile(new Blob([pdfBytes], { type: 'application/pdf' }));
        setDone(true);
    } catch (error) {
        toast({ title: 'Error saving PDF', description: "There was an issue embedding fonts or images.", variant: 'destructive'});
        console.error(error);
    } finally {
        setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!processedFile || !file) return;
    const url = URL.createObjectURL(processedFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = `signed-${file.name}`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };
  
  const selectedObject = objects.find(o => o.id === selectedObjectId);

  const renderContent = () => {
    if (isProcessing) return <div className="flex min-h-[300px] flex-col items-center justify-center space-y-4"><CircularProgress progress={progress} /><p className="text-sm text-muted-foreground">Processing PDF...</p></div>;
    if (done) return <div className="text-center space-y-4"><CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" /><h3 className="text-2xl font-bold">PDF Saved!</h3><p className="text-muted-foreground">Your changes have been applied.</p><div className="flex flex-col sm:flex-row gap-2 justify-center"><Button onClick={handleDownload}><FileDown className="mr-2"/>Download PDF</Button><Button variant="secondary" onClick={resetState}><RefreshCcw className="mr-2"/>Start Over</Button></div><SharePrompt toolName="PDF Signature Tool" /></div>;

    if (previews.length > 0) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6" onClick={() => setSelectedObjectId(null)}>
            <div className="md:col-span-1 md:sticky md:top-20 self-start space-y-4">
                 <Card>
                    <CardHeader><CardTitle>Objects</CardTitle><CardDescription>Add items, then drag them onto a page.</CardDescription></CardHeader>
                    <CardContent className="space-y-2">
                         <Dialog open={isAddTextOpen} onOpenChange={(open) => { if (!open) setEditingObject(null); setIsAddTextOpen(open); }}>
                            <DialogTrigger asChild><Button variant="outline" className="w-full"><Type className="mr-2"/>Add Text</Button></DialogTrigger>
                            <DialogContent><DialogHeader><DialogTitle>{editingObject ? 'Edit' : 'Add'} Text</DialogTitle></DialogHeader><form onSubmit={handleAddOrUpdateText} className="space-y-4"><div className="space-y-2"><Label htmlFor="text-input">Text</Label><Input id="text-input" name="text-input" defaultValue={editingObject?.content}/></div><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="font-size">Font Size</Label><Input id="font-size" name="font-size" type="number" defaultValue={editingObject?.fontSize || 24} /></div><div className="space-y-2"><Label htmlFor="font">Font Style</Label><Select name="font" defaultValue={editingObject?.font || 'font-dancing-script'}><SelectTrigger id="font"><SelectValue/></SelectTrigger><SelectContent>{Object.entries(signatureFonts).map(([className, name]) => <SelectItem key={className} value={className} className={className}>{name}</SelectItem>)}</SelectContent></Select></div></div><div className="space-y-2"><Label>Color</Label><RadioGroup name="color" defaultValue={editingObject?.color || 'black'} className="flex gap-4">{Object.entries(colorOptions).map(([key, {name, value}]) => <div key={key} className="flex items-center space-x-2"><RadioGroupItem value={key} id={`text-${key}`}/><Label htmlFor={`text-${key}`} style={{color: value}}>{name}</Label></div>)}</RadioGroup></div><Button type="submit" className="w-full">{editingObject ? 'Update' : 'Add'} Text</Button></form></DialogContent>
                        </Dialog>
                         <Dialog open={isAddSigOpen} onOpenChange={(open) => { if (!open) setEditingObject(null); setIsAddSigOpen(open); }}>
                            <DialogTrigger asChild><Button variant="outline" className="w-full"><PenLine className="mr-2"/>Add Signature</Button></DialogTrigger>
                            <DialogContent><DialogHeader><DialogTitle>{editingObject ? 'Edit' : 'Draw'} Signature</DialogTitle></DialogHeader><div className="space-y-4"><canvas ref={canvasRef} className="border rounded-md w-full h-48 bg-gray-50" /> <div className="space-y-2"><Label>Color</Label><RadioGroup value={signatureColor} onValueChange={(v) => setSignatureColor(v as ColorName)} className="flex gap-4">{Object.entries(colorOptions).map(([key, {name, value}]) => <div key={key} className="flex items-center space-x-2"><RadioGroupItem value={key} id={`sig-${key}`}/><Label htmlFor={`sig-${key}`} style={{color: value}}>{name}</Label></div>)}</RadioGroup></div><div className="flex gap-2"><Button onClick={handleAddOrUpdateSignature} className="w-full">{editingObject ? 'Update' : 'Add'}</Button><Button variant="secondary" onClick={() => signaturePadRef.current?.clear()}>Clear</Button></div></div></DialogContent>
                        </Dialog>
                        <div className="space-y-2 pt-4">
                             {objects.filter(o => o.pageIndex === -1).map(obj => (
                                <div key={obj.id} draggable onDragStart={(e) => { e.dataTransfer.setData('text/plain', obj.id.toString()); setSelectedObjectId(obj.id); }} className="border p-2 rounded-md cursor-grab flex items-center gap-2">
                                    {obj.type === 'text' ? <Type className="h-5 w-5 shrink-0"/> : <PenLine className="h-5 w-5 shrink-0"/>}
                                    <p className="truncate text-sm flex-1">{obj.type === 'text' ? obj.content : "Signature"}</p>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDeleteObject(obj.id)}><Trash2 className="h-4 w-4"/></Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                 </Card>

                  {(objects.some(o => o.pageIndex !== -1) || previews.length > 0) && <Button onClick={handleSave} size="lg" className="w-full">Save Changes</Button>}
            </div>
            <div className="md:col-span-3 space-y-4">
                {previews.map((src, index) => (
                    <div key={index} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleObjectDrop(e, index)} className="relative border rounded-lg overflow-hidden shadow-md bg-white">
                        <Image src={src} alt={`Page ${index + 1}`} width={pageDimensions[index].width} height={pageDimensions[index].height} className="w-full h-auto" />
                         {objects.filter(o => o.pageIndex === index).map(obj => (
                            <DraggableItem
                              key={obj.id}
                              obj={obj}
                              page={pageDimensions[index]}
                              isSelected={selectedObjectId === obj.id}
                              onSelect={(e, id) => { e.stopPropagation(); setSelectedObjectId(id); }}
                              onUpdate={handleUpdateObject}
                              onDelete={handleDeleteObject}
                              onEdit={handleEditObject}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
      )
    }

    return (
        <label htmlFor="pdf-upload" className={cn('flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 text-center transition-colors', { 'border-primary bg-accent/50': isDragging })} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragEvents} onDrop={handleDrop}>
            <UploadCloud className="h-12 w-12 text-muted-foreground" /><p className="mt-4 text-muted-foreground">Drag & drop your PDF here, or click to browse</p><Input id="pdf-upload" type="file" className="sr-only" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} accept="application/pdf" /><Button asChild variant="outline" className="mt-4"><span>Browse File</span></Button>
        </label>
    );
  };
  
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="text-center">
             <CardTitle className="text-3xl font-bold tracking-tight lg:text-4xl">Add Signature / Fill Form</CardTitle>
             <CardDescription className="text-base mt-2">
              Add, edit, resize, and delete text or signatures on your PDF document.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
       <Card>
        <CardHeader>
          <CardTitle>How to Sign or Fill a PDF</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <ol className="list-decimal list-inside space-y-2">
            <li><strong>Upload PDF:</strong> Drag and drop your PDF file or click to browse.</li>
            <li><strong>Add Objects:</strong> Use the "Add Text" or "Add Signature" buttons to create items with your desired colors and fonts. They will appear in the left panel.</li>
            <li><strong>Position Objects:</strong> Drag your created text or signature from the panel and drop it onto the desired location on any page.</li>
            <li><strong>Select & Manipulate:</strong> Click on an object on the page to select it. You can drag the object to a new position or use the corner handle to resize it. Hover over the object to see Edit and Delete controls.</li>
            <li><strong>Save and Download:</strong> Once you've placed all your objects, click "Save Changes" to generate and download your new PDF.</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
