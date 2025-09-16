'use client';

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
          <CardTitle className="font-headline">QR Code Generator</CardTitle>
          <CardDescription>
            Enter text or a URL to generate a QR code instantly.
          </CardDescription>
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
    </div>
  );
}
