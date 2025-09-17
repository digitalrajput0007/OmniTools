'use client';

import { useState, useMemo } from 'react';
import { diffChars } from 'diff';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GitCompareArrows, Pencil, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type DiffPart = {
  value: string;
  added?: boolean;
  removed?: boolean;
};

export default function TextDiffPage() {
  const [originalText, setOriginalText] = useState('This is the original text.');
  const [changedText, setChangedText] = useState('This is the new and changed text.');
  const [showDiff, setShowDiff] = useState(false);

  const handleCompare = () => {
    setShowDiff(true);
  };
  
  const handleReset = () => {
    setShowDiff(false);
  }

  const differences = useMemo((): DiffPart[] => {
    if (!showDiff) return [];
    return diffChars(originalText, changedText);
  }, [originalText, changedText, showDiff]);

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Text Difference Checker</CardTitle>
          <CardDescription>
            Paste two blocks of text to see the differences highlighted.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="original-text">Original Text</Label>
              <Textarea
                id="original-text"
                value={originalText}
                onChange={(e) => {
                  setOriginalText(e.target.value);
                  setShowDiff(false);
                }}
                className="min-h-[300px] font-mono"
                placeholder="Paste the first version of your text here."
                readOnly={showDiff}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="changed-text">Changed Text</Label>
                {showDiff && (
                   <Button variant="ghost" size="sm" onClick={handleReset}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                   </Button>
                )}
              </div>
              
              {showDiff ? (
                 <ScrollArea className="h-[300px] w-full rounded-md border font-mono">
                    <pre className="whitespace-pre-wrap p-2 text-sm">
                      {differences.map((part, index) => (
                        <span
                          key={index}
                          className={cn({
                            'bg-red-100/80 dark:bg-red-900/50 text-red-900 dark:text-red-200': part.removed,
                            'bg-green-100/80 dark:bg-green-900/50 text-green-900 dark:text-green-200': part.added,
                          })}
                        >
                          {part.value}
                        </span>
                      ))}
                    </pre>
                 </ScrollArea>
              ) : (
                <Textarea
                  id="changed-text"
                  value={changedText}
                  onChange={(e) => {
                    setChangedText(e.target.value);
                    setShowDiff(false);
                  }}
                  className="min-h-[300px] font-mono"
                  placeholder="Paste the second version of your text here."
                />
              )}
            </div>
          </div>

          {!showDiff && (
            <div className="flex justify-center">
              <Button onClick={handleCompare} disabled={!originalText || !changedText}>
                <GitCompareArrows className="mr-2 h-4 w-4" /> Compare Texts
              </Button>
            </div>
          )}
          
          {showDiff && (
             <div className="flex justify-center rounded-md border p-2 text-sm text-muted-foreground">
                <span className="mr-4 flex items-center gap-2">
                  <span className="h-4 w-4 rounded-sm bg-green-100/80 dark:bg-green-900/50"></span>
                  Added
                </span>
                 <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-sm bg-red-100/80 dark:bg-red-900/50"></span>
                  Removed
                </span>
              </div>
          )}
          
        </CardContent>
      </Card>
    </div>
  );
}
