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
    name: 'Image to PDF',
    description: 'Convert your JPG, PNG, and other images to PDF.',
    path: '/image-to-pdf',
    icon: FileText,
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

export const AppLogo = Combine;
export const AppName = 'OmniToolbox';
