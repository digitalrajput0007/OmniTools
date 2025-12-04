
import type { Metadata } from 'next';
import CompressPdfClientPage from './client-page';

export const metadata: Metadata = {
  title: 'Compress PDF Online - Reduce PDF File Size for Free | Online JPG PDF',
  description: 'Easily compress your PDF files to a smaller size online. Our free tool reduces PDF size while maintaining quality, making them easier to share and store.',
};

export default function CompressPdfPage() {
  return <CompressPdfClientPage />;
}
