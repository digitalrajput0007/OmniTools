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
import { GitCompareArrows } from 'lucide-react';
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
                className="min-h-[200px] font-mono"
                placeholder="Paste the first version of your text here."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="changed-text">Changed Text</Label>
              <Textarea
                id="changed-text"
                value={changedText}
                onChange={(e) => {
                  setChangedText(e.target.value);
                  setShowDiff(false);
                }}
                className="min-h-[200px] font-mono"
                placeholder="Paste the second version of your text here."
              />
            </div>
          </div>

          <div className="flex justify-center">
            <Button onClick={handleCompare} disabled={!originalText || !changedText}>
              <GitCompareArrows className="mr-2 h-4 w-4" /> Compare Texts
            </Button>
          </div>

          {showDiff && (
            <Card>
              <CardHeader>
                <CardTitle>Highlighted Differences</CardTitle>
                <CardDescription>
                  <span className="bg-green-100 dark:bg-green-900/50 text-green-900 dark:text-green-300 px-1 rounded-sm">
                    Green
                  </span>{' '}
                  indicates added text, and{' '}
                  <span className="bg-red-100 dark:bg-red-900/50 text-red-900 dark:text-red-300 px-1 rounded-sm">
                    Red
                  </span>{' '}
                  indicates removed text.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-72 w-full rounded-md border p-4">
                  <pre className="whitespace-pre-wrap font-mono text-sm">
                    {differences.map((part, index) => (
                      <span
                        key={index}
                        className={cn({
                          'bg-red-100 dark:bg-red-900/50 text-red-900 dark:text-red-300': part.removed,
                          'bg-green-100 dark:bg-green-900/50 text-green-900 dark:text-green-300': part.added,
                          'text-muted-foreground': !part.added && !part.removed,
                        })}
                      >
                        {part.value}
                      </span>
                    ))}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}