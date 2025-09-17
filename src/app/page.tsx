
import Link from 'next/link';
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
const textToolsList = tools.filter(t => ['Text Tools', 'Text Difference'].includes(t.name));
const otherTools = tools.filter(t => ['Unit Converter', 'QR Code Generator', 'Random Picker', 'Random Data Generator', 'Credit Card Generator'].includes(t.name));


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
        <nav className="hidden md:flex items-center gap-2">
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
                  OmniToolbox provides a suite of powerful, easy-to-use online
                  tools to streamline your daily tasks. No installation,
                  completely free.
                </p>
              </div>
            </div>
             <div className="mx-auto mt-12 grid max-w-sm grid-cols-1 gap-6 sm:max-w-none sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
        <nav className="flex gap-4 sm:ml-auto sm:gap-6">
          <Link
            className="text-xs underline-offset-4 hover:underline"
            href="#"
          >
            Terms of Service
          </Link>
          <Link
            className="text-xs underline-offset-4 hover:underline"
            href="#"
          >
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
