
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

const faviconSvg = `<svg width="256" height="256" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="backgroundGradient" x1="0" y1="0" x2="256" y2="256" gradientUnits="userSpaceOnUse">
            <stop stop-color="#5BCEF9"/>
            <stop offset="1" stop-color="#F89A53"/>
        </linearGradient>
    </defs>

    <rect width="256" height="256" rx="55" fill="url(#backgroundGradient)"/>

    <circle cx="128" cy="128" r="105" stroke="white" stroke-width="4" fill="none"/>

    <g stroke="white" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M175,90 L175,190 C175,195.523 170.523,200 165,200 L91,200 C85.4772,200 81,195.523 81,190 L81,66 C81,60.4772 85.4772,56 91,56 L150,56 L175,90Z" fill="none"/>
        <path d="M150,56 L150,90 L175,90" fill="none"/>
    </g>

    <g fill="white" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle">
        <text x="104" y="150" font-size="32" transform="rotate(-90 104 150)">JPG</text>
        
        <text x="152" y="134" font-size="32">PDF</text>
    </g>

    <g stroke="white" stroke-width="4" stroke-linecap="round">
        <path d="M128 90 V 170"/>
        
        <path d="M110 130 H 146"/>
        <path d="M132 118 L 146 130 L 132 142"/>
    </g>
</svg>`;

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
