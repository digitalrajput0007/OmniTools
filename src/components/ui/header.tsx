
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
    viewBox="0 0 100 80"
    xmlns="http://www.w3.org/2000/svg"
    className={cn(className)}
  >
    <defs>
      <linearGradient id="jpgGradient" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FFA500" />
        <stop offset="100%" stopColor="#FF8C00" />
      </linearGradient>
      <linearGradient id="pdfGradient" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#2563EB" />
      </linearGradient>
    </defs>
    
    <g transform="translate(0, -5)">
      {/* JPG Icon */}
      <g transform="translate(5, 5)">
        <path
          d="M10,0 H40 A10,10 0 0 1 50,10 V60 A10,10 0 0 1 40,70 H10 A10,10 0 0 1 0,60 V10 A10,10 0 0 1 10,0 Z"
          fill="url(#jpgGradient)"
        />
        <path d="M40,0 H30 L50,20 V10 A10,10 0 0 0 40,0 Z" fill="white" opacity="0.3" />
        {/* Sun */}
        <circle cx="15" cy="18" r="5" fill="white" />
        <g transform="translate(15, 18)">
          {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
            <line key={angle} x1="0" y1="0" x2="0" y2="-7" stroke="white" strokeWidth="1.5" transform={`rotate(${angle})`} />
          ))}
        </g>
        {/* Mountains */}
        <path d="M8,35 L18,25 L25,32 L33,22 L42,35 Z" fill="white" />
        <text x="25" y="60" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="sans-serif">JPG</text>
      </g>
      
      {/* PDF Icon */}
      <g transform="translate(45, 5)">
        <path
          d="M10,0 H40 A10,10 0 0 1 50,10 V60 A10,10 0 0 1 40,70 H10 A10,10 0 0 1 0,60 V10 A10,10 0 0 1 10,0 Z"
          fill="url(#pdfGradient)"
        />
        <path d="M40,0 H30 L50,20 V10 A10,10 0 0 0 40,0 Z" fill="white" opacity="0.3" />
        {/* Document lines */}
        <rect x="10" y="40" width="30" height="3" rx="1.5" fill="white" />
        <rect x="10" y="48" width="20" height="3" rx="1.5" fill="white" />
        {/* Document symbol */}
        <path d="M12,20 h16 a4,4 0 0 1 4,4 v4" stroke="white" strokeWidth="3" fill="none" />
        <text x="25" y="60" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="sans-serif">PDF</text>
      </g>
      
      {/* Wave */}
      <path
        d="M35,45 Q50,30 65,45 T95,45"
        stroke="white"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
    </g>
  </svg>
);



export default function Header() {
    return (
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-secondary px-4 md:px-6">
        <Link href="/" aria-label="Home">
            <AppLogo className="h-10 w-auto" />
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
