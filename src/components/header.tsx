'use client';

import { usePathname } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { tools } from '@/lib/constants';

export default function Header() {
  const pathname = usePathname();
  const currentTool = tools.find((tool) => tool.path === pathname);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <SidebarTrigger className="md:hidden" />
      <h1 className="font-headline text-xl font-semibold">
        {currentTool?.name || 'OmniToolbox'}
      </h1>
    </header>
  );
}
