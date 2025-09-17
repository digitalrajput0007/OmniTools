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
import { CaseLower, CaseUpper, Pilcrow, VenetianMask } from 'lucide-react';

const toTitleCase = (str: string) => {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  );
};

export default function TextToolsPage() {
  const [text, setText] = useState('');
  const [activeTab, setActiveTab] = useState('stats');

  const stats = useMemo(() => {
    const trimmedText = text.trim();
    const words = trimmedText.split(/\s+/).filter(Boolean);
    const wordCount = words.length === 1 && words[0] === '' ? 0 : words.length;
    const characterCount = text.length;
    return { wordCount, characterCount };
  }, [text]);

  const handleRemoveExtraSpaces = () => {
    setText(text.replace(/\s+/g, ' ').trim());
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
  
  const handleClearText = () => {
    setText('');
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Text Tools</CardTitle>
          <CardDescription>
            A versatile set of tools to analyze and transform your text.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="stats">
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
                <Button variant="outline" onClick={handleClearText} disabled={!text}>Clear Text</Button>
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
                          <p className="text-3xl font-bold">{stats.characterCount}</p>
                          <p className="text-muted-foreground">Characters</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="spacing" className="pt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className='text-xl'>Remove Extra Spaces</CardTitle>
                      <CardDescription>
                        Removes leading, trailing, and multiple consecutive spaces from your text.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button onClick={handleRemoveExtraSpaces} disabled={!text}>
                        <VenetianMask className="mr-2 h-4 w-4" />
                        Apply Space Removal
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="case" className="pt-6">
                  <Card>
                     <CardHeader>
                        <CardTitle className='text-xl'>Case Converter</CardTitle>
                        <CardDescription>
                            Quickly change the capitalization of your text.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
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
                    </CardContent>
                  </Card>
                </TabsContent>
           </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
