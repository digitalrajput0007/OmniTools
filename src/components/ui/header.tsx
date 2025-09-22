
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
const pdfTools = tools.filter(t => ['PDF to Images', 'PDF Merger', 'PDF Splitter', 'Compress PDF', 'Reorder / Rotate Pages', 'Add Signature / Fill Form', 'Extract Text', 'Watermark PDF'].includes(t.name));
const textToolsList = tools.filter(t => ['Text Tools', 'Text Difference'].includes(t.name));
const dataTools = tools.filter(t => ['Random Data Generator', 'Random Picker', 'Credit Card Generator', 'JSON Beautifier'].includes(t.name));
const otherTools = tools.filter(t => ['Unit Converter', 'QR Code Generator'].includes(t.name));
const imagesToPdfTool = tools.find(t => t.name === 'Images to PDF');

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
    const [activeMenu, setActiveMenu] = React.useState<string | null>(null);
    const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = (menu: string) => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }
        setActiveMenu(menu);
    };

    const handleMouseLeave = () => {
        hoverTimeoutRef.current = setTimeout(() => {
            setActiveMenu(null);
        }, 100);
    };

    return (
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-secondary px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-headline text-lg font-semibold" aria-label="Home">
            <AppLogo />
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
             {imagesToPdfTool && (
                <Button variant="ghost" asChild>
                    <Link href={imagesToPdfTool.path}>
                        <imagesToPdfTool.icon className="mr-2" /> {imagesToPdfTool.name}
                    </Link>
                </Button>
             )}
            <DropdownMenu open={activeMenu === 'data'} onOpenChange={(open) => !open && setActiveMenu(null)}>
              <div onMouseLeave={handleMouseLeave}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="cursor-pointer" onMouseEnter={() => handleMouseEnter('data')}>
                    <Database className="mr-2" /> Data Tools <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent onMouseEnter={() => handleMouseEnter('data')}>
                  {dataTools.map(tool => (
                     <DropdownMenuItem key={tool.name} asChild>
                      <Link href={tool.path}>
                        <tool.icon className="mr-2" />
                        <span>{tool.name}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </div>
            </DropdownMenu>

            <DropdownMenu open={activeMenu === 'image'} onOpenChange={(open) => !open && setActiveMenu(null)}>
              <div onMouseLeave={handleMouseLeave}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="cursor-pointer" onMouseEnter={() => handleMouseEnter('image')}>
                    <ImageIcon className="mr-2" /> Image Tools <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent onMouseEnter={() => handleMouseEnter('image')}>
                  {imageTools.map(tool => (
                     <DropdownMenuItem key={tool.name} asChild>
                      <Link href={tool.path}>
                        <tool.icon className="mr-2" />
                        <span>{tool.name}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </div>
            </DropdownMenu>

             <DropdownMenu open={activeMenu === 'pdf'} onOpenChange={(open) => !open && setActiveMenu(null)}>
              <div onMouseLeave={handleMouseLeave}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="cursor-pointer" onMouseEnter={() => handleMouseEnter('pdf')}>
                    <FileText className="mr-2" /> PDF Tools <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent onMouseEnter={() => handleMouseEnter('pdf')}>
                  {pdfTools.map(tool => (
                     <DropdownMenuItem key={tool.name} asChild>
                      <Link href={tool.path}>
                        <tool.icon className="mr-2" />
                        <span>{tool.name}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </div>
            </DropdownMenu>

             <DropdownMenu open={activeMenu === 'text'} onOpenChange={(open) => !open && setActiveMenu(null)}>
              <div onMouseLeave={handleMouseLeave}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="cursor-pointer" onMouseEnter={() => handleMouseEnter('text')}>
                    <ALargeSmall className="mr-2" /> Text Tools <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent onMouseEnter={() => handleMouseEnter('text')}>
                  {textToolsList.map(tool => (
                     <DropdownMenuItem key={tool.name} asChild>
                      <Link href={tool.path}>
                        <tool.icon className="mr-2" />
                        <span>{tool.name}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </div>
            </DropdownMenu>

            {otherTools.length > 0 && (
                <DropdownMenu open={activeMenu === 'other'} onOpenChange={(open) => !open && setActiveMenu(null)}>
                  <div onMouseLeave={handleMouseLeave}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="cursor-pointer" onMouseEnter={() => handleMouseEnter('other')}>
                        <Globe className="mr-2" /> Other Tools <ChevronDown className="ml-1 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent onMouseEnter={() => handleMouseEnter('other')}>
                      {otherTools.map(tool => (
                         <DropdownMenuItem key={tool.name} asChild>
                          <Link href={tool.path}>
                            <tool.icon className="mr-2" />
                            <span>{tool.name}</span>
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </div>
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
