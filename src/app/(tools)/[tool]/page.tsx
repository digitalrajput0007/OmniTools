
import { tools } from '@/lib/constants';
import { notFound } from 'next/navigation';
import type { Metadata, ResolvingMetadata } from 'next';
import ToolClientPage from './client-page';

type Props = {
  params: { tool: string };
};

export function generateStaticParams() {
  return tools.map((tool) => ({
    tool: tool.path.substring(1),
  }));
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const toolSlug = params.tool;
  const tool = tools.find((t) => t.path === `/` + toolSlug);

  if (!tool) {
    return {
      title: 'Tool Not Found',
    };
  }

  const toolDescriptions: { [key: string]: string } = {
    '/image-compressor': 'Compress JPG, PNG, and GIF images online to reduce their file size without losing quality. Our free and fast image compressor makes your website faster.',
    '/image-format-converter': 'Convert images to and from JPG, PNG, WEBP, and more. Free online image converter that works in your browser.',
    '/image-resizer': 'Resize and crop images online for free. Adjust image dimensions for social media, websites, or any other need.',
    '/background-remover': 'Automatically remove the background from any image with our free AI-powered tool. Get a transparent background in seconds.',
    '/images-to-pdf': 'Combine multiple images (JPG, PNG, etc.) into a single, easy-to-share PDF file. Free and unlimited.',
    '/pdf-to-images': 'Convert each page of a PDF file into separate high-quality JPG or PNG images. Free and easy to use.',
    '/pdf-merger': 'Merge multiple PDF files into a single document online for free. Combine reports, presentations, and more.',
    '/pdf-splitter': 'Extract one or more pages from a PDF file. Split a large PDF into smaller documents or individual pages.',
    '/compress-pdf': 'Reduce the file size of your PDF documents online for free. Optimize PDFs for email or web sharing without losing quality.',
    '/reorder-rotate-pdf': 'Easily reorder and rotate pages in your PDF documents. Organize your PDF exactly how you want it.',
    '/pdf-signature': 'Sign PDF documents online for free. Draw, type, or upload your signature to fill and sign any PDF.',
    '/extract-text-pdf': 'Extract all text from a PDF file using OCR technology. Make content from your PDFs editable and searchable.',
    '/watermark-pdf': 'Add a text or image watermark to your PDF files. Protect your documents with a custom watermark.',
    '/dummy-file-generator': 'Generate dummy files of a specific size (e.g., 10MB PDF, 50KB DOCX) for testing and development purposes.',
    '/qr-code-generator': 'Create free QR codes for URLs, text, Wi-Fi, and more. Customize and download your QR code instantly.',
    '/unit-converter': 'A comprehensive online unit converter for length, weight, temperature, and more. Quick and accurate conversions.',
    '/json-beautifier': 'Format and beautify messy JSON code to make it readable and easy to debug. Free online JSON formatter.',
    '/text-tools': 'A suite of text tools to count words, change case (uppercase, lowercase, etc.), and remove extra spaces.',
    '/text-diff': 'Compare two blocks of text to find the differences. Our online diff tool highlights added and removed text.',
    '/credit-card-generator': 'Generate valid, fake credit card numbers for testing and development. Supports Visa, Mastercard, and more.',
    '/random-data-generator': 'Create random dummy data for your application. Generate names, emails, addresses, and more for testing.',
    '/random-picker': 'A free online tool to pick a random winner from a list of names. Perfect for giveaways and contests.',
  };

  const title = `${tool.name} - Free Online Tool`;
  const description = toolDescriptions[tool.path] || tool.description;
  const previousImages = (await parent).openGraph?.images || [];
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://onlinejpgpdf.com';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}${tool.path}`,
      siteName: 'Online JPG PDF',
      images: [...previousImages],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [...previousImages],
    },
    alternates: {
      canonical: `${baseUrl}${tool.path}`,
    }
  };
}

export default function ToolPage({ params }: Props) {
  const toolSlug = params.tool;
  const tool = tools.find((t) => t.path === `/` + toolSlug);

  if (!tool) {
    notFound();
  }

  return <ToolClientPage toolSlug={toolSlug} />;
}
