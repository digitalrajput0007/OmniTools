
'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { tools } from '@/lib/constants';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RelatedToolsProps {
  toolPath: string;
}

export function RelatedTools({ toolPath }: RelatedToolsProps) {
  const currentTool = tools.find(t => t.path === toolPath);
  const relatedToolPaths = currentTool?.related;

  if (!relatedToolPaths || relatedToolPaths.length === 0) {
    return null;
  }

  const relatedToolsData = relatedToolPaths.map(path => tools.find(t => t.path === path)).filter(Boolean);

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
                className="group flex items-center justify-between rounded-md border p-4 transition-all duration-300 hover:border-primary hover:shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-md bg-muted p-2">
                    <tool.icon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold">{tool.name}</p>
                    <p className="text-sm text-muted-foreground">{tool.description}</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </Link>
            )
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
