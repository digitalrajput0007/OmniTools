
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  AppLogo,
  AppName,
  tools
} from '@/lib/constants';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import {
  ArrowRight,
  Image as ImageIcon,
  FileText as PdfIcon,
  Globe,
  ChevronDown,
  ALargeSmall,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const imageTools = tools.filter(t => ['Image Compressor', 'Image to PDF', 'Image Format Converter', 'Image Resizer/Cropper', 'Background Remover'].includes(t.name));
const pdfTools = tools.filter(t => ['PDF Merger', 'PDF Splitter'].includes(t.name));
const textToolsList = tools.filter(t => ['Text Tools', 'Text Difference', 'JSON Beautifier'].includes(t.name));
const otherTools = tools.filter(t => ['Unit Converter', 'QR Code Generator'].includes(t.name));

const randomDataGeneratorTool = tools.find(t => t.name === 'Random Data Generator');
const randomPickerTool = tools.find(t => t.name === 'Random Picker');
const creditCardGeneratorTool = tools.find(t => t.name === 'Credit Card Generator');


export const metadata: Metadata = {
  title: `${AppName} - Free Online Tools for Images, PDFs, and More`,
  description: `Your all-in-one hub for free online utilities. Compress images, convert image formats, merge or split PDFs, generate QR codes, create dummy data, and much more. All tools are private, secure, and work in your browser.`
};


export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex h-16 items-center justify-between border-b px-4 md:px-6">
        <Link href="/" className="flex items-center gap-3">
          <AppLogo className="h-8 w-8 text-primary" />
          <h1 className="font-headline text-2xl font-bold tracking-tighter">
            {AppName}
          </h1>
        </Link>
        <nav className="hidden items-center gap-2 md:flex">
            {randomDataGeneratorTool && (
                <Button variant="ghost" asChild>
                    <Link href={randomDataGeneratorTool.path}>
                        <randomDataGeneratorTool.icon className="mr-2" /> {randomDataGeneratorTool.name}
                    </Link>
                </Button>
            )}

            {randomPickerTool && (
                <Button variant="ghost" asChild>
                    <Link href={randomPickerTool.path}>
                        <randomPickerTool.icon className="mr-2" /> {randomPickerTool.name}
                    </Link>
                </Button>
            )}

            {creditCardGeneratorTool && (
                <Button variant="ghost" asChild>
                    <Link href={creditCardGeneratorTool.path}>
                        <creditCardGeneratorTool.icon className="mr-2" /> {creditCardGeneratorTool.name}
                    </Link>
                </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost">
                  <ImageIcon className="mr-2" /> Image Tools <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {imageTools.map(tool => (
                   <DropdownMenuItem key={tool.name} asChild>
                    <Link href={tool.path}>
                      <tool.icon className="mr-2" />
                      <span>{tool.name}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost">
                  <PdfIcon className="mr-2" /> PDF Tools <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {pdfTools.map(tool => (
                   <DropdownMenuItem key={tool.name} asChild>
                    <Link href={tool.path}>
                      <tool.icon className="mr-2" />
                      <span>{tool.name}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost">
                  <ALargeSmall className="mr-2" /> Text Tools <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {textToolsList.map(tool => (
                   <DropdownMenuItem key={tool.name} asChild>
                    <Link href={tool.path}>
                      <tool.icon className="mr-2" />
                      <span>{tool.name}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {otherTools.length > 0 && (
                <DropdownMenu>
                   <DropdownMenuTrigger asChild>
                    <Button variant="ghost">
                      <Globe className="mr-2" /> Other Tools <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {otherTools.map(tool => (
                       <DropdownMenuItem key={tool.name} asChild>
                        <Link href={tool.path}>
                          <tool.icon className="mr-2" />
                          <span>{tool.name}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
            )}
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-5xl">
                  Your All-in-One Utility Hub
                </h2>
                <p className="mx-auto max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {AppName} offers a comprehensive suite of free, powerful, and easy-to-use online utilities.
                  Whether you need to compress images, merge PDFs, convert file formats, generate QR codes, or create dummy data for testing, our tools are designed to streamline your daily tasks—all without installation, right in your browser.
                </p>
              </div>
            </div>
             <div className="mx-auto mt-12 grid max-w-sm grid-cols-1 gap-6 sm:max-w-4xl sm:grid-cols-2 lg:max-w-5xl lg:grid-cols-3 xl:max-w-7xl xl:grid-cols-4">
              {tools.map((tool) => (
                <Link href={tool.path} key={tool.name} className="group">
                  <Card className="flex h-full flex-col transition-all duration-300 hover:scale-[1.02] hover:border-primary hover:shadow-lg hover:shadow-primary/10">
                    <CardHeader className="flex flex-row items-start gap-4">
                      <div className="rounded-md bg-primary/10 p-3">
                        <tool.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="font-headline text-lg">
                          {tool.name}
                        </CardTitle>
                        <CardDescription className="mt-1 text-sm">
                          {tool.description}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow" />
                    <CardFooter>
                      <span className="flex items-center gap-1 text-sm font-semibold text-primary">
                        Use Tool{' '}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="flex w-full shrink-0 flex-col items-center gap-2 border-t px-4 py-6 sm:flex-row md:px-6">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} {AppName}. All rights reserved.
        </p>
        <nav className="flex flex-wrap justify-center gap-x-4 gap-y-2 sm:ml-auto sm:gap-6">
          <Link
            className="text-xs underline-offset-4 hover:underline"
            href="/about"
          >
            About Us
          </Link>
          <Link
            className="text-xs underline-offset-4 hover:underline"
            href="/contact"
          >
            Contact
          </Link>
          <Link
            className="text-xs underline-offset-4 hover:underline"
            href="/terms"
          >
            Terms of Service
          </Link>
          <Link
            className="text-xs underline-offset-4 hover:underline"
            href="/privacy"
          >
            Privacy Policy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
