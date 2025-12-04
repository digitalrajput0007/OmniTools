
import type { Metadata } from 'next';
import ImageCompressorClientPage from './client-page';

export const metadata: Metadata = {
  title: 'Image Compressor - Compress JPG, PNG, and WebP Online | Online JPG PDF',
  description: 'Compress images online without losing quality. Reduce image size instantly with Online JPG PDF’s free image compressor tool.',
};

export default function ImageCompressorPage() {
  return <ImageCompressorClientPage />;
}
