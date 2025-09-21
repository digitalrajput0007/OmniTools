
'use client';

import Link from 'next/link';
import {
  AppName,
  tools
} from '@/lib/constants';
import {
  ImageIcon,
  FileText,
  Globe,
  ChevronDown,
  ALargeSmall,
  Database,
  PanelLeft,
  Braces,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import React from 'react';

const imageTools = tools.filter(t => ['Image Compressor', 'Image Format Converter', 'Image Resizer', 'Background Remover'].includes(t.name));
const pdfTools = tools.filter(t => ['PDF Merger', 'PDF Splitter'].includes(t.name));
const textToolsList = tools.filter(t => ['Text Tools', 'Text Difference'].includes(t.name));
const dataTools = tools.filter(t => ['Random Data Generator', 'Random Picker', 'Credit Card Generator', 'JSON Beautifier'].includes(t.name));
const otherTools = tools.filter(t => ['Unit Converter', 'QR Code Generator'].includes(t.name));

export const AppLogo = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    {...props}
    className={cn(
      'flex items-center justify-center rounded-full bg-primary',
      className
    )}
  >
    <span className="font-bold text-primary-foreground">OJP</span>
  </div>
);


export default function Header() {
    return (
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-secondary px-4 md:px-6">
        <Link href="/" className="flex items-center gap-3">
          <AppLogo className="h-8 w-8" />
          <h1 className="font-headline text-2xl font-bold tracking-tighter">
            {AppName}
          </h1>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
             <Button variant="ghost" asChild>
                <Link href="/json-beautifier">
                  <Braces className="mr-2" /> JSON Beautifier
                </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost">
                  <Database className="mr-2" /> Data Tools <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {dataTools.map(tool => (
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
                  <FileText className="mr-2" /> PDF Tools <ChevronDown className="ml-1 h-4 w-4" />
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
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                    <PanelLeft className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left">
                <nav className="grid gap-6 text-lg font-medium">
                    <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
                        <AppLogo className="h-8 w-8" />
                        <span className="sr-only">{AppName}</span>
                    </Link>
                    {tools.map((tool) => (
                        <Link key={tool.name} href={tool.path} className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                            <tool.icon className="h-5 w-5" />
                            {tool.name}
                        </Link>
                    ))}
                </nav>
            </SheetContent>
        </Sheet>
      </header>
    );
}
