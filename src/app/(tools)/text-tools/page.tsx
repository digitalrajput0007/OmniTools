'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CaseLower, CaseUpper, Pilcrow, VenetianMask, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const toTitleCase = (str: string) => {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  );
};

const toSentenceCase = (str: string) => {
  if (!str) return '';
  const lowercased = str.toLowerCase();
  return lowercased.replace(/(^\s*\w|[.!?]\s+\w)/g, (c) => c.toUpperCase());
};

export default function TextToolsPage() {
  const [text, setText] = useState('');
  const [activeTab, setActiveTab] = useState('stats');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const stats = useMemo(() => {
    const trimmedText = text.trim();
    const words = trimmedText.split(/\s+/).filter(Boolean);
    const wordCount = words.length === 1 && words[0] === '' ? 0 : words.length;
    const characterCount = text.length;
    return { wordCount, characterCount };
  }, [text]);

  const handleRemoveExtraSpaces = () => {
    if (isProcessing) return;

    setIsProcessing(true);
    setProgress(0);

    const duration = 3000;
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const p = Math.min((elapsedTime / duration) * 100, 100);
      setProgress(p);

      if (p >= 100) {
        clearInterval(interval);
        setText((currentText) => currentText.replace(/\s+/g, ' ').trim());
        setIsProcessing(false);
        toast({
          title: 'Success',
          description: 'Extra spaces have been removed.',
        });
      }
    }, 50);
  };

  const handleConvertToUppercase = () => {
    setText(text.toUpperCase());
  };

  const handleConvertToLowercase = () => {
    setText(text.toLowerCase());
  };

  const handleConvertToTitleCase = () => {
    setText(toTitleCase(text));
  };

  const handleConvertToSentenceCase = () => {
    setText(toSentenceCase(text));
  };

  const handleClearText = () => {
    setText('');
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className='text-2xl'>Text Tools</CardTitle>
          <CardDescription className="text-base">
            A versatile set of tools to analyze and transform your text.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            defaultValue="stats"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="stats">Statistics</TabsTrigger>
              <TabsTrigger value="spacing">Spacing</TabsTrigger>
              <TabsTrigger value="case">Case</TabsTrigger>
            </TabsList>
            <div className="mt-6 space-y-4">
              <Textarea
                placeholder="Paste or type your text here..."
                className="min-h-[300px] text-base"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <Button variant="outline" onClick={handleClearText} disabled={!text}>
                Clear Text
              </Button>
            </div>

            <TabsContent value="stats" className="pt-6">
              <Card>
                <CardContent className="space-y-6 p-6">
                  <div className="flex justify-around text-center">
                    <div>
                      <p className="text-3xl font-bold">{stats.wordCount}</p>
                      <p className="text-muted-foreground">Words</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold">
                        {stats.characterCount}
                      </p>
                      <p className="text-muted-foreground">Characters</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="spacing" className="pt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Remove Extra Spaces</CardTitle>
                  <CardDescription>
                    Removes leading, trailing, and multiple consecutive spaces
                    from your text.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center space-y-4">
                  {isProcessing ? (
                    <>
                      <CheckCircle2 className="h-16 w-16 text-green-500" />
                      <p className="text-sm text-muted-foreground">
                        Processing...
                      </p>
                    </>
                  ) : (
                    <Button
                      onClick={handleRemoveExtraSpaces}
                      disabled={!text}
                      className="w-full max-w-sm"
                    >
                      <VenetianMask className="mr-2 h-4 w-4" />
                      Apply Space Removal
                    </Button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="case" className="pt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Case Converter</CardTitle>
                  <CardDescription>
                    Quickly change the capitalization of your text.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center justify-center gap-2">
                  <Button onClick={handleConvertToUppercase} disabled={!text}>
                    <CaseUpper className="mr-2 h-4 w-4" />
                    UPPERCASE
                  </Button>
                  <Button onClick={handleConvertToLowercase} disabled={!text}>
                    <CaseLower className="mr-2 h-4 w-4" />
lowercase
                  </Button>
                  <Button onClick={handleConvertToTitleCase} disabled={!text}>
                    <Pilcrow className="mr-2 h-4 w-4" />
                    Title Case
                  </Button>
                  <Button onClick={handleConvertToSentenceCase} disabled={!text}>
                    <Pilcrow className="mr-2 h-4 w-4" />
                    Sentence case
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>About the Text Tools</CardTitle>
          <CardDescription>
            A guide to analyzing, cleaning, and formatting your text with ease.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Accordion type="single" collapsible defaultValue="item-1">
            <AccordionItem value="item-1">
              <AccordionTrigger>Text Statistics</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <p>
                  The "Statistics" tab provides a live analysis of your text.
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Word Count:</strong> Counts the number of words in your text, perfect for essays, articles, and social media posts where length is important.</li>
                  <li><strong>Character Count:</strong> Counts every character, including spaces. This is useful for platforms with strict character limits, like Twitter or SMS messages.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Spacing and Case Tools</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <p>These tools help you clean up and standardize your text formatting instantly.</p>
                 <ul className="list-disc list-inside space-y-2">
                  <li><strong>Remove Extra Spaces:</strong> This function removes all leading and trailing spaces, and collapses multiple spaces between words into a single space. It's great for cleaning up text copied from emails, PDFs, or other messy sources.</li>
                  <li><strong>Case Converter:</strong>
                    <ul className="list-disc list-inside pl-4 mt-1">
                      <li><strong>UPPERCASE:</strong> Converts every letter to its uppercase form.</li>
                      <li><strong>lowercase:</strong> Converts every letter to its lowercase form.</li>
                      <li><strong>Title Case:</strong> Capitalizes the first letter of every word. Ideal for headlines and titles.</li>
                      <li><strong>Sentence case:</strong> Capitalizes only the first letter of the first word in each sentence.</li>
                    </ul>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>How to Use the Text Tools</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                 <ol className="list-decimal list-inside space-y-2">
                  <li><strong>Enter Text:</strong> Type or paste your text into the main text area.</li>
                  <li><strong>View Statistics:</strong> Navigate to the "Statistics" tab to see a live word and character count.</li>
                  <li><strong>Clean Spacing:</strong> Go to the "Spacing" tab and click "Apply Space Removal" to clean up your text.</li>
                  <li><strong>Change Case:</strong> Switch to the "Case" tab and click any of the conversion buttons to instantly change the capitalization of your entire text.</li>
                  <li><strong>Clear Text:</strong> Use the "Clear Text" button at any time to start over with a blank slate.</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
