
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

export const iconColors = [
    { bg: 'bg-rose-500/10', text: 'text-rose-500', tw: 'rose-500' },
    { bg: 'bg-sky-500/10', text: 'text-sky-500', tw: 'sky-500' },
    { bg: 'bg-emerald-500/10', text: 'text-emerald-500', tw: 'emerald-500' },
    { bg: 'bg-amber-500/10', text: 'text-amber-500', tw: 'amber-500' },
    { bg: 'bg-violet-500/10', text: 'text-violet-500', tw: 'violet-500' },
    { bg: 'bg-lime-500/10', text: 'text-lime-500', tw: 'lime-500' },
    { bg: 'bg-pink-500/10', text: 'text-pink-500', tw: 'pink-500' },
    { bg: 'bg-cyan-500/10', text: 'text-cyan-500', tw: 'cyan-500' },
    { bg: 'bg-fuchsia-500/10', text: 'text-fuchsia-500', tw: 'fuchsia-500' },
    { bg: 'bg-orange-500/10', text: 'text-orange-500', tw: 'orange-500' },
    { bg: 'bg-teal-500/10', text: 'text-teal-500', tw: 'teal-500' },
    { bg: 'bg-indigo-500/10', text: 'text-indigo-500', tw: 'indigo-500' },
    { bg: 'bg-red-500/10', text: 'text-red-500', tw: 'red-500' },
    { bg: 'bg-blue-500/10', text: 'text-blue-500', tw: 'blue-500' },
    { bg: 'bg-yellow-500/10', text: 'text-yellow-500', tw: 'yellow-500' },
  ];

export const toolDescriptions: { [key: string]: string } = {
  '/image-compressor': 'Compress JPG, PNG, and GIF images online to reduce their file size without losing quality. Our free and fast image compressor makes your website faster.',
  '/image-format-converter': 'Convert images between formats like JPG, PNG, and WEBP. Change image types online for free with our fast and easy-to-use image converter.',
  '/background-remover': 'Automatically remove the background from your images with our AI-powered tool. Get a transparent background for free and without watermarks.',
  '/images-to-pdf': 'Combine multiple images (JPG, PNG, etc.) into a single, easy-to-share PDF document. Free and secure online image to PDF converter.',
  '/pdf-to-images': 'Convert each page of a PDF document into a separate high-quality JPG image. Extract images from your PDF files for free.',
  '/pdf-merger': 'Merge multiple PDF documents into one single file. Combine reports, invoices, or other documents quickly and securely online.',
  '/pdf-splitter': 'Extract one or more pages from a PDF file. Split a large PDF into smaller, more manageable documents with our free online tool.',
  '/compress-pdf': 'Reduce the file size of your PDF documents. Our PDF compressor makes files smaller for easier emailing and sharing, while maintaining quality.',
  '/reorder-rotate-pdf': 'Easily reorder the pages of your PDF document by dragging and dropping. Rotate individual pages to fix their orientation.',
  '/pdf-signature': 'Sign PDF documents online for free. Draw, type, or upload your signature to sign documents without printing or scanning.',
  '/extract-text-pdf': 'Extract text from your PDF files with our free online OCR tool. Make the content of your PDFs editable and searchable.',
  '/watermark-pdf': 'Add a text or image watermark to your PDF documents to protect your work. Customize the opacity, rotation, and position of your watermark.',
  '/qr-code-generator': 'Generate QR codes for URLs, text, Wi-Fi networks, and more. Our free QR code generator is fast, easy, and requires no sign-up.',
  '/unit-converter': 'Convert between various units of measurement for length, weight, temperature, and more. A simple and fast online unit converter for all your needs.',
  '/text-tools': 'A suite of text utilities including word count, character count, case converter (uppercase, lowercase, title case), and space remover.',
  '/text-diff': 'Compare two blocks of text to find the differences. Our text difference checker highlights added and removed text for easy comparison.',
  '/credit-card-generator': 'Generate valid, but fake, credit card numbers for testing and development purposes. Ideal for testing payment forms without using real data.',
  '/random-data-generator': 'Create sets of random data including names, emails, addresses, and more. Perfect for populating databases or UIs for testing.',
  '/random-picker': 'A fun and fair tool to randomly pick a winner from a list of names. Use it for contests, giveaways, or any random selection need.',
  '/json-beautifier': 'Format your messy JSON code to make it readable and pretty. Our JSON beautifier helps you debug and validate your JSON data.',
  '/dummy-file-generator': 'Create dummy files of a specific size and format (e.g., PDF, DOCX, XLSX) for testing upload functionalities or storage limits.'
};
