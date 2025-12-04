
'use client';

import { notFound } from 'next/navigation';
import BackgroundRemoverPage from '../background-remover/client-page';
import CompressPdfPage from '../compress-pdf/client-page';
import CreditCardGeneratorPage from '../credit-card-generator/page';
import DummyFileGeneratorPage from '../dummy-file-generator/client-page';
import ExtractTextPdfPage from '../extract-text-pdf/page';
import ImageCompressorPage from '../image-compressor/client-page';
import ImageFormatConverterPage from '../image-format-converter/client-page';
import ImageResizerPage from '../image-resizer/page';
import ImagesToPdfPage from '../images-to-pdf/client-page';
import JsonBeautifierPage from '../json-beautifier/page';
import PdfMergerPage from '../pdf-merger/page';
import PdfSignaturePage from '../pdf-signature/page';
import PdfSplitterPage from '../pdf-splitter/page';
import PdfToImagesPage from '../pdf-to-images/page';
import QrCodeGeneratorPage from '../qr-code-generator/page';
import RandomDataGeneratorPage from '../random-data-generator/page';
import RandomPickerPage from '../random-picker/page';
import ReorderRotatePdfPage from '../reorder-rotate-pdf/page';
import TextDiffPage from '../text-diff/page';
import TextToolsPage from '../text-tools/page';
import UnitConverterPage from '../unit-converter/page';
import WatermarkPdfPage from '../watermark-pdf/page';

const toolPageMap: { [key: string]: React.ComponentType } = {
  'background-remover': BackgroundRemoverPage,
  'compress-pdf': CompressPdfPage,
  'credit-card-generator': CreditCardGeneratorPage,
  'dummy-file-generator': DummyFileGeneratorPage,
  'extract-text-pdf': ExtractTextPdfPage,
  'image-compressor': ImageCompressorPage,
  'image-format-converter': ImageFormatConverterPage,
  'image-resizer': ImageResizerPage,
  'images-to-pdf': ImagesToPdfPage,
  'json-beautifier': JsonBeautifierPage,
  'pdf-merger': PdfMergerPage,
  'pdf-signature': PdfSignaturePage,
  'pdf-splitter': PdfSplitterPage,
  'pdf-to-images': PdfToImagesPage,
  'qr-code-generator': QrCodeGeneratorPage,
  'random-data-generator': RandomDataGeneratorPage,
  'random-picker': RandomPickerPage,
  'reorder-rotate-pdf': ReorderRotatePdfPage,
  'text-diff': TextDiffPage,
  'text-tools': TextToolsPage,
  'unit-converter': UnitConverterPage,
  'watermark-pdf': WatermarkPdfPage,
};

interface ToolClientPageProps {
    toolSlug: string;
}

export default function ToolClientPage({ toolSlug }: ToolClientPageProps) {
  const ToolComponent = toolPageMap[toolSlug];

  if (!ToolComponent) {
    notFound();
  }

  return <ToolComponent />;
}
