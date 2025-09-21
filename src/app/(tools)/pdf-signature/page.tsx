
'use client';

import { useState, useEffect, useRef } from 'react';
import { PDFDocument, rgb, StandardFonts, PDFImage, PDFFont, degrees } from 'pdf-lib';
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
  CheckCircle2,
  RefreshCcw,
  X,
  Plus,
  PenLine,
  Type,
  Trash2,
  Edit,
  Copy,
  Upload,
  Palette,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RotateCw,
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
import { Slider } from '@/components/ui/slider';


let pdfjs: any;

const signatureFonts = {
  'Helvetica': { name: 'Helvetica', className: 'font-sans' },
  'Helvetica-Bold': { name: 'Helvetica Bold', className: 'font-sans font-bold' },
  'Helvetica-Oblique': { name: 'Helvetica Italic', className: 'font-sans italic' },
  'Helvetica-BoldOblique': { name: 'Helvetica Bold Italic', className: 'font-sans font-bold italic' },
  'Times-Roman': { name: 'Times Roman', className: 'font-serif' },
  'Times-Bold': { name: 'Times Roman Bold', className: 'font-serif font-bold' },
  'Times-Italic': { name: 'Times Roman Italic', className: 'font-serif italic' },
  'Times-BoldItalic': { name: 'Times Roman Bold Italic', className: 'font-serif font-bold italic' },
  'Courier': { name: 'Courier', className: 'font-mono' },
  'Courier-Bold': { name: 'Courier Bold', className: 'font-mono font-bold' },
  'Courier-Oblique': { name: 'Courier Italic', className: 'font-mono italic' },
  'Courier-BoldOblique': { name: 'Courier Bold Italic', className: 'font-mono font-bold italic' },
  'Symbol': { name: 'Symbol', className: '' },
  'ZapfDingbats': { name: 'Zapf Dingbats', className: '' },
} as const;


type SignatureFontKey = keyof typeof signatureFonts;


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
  x: number; // position on page in pixels relative to page container
  y: number; // position on page in pixels relative to page container
  content: string; // data URL for image, text content for text
  width: number; // width in pixels
  height: number; // height in pixels
  aspectRatio: number;
  rotation: number; // in degrees
  // properties for text objects
  fontSize?: number;
  color?: ColorName;
  font?: SignatureFontKey;
  // properties for saving
  previewWidthPx?: number;
  previewHeightPx?: number;
};

const DraggableItem = ({
  obj,
  isSelected,
  pageContainerRef,
  onSelect,
  onUpdate,
  onDelete,
  onEdit,
  onDuplicate,
}: {
  obj: DraggableObject;
  isSelected: boolean;
  pageContainerRef: React.RefObject<HTMLDivElement>;
  onSelect: (e: React.MouseEvent, id: number) => void;
  onUpdate: (updatedObj: DraggableObject) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
  onDuplicate: (id: number) => void;
}) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0, objX: 0, objY: 0 });

  const [isResizing, setIsResizing] = useState(false);
  const resizeStartPos = useRef({ x: 0, y: 0, width: 0, height: 0 });
  
  const isInteracting = isDraggingRef.current || isResizing;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLButtonElement || e.target.parentElement instanceof HTMLButtonElement || (e.target as HTMLElement).classList.contains('resize-handle')) {
        return;
    }
    onSelect(e, obj.id);
    e.stopPropagation();
    isDraggingRef.current = true;
    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      objX: obj.x,
      objY: obj.y,
    };
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(e, obj.id);
    setIsResizing(true);
    resizeStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      width: obj.width,
      height: obj.height,
    };
  };

  const handleRotate = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newRotation = (obj.rotation + 90) % 360;
    onUpdate({ ...obj, rotation: newRotation });
  };
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      if (isDraggingRef.current && pageContainerRef.current) {
        const parentRect = pageContainerRef.current.getBoundingClientRect();
        const dx = e.clientX - dragStartPos.current.x;
        const dy = e.clientY - dragStartPos.current.y;
        
        let newX = dragStartPos.current.objX + dx;
        let newY = dragStartPos.current.objY + dy;
        
        // Constrain within parent page boundaries
        newX = Math.max(0, Math.min(newX, parentRect.width - obj.width));
        newY = Math.max(0, Math.min(newY, parentRect.height - obj.height));

        onUpdate({ ...obj, x: newX, y: newY });
      } else if (isResizing) {
          const dx = e.clientX - resizeStartPos.current.x;
          let newWidth = resizeStartPos.current.width + dx;
          newWidth = Math.max(20, newWidth); // min width
          const newHeight = newWidth / obj.aspectRatio;
          onUpdate({ ...obj, width: newWidth, height: newHeight });
      }
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      isDraggingRef.current = false;
      setIsResizing(false);
    };

    if (isDraggingRef.current || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [obj, onUpdate, isResizing, isDraggingRef, pageContainerRef]);

  return (
    <div
      ref={itemRef}
      onMouseDown={handleMouseDown}
      className={cn(
        "group/item absolute cursor-move border border-dashed",
        isSelected ? 'border-primary' : 'border-transparent hover:border-primary/50',
        isInteracting ? 'z-30' : (isSelected ? 'z-20' : 'z-10')
      )}
      style={{
        left: obj.x,
        top: obj.y,
        width: obj.width,
        height: obj.height,
        transform: `rotate(${obj.rotation}deg)`,
      }}
    >
      {obj.type === 'image' ? (
        <Image src={obj.content} alt="signature" layout="fill" />
      ) : (
        <div style={{ fontSize: obj.fontSize, whiteSpace: 'nowrap', color: colorOptions[obj.color || 'black'].value }} className={cn('h-full w-full flex items-center justify-center', obj.font ? signatureFonts[obj.font].className : '')}>{obj.content}</div>
      )}
      
      <div className={cn("absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-md bg-secondary p-1 z-30 opacity-0 transition-opacity", (isSelected || isInteracting) ? "opacity-100" : "group-hover/item:opacity-100")}>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onDuplicate(obj.id)}><Copy className="h-4 w-4"/></Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); handleRotate(e);}}><RotateCw className="h-4 w-4"/></Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEdit(obj.id)}><Edit className="h-4 w-4"/></Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onDelete(obj.id)}><Trash2 className="h-4 w-4"/></Button>
      </div>
      
      {obj.type === 'image' && (
        <div className={cn("opacity-0", isSelected || isInteracting ? "opacity-100" : "group-hover/item:opacity-100")}>
          <div onMouseDown={handleResizeStart} className="resize-handle absolute -bottom-1 -right-1 h-3 w-3 cursor-se-resize rounded-full border border-primary bg-background z-40" />
          <div onMouseDown={handleResizeStart} className="resize-handle absolute -bottom-1 -left-1 h-3 w-3 cursor-sw-resize rounded-full border border-primary bg-background z-40" />
          <div onMouseDown={handleResizeStart} className="resize-handle absolute -top-1 -right-1 h-3 w-3 cursor-ne-resize rounded-full border border-primary bg-background z-40" />
          <div onMouseDown={handleResizeStart} className="resize-handle absolute -top-1 -left-1 h-3 w-3 cursor-nw-resize rounded-full border border-primary bg-background z-40" />
        </div>
      )}
    </div>
  );
};


export default function PdfSignaturePage() {
  const [file, setFile] = useState<File | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [pageDimensions, setPageDimensions] = useState<{width: number, height: number}[]>([]);
  
  const [currentPage, setCurrentPage] = useState(0);
  const [objects, setObjects] = useState<DraggableObject[]>([]);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [processedFile, setProcessedFile] = useState<Blob | null>(null);
  const [isAddTextOpen, setIsAddTextOpen] = useState(false);
  const [isAddSigOpen, setIsAddSigOpen] = useState(false);
  const [isUploadImageOpen, setIsUploadImageOpen] = useState(false);
  
  const [editingObject, setEditingObject] = useState<DraggableObject | null>(null);
  const [selectedObjectId, setSelectedObjectId] = useState<number | null>(null);
  const [signatureColor, setSignatureColor] = useState<ColorName>('black');
  
  const [textPreview, setTextPreview] = useState({ text: '', font: 'Helvetica' as SignatureFontKey, color: 'black' as ColorName, fontSize: 24 });
  
  const [uploadedImage, setUploadedImage] = useState<string|null>(null);
  const [bgColorToRemove, setBgColorToRemove] = useState<{r:number, g:number, b:number}|null>(null);
  const [tolerance, setTolerance] = useState([10]);


  const pageContainerRef = useRef<HTMLDivElement>(null);
  const signaturePadRef = useRef<SignaturePad | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageBgCanvasRef = useRef<HTMLCanvasElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

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
          if(!ctx) return;
          ctx.scale(ratio, ratio);
          
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
  }, [isAddSigOpen, editingObject, signatureColor]);


  const resetState = () => {
    setFile(null);
    setPreviews([]);
    setPageDimensions([]);
    setCurrentPage(0);
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
    setProgress(0);
    
    const startTime = Date.now();
    const minDuration = 3000;

    const renderPromise = (async () => {
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
          }
          setPreviews(pagePreviews);
          setPageDimensions(pageDims);
        } catch (error) {
          toast({ title: 'Error Loading PDF', variant: 'destructive' });
          resetState();
        }
    })();

    const progressInterval = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const p = Math.min((elapsedTime / minDuration) * 100, 100);
        setProgress(p);
    }, 50);

    await Promise.all([renderPromise, new Promise(resolve => setTimeout(resolve, minDuration))]);
    
    clearInterval(progressInterval);
    setProgress(100);
    setIsProcessing(false);
  };

  const handleDragEvents = (e: React.DragEvent<HTMLElement>) => { e.preventDefault(); e.stopPropagation(); };
  const handleDragEnter = (e: React.DragEvent<HTMLElement>) => { setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent<HTMLElement>) => { setIsDragging(false); };
  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    handleDragEvents(e);
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
  };
  
  const handleObjectDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const objectId = parseInt(e.dataTransfer.getData('text/plain'), 10);
    const containerRect = pageContainerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    const draggedObject = objects.find(obj => obj.id === objectId);
    if (!draggedObject) return;
    
    const x = e.clientX - containerRect.left - (draggedObject.width / 2);
    const y = e.clientY - containerRect.top - (draggedObject.height / 2);
    
    const commonProps = {
        pageIndex: currentPage, 
        x: Math.max(0, Math.min(x, containerRect.width - draggedObject.width)),
        y: Math.max(0, Math.min(y, containerRect.height - draggedObject.height)),
        previewWidthPx: containerRect.width,
        previewHeightPx: containerRect.height,
    };
    
    // If dropping from the library, create a copy.
    if (draggedObject.pageIndex === -1) {
      const newObject: DraggableObject = {
        ...draggedObject,
        id: Date.now(),
        ...commonProps,
      };
      setObjects(prev => [...prev, newObject]);
    } else { // Moving an object already on the page
      setObjects(prev => prev.map(obj => 
        obj.id === objectId ? { ...obj, ...commonProps } : obj
      ));
    }
  };

  const handleAddOrUpdateText = () => {
    const text = textPreview.text;
    const { fontSize, color, font } = textPreview;
    if (!text) return;
    
    const tempSpan = document.createElement('span');
    tempSpan.style.font = `${fontSize}px ${signatureFonts[font].className}`;
    tempSpan.style.whiteSpace = 'nowrap';
    tempSpan.style.visibility = 'hidden';
    tempSpan.innerText = text;
    document.body.appendChild(tempSpan);
    const textWidth = tempSpan.offsetWidth;
    const textHeight = tempSpan.offsetHeight;
    document.body.removeChild(tempSpan);


    if (editingObject) {
      setObjects(prev => prev.map(o => o.id === editingObject.id ? { ...o, content: text, fontSize, width: textWidth, height: textHeight, aspectRatio: textWidth / textHeight, color, font } : o));
      setEditingObject(null);
    } else {
      const newObject: DraggableObject = {
        id: Date.now(), type: 'text', pageIndex: -1, x: 50, y: 50, content: text,
        width: textWidth, height: textHeight, aspectRatio: textWidth / textHeight, fontSize, color, font, rotation: 0,
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
        width: 150, height: 75, aspectRatio: 2, color: signatureColor, rotation: 0
      };
      setObjects(prev => [...prev, newObject]);
    }
    setIsAddSigOpen(false);
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        if (!file.type.startsWith('image/')) {
            toast({ title: 'Invalid File Type', variant: 'destructive' });
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setUploadedImage(reader.result as string);
        }
        reader.readAsDataURL(file);
    }
  }

  const handlePickBgColor = (e: React.MouseEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const canvas = document.createElement('canvas');
    const rect = img.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    
    ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);

    const pixelX = Math.floor(x * (img.naturalWidth / rect.width));
    const pixelY = Math.floor(y * (img.naturalHeight / rect.height));

    const pixelData = ctx.getImageData(pixelX, pixelY, 1, 1).data;
    setBgColorToRemove({ r: pixelData[0], g: pixelData[1], b: pixelData[2] });
  };
  
  const addUploadedImage = () => {
    const canvas = imageBgCanvasRef.current;
    const image = new window.Image();
    image.src = uploadedImage!;
    image.onload = () => {
        if(!canvas) return;
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const ctx = canvas.getContext('2d');
        if(!ctx) return;
        
        ctx.drawImage(image, 0, 0);

        if(bgColorToRemove){
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            const toleranceValue = (tolerance[0] / 100) * 255 * 1.732;

             for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                const diff = Math.sqrt(
                    Math.pow(r - bgColorToRemove.r, 2) +
                    Math.pow(g - bgColorToRemove.g, 2) +
                    Math.pow(b - bgColorToRemove.b, 2)
                );

                if (diff < toleranceValue) {
                    data[i + 3] = 0; // Make transparent
                }
            }
            ctx.putImageData(imageData, 0, 0);
        }

        const finalImage = canvas.toDataURL('image/png');
        const newObject: DraggableObject = {
            id: Date.now(), type: 'image', pageIndex: -1, x: 50, y: 50, content: finalImage,
            width: image.width > 200 ? 200 : image.width, height: (image.width > 200 ? 200 : image.width) * (image.height / image.width),
            aspectRatio: image.width / image.height, rotation: 0,
        };
        setObjects(prev => [...prev, newObject]);
        setUploadedImage(null);
        setBgColorToRemove(null);
        setTolerance([10]);
        setIsUploadImageOpen(false);
    }
  }


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
      setTextPreview({
          text: objectToEdit.content,
          font: objectToEdit.font || 'Helvetica',
          color: objectToEdit.color || 'black',
          fontSize: objectToEdit.fontSize || 24,
      });
      setIsAddTextOpen(true);
    } else {
      setSignatureColor(objectToEdit.color || 'black');
      setIsAddSigOpen(true);
    }
  }

  const handleDuplicateObject = (id: number) => {
      const objectToDuplicate = objects.find(o => o.id === id);
      if (!objectToDuplicate) return;
      
      const newObject = { ...objectToDuplicate, id: Date.now(), x: objectToDuplicate.x + 20, y: objectToDuplicate.y + 20 };
      
      if(objectToDuplicate.pageIndex === -1) {
         setObjects(prev => [...prev, newObject]);
      } else {
         const newCopy = { ...objectToDuplicate, id: Date.now(), x: objectToDuplicate.x + 20, y: objectToDuplicate.y + 20 };
         setObjects(prev => [...prev, newCopy]);
      }
  }
  
  const handleSave = async () => {
    if (!file) return;
    setIsProcessing(true);
    setDone(false);
    setProgress(0);

    const startTime = Date.now();
    const minDuration = 3000;

    const savePromise = (async () => {
        try {
            const pdfDoc = await PDFDocument.load(await file.arrayBuffer(), {
                ignoreEncryption: true,
            });
            const objectsToPlace = objects.filter(obj => obj.pageIndex !== -1);
            const embeddedFontCache: Partial<Record<string, PDFFont>> = {};

            for (const obj of objectsToPlace) {
                const page = pdfDoc.getPage(obj.pageIndex);
                const {
                    width: pageWidthPt,
                    height: pageHeightPt
                } = page.getSize();
                const {
                    previewWidthPx,
                    previewHeightPx
                } = obj;

                if (!previewWidthPx || !previewHeightPx) continue;

                const scaleX = pageWidthPt / previewWidthPx;
                const scaleY = pageHeightPt / previewHeightPx;

                const finalWidthPt = obj.width * scaleX;
                const finalHeightPt = obj.height * scaleY;
                const finalYPt = pageHeightPt - obj.y * scaleY - finalHeightPt;
                const finalXPt = obj.x * scaleX;

                if (obj.type === 'text' && obj.fontSize && obj.font) {
                    let fontToEmbed = embeddedFontCache[obj.font];
                    if (!fontToEmbed) {
                        fontToEmbed = await pdfDoc.embedFont(obj.font as StandardFonts);
                        embeddedFontCache[obj.font] = fontToEmbed;
                    }

                    const objColor = colorOptions[obj.color || 'black'].rgb;
                    page.drawText(obj.content, {
                        x: finalXPt,
                        y: finalYPt,
                        font: fontToEmbed,
                        size: obj.fontSize * scaleY,
                        color: rgb(objColor.r, objColor.g, objColor.b),
                        opacity: 1,
                        rotate: degrees(obj.rotation),
                    });
                } else if (obj.type === 'image') {
                    const pngImage = await pdfDoc.embedPng(obj.content);
                    page.drawImage(pngImage, {
                        x: finalXPt,
                        y: finalYPt,
                        width: finalWidthPt,
                        height: finalHeightPt,
                        rotate: degrees(obj.rotation),
                    });
                }
            }

            const pdfBytes = await pdfDoc.save({ useObjectStreams: false });
            setProcessedFile(new Blob([pdfBytes], { type: 'application/pdf' }));
        } catch (error) {
            toast({
                title: 'Error Saving PDF',
                description: 'There was an issue embedding fonts or images.',
                variant: 'destructive',
            });
            console.error(error);
        }
    })();

    const progressInterval = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const p = Math.min((elapsedTime / minDuration) * 100, 100);
        setProgress(p);
    }, 50);

    await Promise.all([savePromise, new Promise(resolve => setTimeout(resolve, minDuration))]);
    clearInterval(progressInterval);
    setIsProcessing(false);
    setDone(true);
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
  
  const handleTextDialogChange = () => {
    if (!formRef.current) return;
    const formData = new FormData(formRef.current);
    const text = formData.get('text-input') as string;
    const font = formData.get('font') as SignatureFontKey;
    const color = formData.get('color') as ColorName;
    const fontSize = parseInt(formData.get('font-size') as string, 10);
    setTextPreview({ text, font, color, fontSize });
  };

  const renderContent = () => {
    if (isProcessing && previews.length === 0) return <div className="flex min-h-[300px] flex-col items-center justify-center space-y-4"><CircularProgress progress={progress} /><p className="text-sm text-muted-foreground">Loading PDF...</p></div>;
    if (isProcessing && previews.length > 0) return <div className="flex min-h-[300px] flex-col items-center justify-center space-y-4"><CircularProgress progress={progress} /><p className="text-sm text-muted-foreground">Saving PDF...</p></div>;
    if (done) return (
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="relative flex items-center justify-center overflow-hidden rounded-lg border bg-muted/20 p-4">
          {previews[0] && (
            <Image
              src={previews[0]}
              alt="Final result preview"
              width={500}
              height={700}
              className="h-auto max-h-full w-auto max-w-full object-contain"
            />
          )}
        </div>
        <div className="flex h-full flex-col items-start justify-center space-y-6">
          <div className="w-full space-y-2 text-center">
            <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
            <h2 className="text-3xl font-bold font-headline">Success!</h2>
            <p className="text-muted-foreground">
              Your document has been processed and is ready.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 pt-4">
            <Button className="w-full" onClick={handleDownload} disabled={!processedFile}>
              <FileDown className="mr-2 h-4 w-4" /> Download PDF
            </Button>
            <Button
              className="w-full"
              variant="secondary"
              onClick={resetState}
            >
              <RefreshCcw className="mr-2 h-4 w-4" /> Start Over
            </Button>
          </div>
          <SharePrompt toolName="PDF Signature Tool" />
        </div>
      </div>
    );

    if (previews.length > 0) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" onClick={(e) => { e.stopPropagation(); setSelectedObjectId(null); }}>
            <div
              className="md:col-span-2 space-y-4 relative"
            >
               {previews.length > 1 && (
                  <div className="flex items-center justify-center gap-4">
                      <Button variant="outline" onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0}>
                          <ChevronLeft className="mr-2 h-4 w-4"/> Previous
                      </Button>
                      <span className="text-sm font-medium text-muted-foreground">
                          Page {currentPage + 1} of {previews.length}
                      </span>
                      <Button variant="outline" onClick={() => setCurrentPage(p => Math.min(previews.length - 1, p + 1))} disabled={currentPage === previews.length - 1}>
                          Next <ChevronRight className="ml-2 h-4 w-4"/>
                      </Button>
                  </div>
              )}
              <div
                ref={pageContainerRef}
                className="relative z-0 border rounded-lg overflow-hidden shadow-md bg-white"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleObjectDrop}
              >
                {previews[currentPage] && (
                  <div data-page-index={currentPage} className="relative">
                    <Image src={previews[currentPage]} alt={`Page ${currentPage + 1}`} width={pageDimensions[currentPage].width} height={pageDimensions[currentPage].height} className="w-full h-auto pointer-events-none" />
                    <div className="absolute top-0 left-0 w-full h-full z-10">
                      {objects.filter(o => o.pageIndex === currentPage).map(obj => (
                          <DraggableItem
                            key={obj.id}
                            obj={obj}
                            isSelected={selectedObjectId === obj.id}
                            pageContainerRef={pageContainerRef}
                            onSelect={(e, id) => { e.stopPropagation(); setSelectedObjectId(id); }}
                            onUpdate={handleUpdateObject}
                            onDelete={handleDeleteObject}
                            onEdit={handleEditObject}
                            onDuplicate={handleDuplicateObject}
                          />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="md:col-span-1 md:sticky md:top-20 self-start space-y-4">
                 <Card>
                    <CardHeader><CardTitle>Tools</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-2 gap-2">
                         <Dialog open={isAddTextOpen} onOpenChange={(open) => { if (!open) setEditingObject(null); setIsAddTextOpen(open); }}>
                            <DialogTrigger asChild><Button variant="outline" className="w-full"><Type className="mr-2"/>Text</Button></DialogTrigger>
                            <DialogContent>
                                <DialogHeader><DialogTitle>{editingObject ? 'Edit' : 'Add'} Text</DialogTitle></DialogHeader>
                                <form ref={formRef} className="space-y-4" onChange={handleTextDialogChange} onSubmit={(e) => e.preventDefault()}>
                                    <div className="space-y-2"><Label htmlFor="text-input">Text</Label><Input id="text-input" name="text-input" defaultValue={editingObject?.content || ''}/></div>
                                    <div className="p-4 border rounded-md min-h-[60px] flex items-center justify-center bg-muted/50">
                                        <p style={{fontSize: textPreview.fontSize, color: colorOptions[textPreview.color].value}} className={cn(signatureFonts[textPreview.font].className)}>{textPreview.text || "Preview"}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="font-size">Font Size</Label><Input id="font-size" name="font-size" type="number" defaultValue={editingObject?.fontSize || 24} /></div><div className="space-y-2"><Label htmlFor="font">Font Style</Label><Select name="font" defaultValue={editingObject?.font || 'Helvetica'}><SelectTrigger id="font"><SelectValue/></SelectTrigger><SelectContent>{Object.entries(signatureFonts).map(([key, { name, className }]) => <SelectItem key={key} value={key} className={className}>{name}</SelectItem>)}</SelectContent></Select></div></div>
                                    <div className="space-y-2"><Label>Color</Label><RadioGroup name="color" defaultValue={editingObject?.color || 'black'} className="flex gap-4">{Object.entries(colorOptions).map(([key, {name, value}]) => <div key={key} className="flex items-center space-x-2"><RadioGroupItem value={key} id={`text-${key}`}/><Label htmlFor={`text-${key}`} style={{color: value}}>{name}</Label></div>)}</RadioGroup></div>
                                    <DialogClose asChild><Button type="button" onClick={handleAddOrUpdateText} className="w-full">{editingObject ? 'Update' : 'Add'} Text</Button></DialogClose>
                                </form>
                            </DialogContent>
                        </Dialog>
                         <Dialog open={isAddSigOpen} onOpenChange={(open) => { if (!open) setEditingObject(null); setIsAddSigOpen(open); }}>
                            <DialogTrigger asChild><Button variant="outline" className="w-full"><PenLine className="mr-2"/>Signature</Button></DialogTrigger>
                            <DialogContent><DialogHeader><DialogTitle>{editingObject ? 'Edit' : 'Draw'} Signature</DialogTitle></DialogHeader><div className="space-y-4"><canvas ref={canvasRef} className="border rounded-md w-full h-48 bg-gray-50" /> <div className="space-y-2"><Label>Color</Label><RadioGroup value={signatureColor} onValueChange={(v) => setSignatureColor(v as ColorName)} className="flex gap-4">{Object.entries(colorOptions).map(([key, {name, value}]) => <div key={key} className="flex items-center space-x-2"><RadioGroupItem value={key} id={`sig-${key}`}/><Label htmlFor={`sig-${key}`} style={{color: value}}>{name}</Label></div>)}</RadioGroup></div><div className="flex gap-2"><Button onClick={handleAddOrUpdateSignature} className="w-full">{editingObject ? 'Update' : 'Add'}</Button><Button variant="secondary" onClick={() => signaturePadRef.current?.clear()}>Clear</Button></div></div></DialogContent>
                        </Dialog>
                         <Dialog open={isUploadImageOpen} onOpenChange={setIsUploadImageOpen}>
                           <DialogTrigger asChild><Button variant="outline" className="w-full col-span-2"><Upload className="mr-2"/>Image</Button></DialogTrigger>
                           <DialogContent className="max-w-2xl">
                               <DialogHeader><DialogTitle>Upload & Prepare Image</DialogTitle></DialogHeader>
                               {!uploadedImage ? (
                                   <label htmlFor="image-upload" className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 text-center transition-colors"><UploadCloud className="h-12 w-12 text-muted-foreground" /><p className="mt-4 text-muted-foreground">Click to browse or drag & drop</p><Input id="image-upload" type="file" className="sr-only" onChange={handleImageUpload} accept="image/*" /></label>
                               ) : (
                                   <div className="space-y-4">
                                       <div className="mx-auto flex h-64 w-full max-w-sm items-center justify-center overflow-hidden rounded-lg border">
                                          <Image src={uploadedImage} alt="Uploaded signature" width={300} height={200} className="h-auto max-h-full w-auto max-w-full cursor-crosshair object-contain" onClick={handlePickBgColor} />
                                       </div>
                                       <Card>
                                           <CardContent className="space-y-4 p-4">
                                               <p className="text-sm text-muted-foreground text-center">Optional: Click the image background to select a color to make transparent.</p>
                                               {bgColorToRemove && <div className="flex items-center gap-4 rounded-lg border p-2"><div className="flex flex-1 items-center gap-3"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border" style={{ backgroundColor: `rgb(${bgColorToRemove.r}, ${bgColorToRemove.g}, ${bgColorToRemove.b})` }}><Palette className="h-5 w-5 mix-blend-difference" style={{ color: 'white'}} /></div><div className="text-sm"><div className="font-medium text-muted-foreground">{`rgb(${bgColorToRemove.r}, ${bgColorToRemove.g}, ${bgColorToRemove.b})`}</div></div></div><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setBgColorToRemove(null)}><X className="h-4 w-4" /></Button></div>}
                                               <div className="space-y-2"><Label htmlFor="tolerance">Tolerance: {tolerance[0]}%</Label><Slider id="tolerance" min={0} max={100} step={1} value={tolerance} onValueChange={setTolerance} disabled={!bgColorToRemove}/></div>
                                                <canvas ref={imageBgCanvasRef} className="hidden" />
                                           </CardContent>
                                       </Card>
                                       <Button onClick={addUploadedImage} className="w-full">Add Image to Objects</Button>
                                   </div>
                               )}
                           </DialogContent>
                         </Dialog>
                    </CardContent>
                 </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Object Library</CardTitle>
                        <CardDescription>Drag items onto the document.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                         {objects.filter(o => o.pageIndex === -1).map(obj => (
                            <div key={obj.id} draggable onDragStart={(e) => { e.dataTransfer.setData('text/plain', obj.id.toString()); setSelectedObjectId(obj.id); }} className="border p-2 rounded-md cursor-grab flex items-center gap-2 bg-secondary/50">
                                {obj.type === 'text' ? (
                                    <div className="h-8 w-12 flex items-center justify-center bg-background rounded-sm"><Type className="h-5 w-5 shrink-0"/></div>
                                ) : (
                                    <div className="h-8 w-12 relative bg-background rounded-sm"><Image src={obj.content} alt="sig preview" layout="fill" objectFit="contain" /></div>
                                )}
                                <p className="truncate text-sm flex-1">{obj.type === 'text' ? obj.content : "Signature"}</p>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDeleteObject(obj.id)}><Trash2 className="h-4 w-4"/></Button>
                            </div>
                        ))}
                        {objects.filter(o => o.pageIndex === -1).length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">Your created objects will appear here.</p>
                        )}
                    </CardContent>
                </Card>

                 <div className="flex flex-col gap-2 pt-4">
                    {(objects.some(o => o.pageIndex !== -1) || previews.length > 0) && (
                        <Button onClick={handleSave} size="lg" className="w-full">Save Changes</Button>
                    )}
                    <Button variant="outline" onClick={resetState} className="w-full">
                        <RefreshCcw className="mr-2 h-4 w-4" /> Start Over
                    </Button>
                 </div>
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
              Draw, type, or upload a signature and place it on your PDF. Add text to fill out forms.
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
            <li><strong>Add Objects:</strong> Use the "Text", "Signature", or "Image" buttons to create items. They will appear in the Object Library.</li>
            <li><strong>Position Objects:</strong> Drag your created text or signature from the library and drop it onto the desired location on any page.</li>
            <li><strong>Manipulate Objects:</strong> Hover over an object on the page to see controls to Duplicate, Rotate, Edit, or Delete it. Click an object to select it, then click and drag to move it. Image objects will show resize handles when selected.</li>
            <li><strong>Save and Download:</strong> Once you've placed all your objects, click "Save Changes" to generate and download your new PDF.</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

    