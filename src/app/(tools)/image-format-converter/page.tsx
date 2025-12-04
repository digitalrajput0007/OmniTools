
import type { Metadata } from 'next';
import ImageFormatConverterClientPage from './client-page';

export const metadata: Metadata = {
  title: 'Image Format Converter - Convert JPG, PNG, and WEBP Online | Online JPG PDF',
  description: 'Convert images between formats like JPG, PNG, and WEBP. Change image types online for free with our fast and easy-to-use image converter.',
};

export default function ImageFormatConverterPage() {
  return <ImageFormatConverterClientPage />;
}
