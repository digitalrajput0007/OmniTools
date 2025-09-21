
import type { LucideIcon } from 'lucide-react';
import {
  Combine,
  CopyPlus,
  Crop,
  FileOutput,
  FileText,
  Minimize,
  QrCode,
  Replace,
  Scale,
  Scissors,
  Scaling,
  Wand2,
  ALargeSmall,
  Diff,
  CreditCard,
  DatabaseZap,
  Ticket,
  Braces,
  Share2,
  FileImage,
  ImageIcon,
  Minimize2,
  RotateCw,
  KeyRound,
  PenSquare,
  ScanText,
  Droplets
} from 'lucide-react';

export type Tool = {
  name: string;
  description: string;
  path: string;
  icon: LucideIcon;
};

export const tools: Tool[] = [
  {
    name: 'Image Compressor',
    description: 'Reduce image file sizes with optimal quality.',
    path: '/image-compressor',
    icon: Minimize,
  },
  {
    name: 'Image Format Converter',
    description: 'Change the format of your images (e.g., JPG, PNG, WEBP).',
    path: '/image-format-converter',
    icon: Replace,
  },
  {
    name: 'Image Resizer/Cropper',
    description: 'Easily resize and crop your images to the perfect dimensions.',
    path: '/image-resizer',
    icon: Scaling,
  },
  {
    name: 'Background Remover',
    description: 'Use AI to automatically remove the background from an image.',
    path: '/background-remover',
    icon: Wand2,
  },
  {
    name: 'Images to PDF',
    description: 'Convert JPG, PNG, and other images to a single PDF file.',
    path: '/images-to-pdf',
    icon: ImageIcon,
  },
  {
    name: 'PDF to Images',
    description: 'Extract all images from a PDF or convert pages to JPG.',
    path: '/pdf-to-images',
    icon: FileImage,
  },
  {
    name: 'PDF Merger',
    description: 'Combine multiple PDF files into one single document.',
    path: '/pdf-merger',
    icon: CopyPlus,
  },
  {
    name: 'PDF Splitter',
    description: 'Extract pages from a PDF or save each page as a new PDF.',
    path: '/pdf-splitter',
    icon: Scissors,
  },
  {
    name: 'Compress PDF',
    description: 'Reduce the file size of your PDF while maintaining quality.',
    path: '/compress-pdf',
    icon: Minimize2,
  },
  {
    name: 'Reorder / Rotate Pages',
    description: 'Organize or rotate pages in your PDF documents easily.',
    path: '/reorder-rotate-pdf',
    icon: RotateCw,
  },
   {
    name: 'Add Signature / Fill Form',
    description: 'Sign documents electronically or fill out PDF forms online.',
    path: '/pdf-signature',
    icon: PenSquare,
  },
   {
    name: 'Extract Text',
    description: 'Extract all text content from a PDF file using OCR.',
    path: '/extract-text-pdf',
    icon: ScanText,
  },
  {
    name: 'Watermark PDF',
    description: 'Add a text or image watermark to your PDF documents.',
    path: '/watermark-pdf',
    icon: Droplets,
  },
  {
    name: 'QR Code Generator',
    description: 'Create custom QR codes for URLs, text, and more.',
    path: '/qr-code-generator',
    icon: QrCode,
  },
  {
    name: 'Unit Converter',
    description: 'Quickly convert between different units of measurement.',
    path: '/unit-converter',
    icon: Scale,
  },
  {
    name: 'JSON Beautifier',
    description: 'Format and beautify your JSON data for readability.',
    path: '/json-beautifier',
    icon: Braces,
  },
  {
    name: 'Text Tools',
    description: 'Count words, change case, and remove extra spaces.',
    path: '/text-tools',
    icon: ALargeSmall,
  },
  {
    name: 'Text Difference',
    description: 'Compare two texts and highlight the differences.',
    path: '/text-diff',
    icon: Diff,
  },
  {
    name: 'Credit Card Generator',
    description: 'Generate dummy credit card numbers for testing.',
    path: '/credit-card-generator',
    icon: CreditCard,
  },
  {
    name: 'Random Data Generator',
    description: 'Create dummy data like names, emails, and addresses.',
    path: '/random-data-generator',
    icon: DatabaseZap,
  },
  {
    name: 'Random Picker',
    description: 'Randomly select an item from a list.',
    path: '/random-picker',
    icon: Ticket,
  },
];


export const AppName = 'Online JPG PDF';
export const ShareIcon = Share2;
