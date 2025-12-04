
import type { Metadata } from 'next';
import DummyFileGeneratorClientPage from './client-page';

export const metadata: Metadata = {
  title: 'Dummy File Generator - Create Sample Files of Any Size | Online JPG PDF',
  description: 'Generate dummy files of any size and format instantly. Perfect for testing uploads, bandwidth, or file storage applications.',
};

export default function DummyFileGeneratorPage() {
  return <DummyFileGeneratorClientPage />;
}
