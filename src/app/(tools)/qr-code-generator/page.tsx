
'use client';

import type { Metadata } from 'next';
import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDebounce } from '@/hooks/use-debounce';
import { FileDown, Link as LinkIcon } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { SharePrompt } from '@/components/ui/share-prompt';

export const metadata: Metadata = {
  title: 'Free QR Code Generator - Create QR Codes Online',
  description: 'Generate custom QR codes for URLs, text, contact information, and more for free. Our online QR code generator is fast, easy to use, and works instantly.',
  openGraph: {
    title: 'Free QR Code Generator - Create QR Codes Online',
    description: 'Generate custom QR codes for URLs, text, contact information, and more for free. Our online QR code generator is fast, easy to use, and works instantly.',
    url: '/qr-code-generator',
    type: 'website',
  },
};

export default function QrCodeGeneratorPage() {
  const [text, setText] = useState('https://omnibox.dev');
  const debouncedText = useDebounce(text, 300);

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    debouncedText
  )}`;

  const handleDownload = () => {
    fetch(qrUrl)
      .then((response) => response.blob())
      .then((blob) => {
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `qrcode-${debouncedText}.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(blobUrl);
        document.body.removeChild(a);
      })
      .catch(() => alert('Could not download QR Code.'));
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="text-center">
            <CardTitle className="text-3xl font-bold tracking-tight lg:text-4xl">Free Online QR Code Generator</CardTitle>
            <CardDescription className="text-base mt-2">
              Enter text or a URL to generate a QR code instantly.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <Label htmlFor="qr-text">Text or URL</Label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="qr-text"
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter text or URL"
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Your QR code will update automatically as you type.
              </p>
            </div>
            <div className="flex flex-col items-center justify-center space-y-4 rounded-lg bg-muted/50 p-6">
              {debouncedText ? (
                <>
                  <div className="rounded-lg bg-white p-2 shadow-md">
                    <Image
                      src={qrUrl}
                      alt="Generated QR Code"
                      width={250}
                      height={250}
                      className="rounded-md"
                      unoptimized // External dynamic image
                    />
                  </div>
                  <Button onClick={handleDownload} variant="secondary">
                    <FileDown className="mr-2 h-4 w-4" />
                    Download QR Code
                  </Button>
                  <SharePrompt toolName="QR Code Generator" />
                </>
              ) : (
                <div className="text-center text-muted-foreground">
                  <p>Enter some text to generate a QR code.</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>About the QR Code Generator</CardTitle>
          <CardDescription>
            Discover how QR codes can bridge the gap between the physical and digital worlds.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Accordion type="single" collapsible defaultValue="item-1">
            <AccordionItem value="item-1">
              <AccordionTrigger>What is a QR Code?</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <p>
                  A QR (Quick Response) code is a two-dimensional barcode that can store various types of information, such as a website URL, text, contact information, or Wi-Fi network credentials. It can be quickly scanned by a smartphone camera, providing an instant link between the physical world and digital content.
                </p>
                <p>
                  They are commonly used on posters, business cards, product packaging, and restaurant menus to provide quick access to websites, promotions, and other online resources.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>How to Use the QR Code Generator</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <ol className="list-decimal list-inside space-y-2">
                  <li><strong>Enter Your Data:</strong> In the "Text or URL" input field, type or paste the information you want to encode. This is most commonly a website address (e.g., https://example.com).</li>
                  <li><strong>Instant Generation:</strong> The QR code image on the right will update in real-time as you type.</li>
                  <li><strong>Test Your QR Code:</strong> Point your smartphone's camera at the generated QR code to ensure it scans correctly and directs to the right destination.</li>
                  <li><strong>Download:</strong> Click the "Download QR Code" button to save the generated code as a high-quality PNG image file, ready to be used in your designs.</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Tips for Effective QR Codes</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Keep it Simple:</strong> While QR codes can store a lot of text, they become more complex and harder to scan as the data increases. For best results, use shortened URLs if possible.</li>
                  <li><strong>Test, Test, Test:</strong> Always test your QR code with multiple devices (iOS, Android) and QR code scanning apps before printing it on physical materials.</li>
                  <li><strong>Provide Context:</strong> Don't just place a QR code without explanation. Add a short call to action next to it, like "Scan for Menu" or "Visit our Website."</li>
                  <li><strong>Print Quality Matters:</strong> Ensure the final printed QR code has sufficient contrast with its background and is large enough to be easily scanned from a reasonable distance. A minimum size of 1x1 inch (2.5x2.5 cm) is a good rule of thumb.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
