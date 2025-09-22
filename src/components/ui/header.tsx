
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

const imageTools = tools.filter(t => ['Image Compressor', 'Image Format Converter', 'Image Resizer/Cropper', 'Background Remover', 'Images to PDF'].includes(t.name));
const pdfTools = tools.filter(t => ['PDF to Images', 'PDF Merger', 'PDF Splitter', 'Compress PDF', 'Reorder / Rotate Pages', 'Add Signature / Fill Form', 'Extract Text', 'Watermark PDF', 'PDF Password'].includes(t.name));
const textToolsList = tools.filter(t => ['Text Tools', 'Text Difference'].includes(t.name));
const dataTools = tools.filter(t => ['Random Data Generator', 'Random Picker', 'Credit Card Generator', 'JSON Beautifier'].includes(t.name));
const otherTools = tools.filter(t => ['Unit Converter', 'QR Code Generator'].includes(t.name));

export const AppLogo = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg
        {...props}
        viewBox="0 0 160 52"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("w-auto", className)}
        {...props}
    >
        <defs>
            <linearGradient id="jpgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#f9a147', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#ff7e0a', stopOpacity: 1 }} />
            </linearGradient>
            <linearGradient id="pdfGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#3993dd', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#2065d1', stopOpacity: 1 }} />
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
                <path d="M10 10.5 L 14 6.5 L 18 10.5" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" transform="translate(15.5 13) scale(0.6)"/>
                <path d="M6 14 L 11 9 L 18 16" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" transform="translate(15.5 13) scale(0.6)"/>
                <circle cx="10.5" cy="9.5" r="2" fill="white"  transform="translate(15.5 13) scale(0.6)"/>

                <text x="30" y="30" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="sans-serif">JPG</text>
            </g>

            {/* PDF Icon */}
            <g transform="translate(50, 0)">
                <rect width="60" height="36" rx="8" ry="8" fill="url(#pdfGradient)" />
                <path d="M48,0 L48,10 A2,2 0 0 1 46,12 L38,12" stroke="white" strokeWidth="2" fill="none" transform="translate(10 2)" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18 18 H32" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <path d="M18 24 H26" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <text x="30" y="30" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="sans-serif">PDF</text>
            </g>
            
            {/* Swoosh */}
            <path d="M55 18 C 65 10, 75 26, 85 18" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round"/>
        </g>
        
        {/* Text */}
        <text x="80" y="48" textAnchor="middle" fontSize="10" fontFamily="sans-serif" fontWeight="bold" fill="hsl(var(--foreground))">
            onlinejpgpdf.com
        </text>
    </svg>
);



export default function Header() {
    return (
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-secondary px-4 md:px-6">
        <Link href="/" className="font-headline text-lg font-semibold" aria-label="Home">
            
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
