
import type { Metadata, Viewport } from 'next';
import { Poppins, PT_Sans } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AppName, tools } from '@/lib/constants';
import Header from '@/components/ui/header';
import Footer from '@/components/ui/footer';

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


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${poppins.variable} ${ptSans.variable}`}>
      <head>
        {/* 
          ============================================================
          == PASTE YOUR GOOGLE ANALYTICS SNIPPET HERE.              ==
          == You can get this from your Google Analytics dashboard. ==
          == It's crucial for tracking your website's performance.  ==
          ============================================================
        */}
      </head>
      <body className="font-body antialiased bg-background text-foreground flex min-h-dvh flex-col" suppressHydrationWarning>
        <Header />
        <main className="flex-1">
            {children}
        </main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
