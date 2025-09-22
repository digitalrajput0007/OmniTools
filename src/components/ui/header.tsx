
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

const imageTools = tools.filter(t => ['Image Compressor', 'Image Format Converter', 'Image Resizer/Cropper', 'Background Remover'].includes(t.name));
const pdfTools = tools.filter(t => ['PDF Merger', 'PDF to Images', 'PDF Splitter', 'Compress PDF', 'Reorder / Rotate Pages', 'Add Signature / Fill Form', 'Extract Text', 'Watermark PDF'].includes(t.name));
const textToolsList = tools.filter(t => ['Text Tools', 'Text Difference'].includes(t.name));
const dataTools = tools.filter(t => ['Random Data Generator', 'Random Picker', 'Credit Card Generator', 'JSON Beautifier'].includes(t.name));
const otherTools = tools.filter(t => ['Unit Converter', 'QR Code Generator'].includes(t.name));
const imagesToPdfTool = tools.find(t => t.name === 'Images to PDF');


export const AppLogo = ({ className }: { className?: string }) => (
     <svg
        viewBox="0 0 160 30"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("w-auto", className)}
    >
        <defs>
            <linearGradient id="logoGradient" x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))' }} />
                <stop offset="100%" style={{ stopColor: 'hsl(var(--ring))' }} />
            </linearGradient>
        </defs>
        <text
            x="50%"
            y="20"
            textAnchor="middle"
            fontSize="20"
            fontWeight="bold"
            fontFamily="var(--font-headline), sans-serif"
            fill="url(#logoGradient)"
            letterSpacing="-0.5"
        >
            Online JPG PDF
        </text>
    </svg>
);



export default function Header() {
    const [openMenu, setOpenMenu] = React.useState<string | null>(null);

    const navItems = [
        {
            name: 'Image Tools',
            icon: ImageIcon,
            tools: [...imageTools, ...(imagesToPdfTool ? [imagesToPdfTool] : [])]
        },
        {
            name: 'PDF Tools',
            icon: FileText,
            tools: pdfTools
        },
        {
            name: 'Data Tools',
            icon: Database,
            tools: dataTools
        },
        {
            name: 'Text Tools',
            icon: ALargeSmall,
            tools: textToolsList
        },
        {
            name: 'Other Tools',
            icon: Globe,
            tools: otherTools
        }
    ];

    return (
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
            <Link href="/" className="flex items-center gap-2 font-headline text-lg font-semibold" aria-label="Home">
                <AppLogo className="h-8" />
            </Link>
            <nav className="hidden items-center gap-1 md:flex">
                <Button variant="ghost" asChild>
                    <Link href="/json-beautifier">
                        <Braces className="mr-2" /> JSON Beautifier
                    </Link>
                </Button>

                {navItems.map((item) => (
                    <DropdownMenu key={item.name} open={openMenu === item.name} onOpenChange={(isOpen) => setOpenMenu(isOpen ? item.name : null)}>
                        <div onMouseEnter={() => setOpenMenu(item.name)} onMouseLeave={() => setOpenMenu(null)}>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="cursor-pointer">
                                    <item.icon className="mr-2" /> {item.name}
                                    <ChevronDown className={cn("ml-1 h-4 w-4 transition-transform", openMenu === item.name && "rotate-180")} />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                {item.tools.map(tool => (
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
                ))}
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
