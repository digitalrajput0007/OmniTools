
import type { Metadata, Viewport } from 'next';
import { Poppins, PT_Sans } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AppName } from '@/lib/constants';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-headline',
});

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: {
    template: `%s | ${AppName}`,
    default: `${AppName} - Free Online Tools for Images, PDFs, and More`,
  },
  description: `Your all-in-one hub for free online utilities. Compress images, convert image formats, merge or split PDFs, generate QR codes, create dummy data, and much more. All tools are private, secure, and work in your browser.`,
};


export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

const faviconSvg = `
<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:hsl(var(--primary));stop-opacity:1" />
            <stop offset="100%" style="stop-color:hsl(var(--ring));stop-opacity:1" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="1"/>
            <feOffset dx="1" dy="1" result="offsetblur"/>
            <feComponentTransfer><feFuncA type="linear" slope="0.5"/></feComponentTransfer>
            <feMerge> 
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        </filter>
    </defs>
    <g filter="url(#shadow)">
        <path d="M4 4 H28 A4 4 0 0 1 32 8 V24 A4 4 0 0 1 28 28 H4 A4 4 0 0 1 0 24 V8 A4 4 0 0 1 4 4 Z" fill="white"/>
        <path d="M0 16 L16 0 H4 A4 4 0 0 0 0 4 V16 Z" fill="url(#grad1)"/>
        <path d="M16 32 L32 16 V28 A4 4 0 0 1 28 32 H16 Z" fill="url(#grad1)" />
        <text x="8" y="21" font-family="sans-serif" font-size="14" font-weight="bold" fill="white">J</text>
        <text x="18" y="11" font-family="sans-serif" font-size="14" font-weight="bold" fill="white">P</text>
    </g>
</svg>
`.trim();

const faviconDataUrl = `data:image/svg+xml,${encodeURIComponent(faviconSvg)}`;


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${poppins.variable} ${ptSans.variable}`}>
      <head>
        <link rel="icon" href={faviconDataUrl} type="image/svg+xml" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-EVQ8C8X2H3"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-EVQ8C8X2H3');
            `,
          }}
        />
      </head>
      <body className="font-body antialiased bg-background text-foreground" suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
