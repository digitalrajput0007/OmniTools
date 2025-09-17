'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
} from '@/components/ui/sidebar';
import Header from '@/components/header';
import { AppLogo, AppName, tools } from '@/lib/constants';
import type { Metadata } from 'next';

// This is not how you generate dynamic metadata in the app router.
// Each page should export its own metadata object.
// However, since this is a client component, we can update the document title.

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const currentTool = tools.find((tool) => tool.path === pathname);

  useEffect(() => {
    if (!currentTool) {
      // Redirect to home if the tool is not found.
      // A more robust solution might show a 404 page.
      router.replace('/');
    } else {
      document.title = `${currentTool.name} | ${AppName}`;
    }
  }, [currentTool, router]);

  if (!currentTool) {
    return null; // Or a loading spinner
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Link href="/" className="flex items-center gap-2">
            <AppLogo className="h-7 w-7 text-primary" />
            <span className="font-headline text-lg font-semibold text-foreground group-data-[collapsible=icon]:hidden">
              {AppName}
            </span>
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
        <Header />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
