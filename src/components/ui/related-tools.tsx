
'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { tools, iconColors } from '@/lib/constants';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface RelatedToolsProps {
  toolPath: string;
}

export function RelatedTools({ toolPath }: RelatedToolsProps) {
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);

  const currentTool = tools.find(t => t.path === toolPath);
  const relatedToolPaths = currentTool?.related;

  if (!relatedToolPaths || relatedToolPaths.length === 0) {
    return null;
  }

  const relatedToolsData = relatedToolPaths
    .map(path => {
        const tool = tools.find(t => t.path === path);
        if (!tool) return null;
        const toolIndex = tools.findIndex(t => t.path === path);
        const color = iconColors[toolIndex % iconColors.length];
        return { ...tool, color };
    })
    .filter(Boolean);

  if (relatedToolsData.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Related Tools</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {relatedToolsData.map(tool => (
            tool && (
              <Link
                href={tool.path}
                key={tool.path}
                className={cn(
                  "group rounded-md border p-4 transition-all duration-300 hover:shadow-lg",
                  `hover:border-${tool.color.tw}`
                )}
                onMouseEnter={() => setHoveredTool(tool.path)}
                onMouseLeave={() => setHoveredTool(null)}
              >
                <div className="flex h-full flex-col">
                  <div className="flex flex-grow items-start gap-4">
                    <div className={cn("rounded-md p-2", tool.color.bg)}>
                      <tool.icon className={cn("h-6 w-6", tool.color.text)} />
                    </div>
                    <div>
                      <p className="font-semibold">{tool.name}</p>
                      <p className="text-sm text-muted-foreground">{tool.description}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-end">
                     <span
                      className={cn(
                        "flex items-center gap-1 text-sm font-semibold text-muted-foreground transition-colors",
                        (hoveredTool === tool.path) && tool.color.text
                      )}
                    >
                      Use Tool
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </Link>
            )
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

