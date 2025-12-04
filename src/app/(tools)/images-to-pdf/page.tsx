
import type { Metadata } from 'next';
import ImagesToPdfClientPage from './client-page';

export const metadata: Metadata = {
  title: 'Images to PDF Converter - Merge JPG, PNG to PDF Online | Online JPG PDF',
  description: 'Convert images to PDF files instantly. Free, fast, and secure tool to merge JPG, PNG, and other image formats into a single PDF.',
};

export default function ImagesToPdfPage() {
  return <ImagesToPdfClientPage />;
}
