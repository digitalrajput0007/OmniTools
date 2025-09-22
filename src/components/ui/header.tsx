
'use client';

import Link from 'next/link';
import Image from 'next/image';
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

const imageTools = tools.filter(t => ['Image Compressor', 'Image Format Converter', 'Image Resizer/Cropper', 'Background Remover', 'Images to PDF'].includes(t.name));
const pdfTools = tools.filter(t => ['PDF to Images', 'PDF Merger', 'PDF Splitter', 'Compress PDF', 'Reorder / Rotate Pages', 'Add Signature / Fill Form', 'Extract Text', 'Watermark PDF', 'PDF Password'].includes(t.name));
const textToolsList = tools.filter(t => ['Text Tools', 'Text Difference'].includes(t.name));
const dataTools = tools.filter(t => ['Random Data Generator', 'Random Picker', 'Credit Card Generator'].includes(t.name));
const otherTools = tools.filter(t => ['Unit Converter', 'QR Code Generator'].includes(t.name));

export const AppLogo = ({ className }: { className?: string }) => (
    <svg
        viewBox="0 0 200 40"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("h-auto w-48", className)}
    >
        <defs>
            <linearGradient id="logoGradient" x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" style={{ stopColor: '#2065d1' }} />
                <stop offset="45%" style={{ stopColor: '#3993dd' }} />
                <stop offset="55%" style={{ stopColor: '#f9a147' }} />
                <stop offset="100%" style={{ stopColor: '#ff7e0a' }} />
            </linearGradient>
            <filter id="textShadow" x="-0.05" y="-0.05" width="1.1" height="1.2">
              <feDropShadow dx="0" dy="1" stdDeviation="0.5" floodColor="#000000" floodOpacity="0.2"/>
            </filter>
        </defs>
        <text
            x="50%"
            y="28"
            textAnchor="middle"
            fontSize="24"
            fontWeight="bold"
            fontFamily="sans-serif"
            fill="url(#logoGradient)"
            filter="url(#textShadow)"
        >
            Online JPG PDF
        </text>
    </svg>
);



export default function Header() {
    const [openMenus, setOpenMenus] = React.useState<Record<string, boolean>>({});

    const handleOpenChange = (menu: string, open: boolean) => {
        setOpenMenus(prev => ({ ...prev, [menu]: open }));
    };

    return (
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-secondary px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-headline text-lg font-semibold" aria-label="Home">
            <AppLogo />
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
             <Button variant="ghost" asChild>
                <Link href="/json-beautifier">
                  <Braces className="mr-2" /> JSON Beautifier
                </Link>
            </Button>
            <DropdownMenu open={openMenus['data']} onOpenChange={(open) => handleOpenChange('data', open)}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="cursor-pointer">
                  <Database className="mr-2" /> Data Tools <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent onMouseLeave={() => handleOpenChange('data', false)}>
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

            <DropdownMenu open={openMenus['image']} onOpenChange={(open) => handleOpenChange('image', open)}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="cursor-pointer">
                  <ImageIcon className="mr-2" /> Image Tools <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent onMouseLeave={() => handleOpenChange('image', false)}>
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

             <DropdownMenu open={openMenus['pdf']} onOpenChange={(open) => handleOpenChange('pdf', open)}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="cursor-pointer">
                  <FileText className="mr-2" /> PDF Tools <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent onMouseLeave={() => handleOpenChange('pdf', false)}>
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

             <DropdownMenu open={openMenus['text']} onOpenChange={(open) => handleOpenChange('text', open)}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="cursor-pointer">
                  <ALargeSmall className="mr-2" /> Text Tools <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent onMouseLeave={() => handleOpenChange('text', false)}>
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
                <DropdownMenu open={openMenus['other']} onOpenChange={(open) => handleOpenChange('other', open)}>
                   <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="cursor-pointer">
                      <Globe className="mr-2" /> Other Tools <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent onMouseLeave={() => handleOpenChange('other', false)}>
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
