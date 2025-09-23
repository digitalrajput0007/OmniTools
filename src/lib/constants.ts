
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
  Droplets,
  FilePlus2,
} from 'lucide-react';

export type Tool = {
  name: string;
  description: string;
  path: string;
  icon: LucideIcon;
  related?: string[];
};

export const tools: Tool[] = [
  {
    name: 'Image Compressor',
    description: 'Reduce image file sizes with optimal quality.',
    path: '/image-compressor',
    icon: Minimize,
    related: ['/image-format-converter', '/image-resizer', '/images-to-pdf'],
  },
  {
    name: 'Image Format Converter',
    description: 'Change the format of your images (e.g., JPG, PNG, WEBP).',
    path: '/image-format-converter',
    icon: Replace,
    related: ['/image-compressor', '/image-resizer', '/images-to-pdf'],
  },
  {
    name: 'Image Resizer/Cropper',
    description: 'Easily resize and crop your images to the perfect dimensions.',
    path: '/image-resizer',
    icon: Scaling,
    related: ['/image-compressor', '/background-remover', '/image-format-converter'],
  },
  {
    name: 'Background Remover',
    description: 'Use AI to automatically remove the background from an image.',
    path: '/background-remover',
    icon: Wand2,
    related: ['/image-resizer', '/watermark-pdf', '/images-to-pdf'],
  },
  {
    name: 'Images to PDF',
    description: 'Convert JPG, PNG, and other images to a single PDF file.',
    path: '/images-to-pdf',
    icon: ImageIcon,
    related: ['/pdf-to-images', '/pdf-merger', '/image-compressor'],
  },
  {
    name: 'PDF to Images',
    description: 'Extract all images from a PDF or convert pages to JPG.',
    path: '/pdf-to-images',
    icon: FileImage,
    related: ['/images-to-pdf', '/pdf-splitter', '/extract-text-pdf'],
  },
  {
    name: 'PDF Merger',
    description: 'Combine multiple PDF files into one single document.',
    path: '/pdf-merger',
    icon: CopyPlus,
    related: ['/pdf-splitter', '/compress-pdf', '/reorder-rotate-pdf'],
  },
  {
    name: 'PDF Splitter',
    description: 'Extract pages from a PDF or save each page as a new PDF.',
    path: '/pdf-splitter',
    icon: Scissors,
    related: ['/pdf-merger', '/extract-text-pdf', '/reorder-rotate-pdf'],
  },
  {
    name: 'Compress PDF',
    description: 'Reduce the file size of your PDF while maintaining quality.',
    path: '/compress-pdf',
    icon: Minimize2,
    related: ['/pdf-merger', '/pdf-splitter', '/image-compressor'],
  },
  {
    name: 'Reorder / Rotate Pages',
    description: 'Organize or rotate pages in your PDF documents easily.',
    path: '/reorder-rotate-pdf',
    icon: RotateCw,
    related: ['/pdf-splitter', '/pdf-merger', '/pdf-signature'],
  },
   {
    name: 'Add Signature / Fill Form',
    description: 'Sign documents electronically or fill out PDF forms online.',
    path: '/pdf-signature',
    icon: PenSquare,
    related: ['/watermark-pdf', '/reorder-rotate-pdf', '/pdf-merger'],
  },
   {
    name: 'Extract Text',
    description: 'Extract all text content from a PDF file using OCR.',
    path: '/extract-text-pdf',
    icon: ScanText,
    related: ['/pdf-to-images', '/pdf-splitter', '/text-tools'],
  },
  {
    name: 'Watermark PDF',
    description: 'Add a text or image watermark to your PDF documents.',
    path: '/watermark-pdf',
    icon: Droplets,
    related: ['/pdf-signature', '/compress-pdf', '/reorder-rotate-pdf'],
  },
  {
    name: 'Dummy File Generator',
    description: 'Create dummy files (PDF, Word, Excel) of a specific size.',
    path: '/dummy-file-generator',
    icon: FilePlus2,
    related: ['/random-data-generator', '/credit-card-generator', '/qr-code-generator'],
  },
  {
    name: 'QR Code Generator',
    description: 'Create custom QR codes for URLs, text, and more.',
    path: '/qr-code-generator',
    icon: QrCode,
    related: ['/random-data-generator', '/unit-converter', '/dummy-file-generator'],
  },
  {
    name: 'Unit Converter',
    description: 'Quickly convert between different units of measurement.',
    path: '/unit-converter',
    icon: Scale,
    related: ['/text-tools', '/qr-code-generator', '/random-data-generator'],
  },
  {
    name: 'JSON Beautifier',
    description: 'Format and beautify your JSON data for readability.',
    path: '/json-beautifier',
    icon: Braces,
    related: ['/text-diff', '/random-data-generator', '/text-tools'],
  },
  {
    name: 'Text Tools',
    description: 'Count words, change case, and remove extra spaces.',
    path: '/text-tools',
    icon: ALargeSmall,
    related: ['/text-diff', '/json-beautifier', '/extract-text-pdf'],
  },
  {
    name: 'Text Difference',
    description: 'Compare two texts and highlight the differences.',
    path: '/text-diff',
    icon: Diff,
    related: ['/text-tools', '/json-beautifier', '/pdf-merger'],
  },
  {
    name: 'Credit Card Generator',
    description: 'Generate dummy credit card numbers for testing.',
    path: '/credit-card-generator',
    icon: CreditCard,
    related: ['/random-data-generator', '/dummy-file-generator', '/json-beautifier'],
  },
  {
    name: 'Random Data Generator',
    description: 'Create dummy data like names, emails, and addresses.',
    path: '/random-data-generator',
    icon: DatabaseZap,
    related: ['/credit-card-generator', '/dummy-file-generator', '/random-picker'],
  },
  {
    name: 'Random Picker',
    description: 'Randomly select an item from a list.',
    path: '/random-picker',
    icon: Ticket,
    related: ['/random-data-generator', '/credit-card-generator', '/text-tools'],
  },
];


export const AppName = 'Online JPG PDF';
export const ShareIcon = Share2;
