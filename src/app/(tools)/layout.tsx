
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { AppName, tools } from '@/lib/constants';
import { AppLogo } from '@/components/ui/header';
import Footer from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import { PanelLeft } from 'lucide-react';


export function generateStaticParams() {
  return tools.map((tool) => ({
    tool: tool.path.substring(1),
  }));
}

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const currentTool = tools.find((tool) => tool.path === pathname);

  useEffect(() => {
    // Remove any existing ld+json script
    const existingScript = document.head.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      document.head.removeChild(existingScript);
    }
    
    if (currentTool) {
      // Create and inject the new one
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      
      const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": currentTool.name,
        "url": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://onlinejpgpdf.com'}${currentTool.path}`,
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "All",
        "offers": {
          "@type": "Offer",
          "price": "0"
        }
      };

      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }
  }, [currentTool, pathname]);

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Link href="/" className="flex items-center gap-2">
            <AppLogo className="h-7 w-auto" />
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {tools.map((tool) => (
              <SidebarMenuItem key={tool.name}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === tool.path}
                  tooltip={{ children: tool.name }}
                >
                  <Link href={tool.path}>
                    <tool.icon />
                    <span>{tool.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:hidden">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <AppLogo className="h-6 w-auto" />
          </Link>
          <SidebarTrigger asChild>
            <Button variant="ghost" size="icon">
              <PanelLeft />
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
          </SidebarTrigger>
        </header>
        <div className="flex-1 p-4 md:p-6">{children}</div>
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  );
}
