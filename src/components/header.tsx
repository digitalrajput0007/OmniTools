'use client';

import { usePathname } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { tools } from '@/lib/constants';

export default function Header() {
  const pathname = usePathname();
  const currentTool = tools.find((tool) => tool.path === pathname);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-center gap-4 border-b bg-background px-4 md:px-6 relative">
      <SidebarTrigger className="md:hidden absolute left-4 top-1/2 -translate-y-1/2" />
      <h1 className="font-headline text-2xl font-semibold">
        {currentTool?.name || 'OmniToolbox'}
      </h1>
    </header>
  );
}
