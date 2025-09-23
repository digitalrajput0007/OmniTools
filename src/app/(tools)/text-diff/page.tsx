
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
import { GitCompareArrows, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CircularProgress } from '@/components/ui/circular-progress';
import { SharePrompt } from '@/components/ui/share-prompt';

type DiffPart = {
  value: string;
  added?: boolean;
  removed?: boolean;
};

export default function TextDiffPage() {
  const [originalText, setOriginalText] = useState('This is the original text.');
  const [changedText, setChangedText] = useState('This is the new and changed text.');
  const [showDiff, setShowDiff] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleCompare = () => {
    setIsComparing(true);
    setProgress(0);
    setShowDiff(false);

    const startTime = Date.now();
    const duration = 1500; // Shorter duration for text processing

    const interval = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const p = Math.min((elapsedTime / duration) * 100, 100);
      setProgress(p);

      if (p >= 100) {
        clearInterval(interval);
        setIsComparing(false);
        setShowDiff(true);
      }
    }, 50);
  };
  
  const handleReset = () => {
    setShowDiff(false);
    setIsComparing(false);
    setProgress(0);
  }

  const differences = useMemo((): DiffPart[] => {
    if (!showDiff) return [];
    return diffChars(originalText, changedText);
  }, [originalText, changedText, showDiff]);

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="text-center">
            <CardTitle className="text-3xl font-bold tracking-tight lg:text-4xl">Online Text Difference Checker</CardTitle>
            <CardDescription className="text-base mt-2">
              Paste two blocks of text to see the differences highlighted.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isComparing && !showDiff && (
             <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="original-text">Original Text</Label>
                  <Textarea
                    id="original-text"
                    value={originalText}
                    onChange={(e) => setOriginalText(e.target.value)}
                    className="min-h-[300px] font-mono"
                    placeholder="Paste the first version of your text here."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="changed-text">Changed Text</Label>
                  <Textarea
                    id="changed-text"
                    value={changedText}
                    onChange={(e) => setChangedText(e.target.value)}
                    className="min-h-[300px] font-mono"
                    placeholder="Paste the second version of your text here."
                  />
                </div>
              </div>
          )}
         
          {isComparing && (
            <div className="flex min-h-[300px] flex-col items-center justify-center space-y-4">
              <CircularProgress progress={progress} />
              <p className="text-sm text-muted-foreground">Comparing...</p>
            </div>
          )}

          {showDiff && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                 <div className="space-y-2">
                    <Label>Original Text</Label>
                     <ScrollArea className="h-[300px] w-full rounded-md border font-mono">
                        <pre className="whitespace-pre-wrap p-2 text-sm">{originalText}</pre>
                     </ScrollArea>
                 </div>
                 <div className="space-y-2">
                    <Label>Compared Text</Label>
                    <ScrollArea className="h-[300px] w-full rounded-md border font-mono">
                        <pre className="whitespace-pre-wrap p-2 text-sm">
                          {differences.map((part, index) => (
                            <span
                              key={index}
                              className={cn({
                                'bg-red-100/80 dark:bg-red-900/50 text-red-900 dark:text-red-200 line-through': part.removed,
                                'bg-green-100/80 dark:bg-green-900/50 text-green-900 dark:text-green-200': part.added,
                              })}
                            >
                              {part.value}
                            </span>
                          ))}
                        </pre>
                    </ScrollArea>
                 </div>
              </div>
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
                 <div className="flex justify-center pt-4">
                    <SharePrompt toolName="Text Difference Checker" />
                 </div>
            </div>
          )}

          <div className="flex justify-center">
            {showDiff ? (
                <Button variant="secondary" onClick={handleReset}>
                  <Pencil className="mr-2 h-4 w-4" /> Make a New Comparison
               </Button>
            ) : (
                <Button onClick={handleCompare} disabled={!originalText || !changedText || isComparing}>
                  <GitCompareArrows className="mr-2 h-4 w-4" /> {isComparing ? 'Comparing...' : 'Compare Texts'}
                </Button>
            )}
          </div>
          
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>About the Text Difference Checker</CardTitle>
          <CardDescription>
            A simple yet powerful tool for tracking changes and comparing documents.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Accordion type="single" collapsible defaultValue="item-1">
            <AccordionItem value="item-1">
              <AccordionTrigger>What is a "Diff" Tool?</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <p>
                  A "diff" (short for difference) tool is a utility that compares two versions of a file or text and displays the differences between them. It's an indispensable tool for programmers, writers, editors, and anyone who needs to track revisions or identify changes between two blocks of text.
                </p>
                <p>Our tool provides a simple visual representation, highlighting added characters in green and removed characters in red, making it easy to spot changes at a glance.</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>How to Use the Text Diff Checker</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <ol className="list-decimal list-inside space-y-2">
                  <li><strong>Paste Original Text:</strong> Copy the first version of your text and paste it into the "Original Text" box on the left.</li>
                  <li><strong>Paste Changed Text:</strong> Paste the second, modified version of your text into the "Changed Text" box on the right.</li>
                  <li><strong>Compare:</strong> Click the "Compare Texts" button.</li>
                  <li><strong>View Differences:</strong> The right-hand box will transform to display the results. Text that was removed from the original is highlighted in red, and text that was added in the new version is highlighted in green. Unchanged text remains plain.</li>
                  <li><strong>Edit Again:</strong> To make new changes, simply click the "Edit" button to return to the input view.</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Tips for Effective Comparison</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Character-by-Character:</strong> This tool performs a character-by-character comparison, which is excellent for finding small typos, punctuation changes, or subtle wording adjustments.</li>
                  <li><strong>Large Documents:</strong> The tool works entirely within your browser, so you can compare large blocks of text without worrying about your data being sent to a server. Performance may vary on extremely large documents.</li>
                  <li><strong>Use for Code:</strong> This is a great way to quickly check for small changes in code snippets without needing to commit them to a version control system like Git.</li>
                  <li><strong>Whitespace Matters:</strong> The comparison is literal. Changes in spacing, new lines, and tabs will be highlighted as differences. This is useful for cleaning up code or text formatting.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
