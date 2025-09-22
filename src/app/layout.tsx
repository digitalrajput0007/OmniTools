
import type { Metadata, Viewport } from 'next';
import { Poppins, PT_Sans } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AppName, tools } from '@/lib/constants';

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

export async function generateMetadata({ params }: any): Promise<Metadata> {
  // find the current tool based on the URL
  // The root layout does not have access to the pathname, so we can't use that.
  // This is a common pattern for generating dynamic metadata in Next.js.
  // We don't have a direct way to know the current tool here, so we will set a default.
  // Child layouts (like for the tools page) would handle more specific metadata.
  return {
    title: {
      default: `${AppName} - Your All-in-One Utility Hub`,
      template: `%s | ${AppName}`,
    },
    description:
      'A collection of powerful and easy-to-use tools including Image Compressor, Image Format Converter, PDF utilities, QR Code Generator, and more.',
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

const faviconSvg = `
    <svg
        viewBox="0 0 160 52"
        xmlns="http://www.w3.org/2000/svg"
    >
        <defs>
            <linearGradient id="jpgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color: #f9a147; stop-opacity: 1" />
                <stop offset="100%" style="stop-color: #ff7e0a; stop-opacity: 1" />
            </linearGradient>
            <linearGradient id="pdfGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color: #3993dd; stop-opacity: 1" />
                <stop offset="100%" style="stop-color: #2065d1; stop-opacity: 1" />
            </linearGradient>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="1"/>
                <feOffset dx="1" dy="1" result="offsetblur"/>
                <feComponentTransfer>
                    <feFuncA type="linear" slope="0.5"/>
                </feComponentTransfer>
                <feMerge> 
                    <feMergeNode/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>

        <g filter="url(#shadow)">
            {/* JPG Icon */}
            <g transform="translate(10, 0)">
                <rect width="60" height="36" rx="8" ry="8" fill="url(#jpgGradient)" />
                <path d="M10 10.5 L 14 6.5 L 18 10.5" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" transform="translate(15.5 13) scale(0.6)"/>
                <path d="M6 14 L 11 9 L 18 16" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" transform="translate(15.5 13) scale(0.6)"/>
                <circle cx="10.5" cy="9.5" r="2" fill="white"  transform="translate(15.5 13) scale(0.6)"/>

                <text x="30" y="30" text-anchor="middle" fill="white" font-size="10" font-weight="bold" font-family="sans-serif">JPG</text>
            </g>

            {/* PDF Icon */}
            <g transform="translate(50, 0)">
                <rect width="60" height="36" rx="8" ry="8" fill="url(#pdfGradient)" />
                <path d="M48,0 L48,10 A2,2 0 0 1 46,12 L38,12" stroke="white" stroke-width="2" fill="none" transform="translate(10 2)" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M18 18 H32" stroke="white" stroke-width="2" stroke-linecap="round"/>
                <path d="M18 24 H26" stroke="white" stroke-width="2" stroke-linecap="round"/>
                <text x="30" y="30" text-anchor="middle" fill="white" font-size="10" font-weight="bold" font-family="sans-serif">PDF</text>
            </g>
            
            {/* Swoosh */}
            <path d="M55 18 C 65 10, 75 26, 85 18" stroke="white" stroke-width="3" fill="none" stroke-linecap="round"/>
        </g>
        
        {/* Text */}
        <text x="80" y="48" text-anchor="middle" font-size="10" font-family="sans-serif" font-weight="bold">
            <tspan fill="#2065d1">online</tspan><tspan fill="#555555">jpgpdf.com</tspan>
        </text>
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
      <body className="font-body antialiased bg-background text-foreground">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
