
'use client';

import { useState } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { Braces, Copy, Trash2 } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function JsonBeautifierPage() {
  const [jsonInput, setJsonInput] = useState('');
  const [formattedJson, setFormattedJson] = useState('');
  const { toast } = useToast();

  const handleFormat = () => {
    if (!jsonInput.trim()) {
      toast({
        title: 'Input is Empty',
        description: 'Please paste some JSON to format.',
        variant: 'destructive',
      });
      return;
    }
    try {
      const parsedJson = JSON.parse(jsonInput);
      const beautified = JSON.stringify(parsedJson, null, 2);
      setFormattedJson(beautified);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: 'Invalid JSON',
        description: `Could not parse the JSON. Please check for syntax errors. \nError: ${errorMessage}`,
        variant: 'destructive',
      });
      setFormattedJson('');
    }
  };

  const handleClear = () => {
    setJsonInput('');
    setFormattedJson('');
  };
  
  const copyToClipboard = (text: string, fieldName: string) => {
    if (!text) {
         toast({ title: 'Nothing to Copy', description: 'The output is empty.', variant: 'destructive' });
        return;
    };
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: 'Copied to Clipboard',
        description: `${fieldName} copied successfully.`,
      });
    }).catch(err => {
      toast({
        title: 'Error',
        description: `Could not copy ${fieldName}.`,
        variant: 'destructive',
      });
    });
  };


  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">JSON Beautifier</CardTitle>
          <CardDescription className="text-base">
            Paste your JSON data to format and beautify it for better readability.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="json-input">Raw JSON</Label>
              <Textarea
                id="json-input"
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                className="min-h-[400px] font-mono"
                placeholder='{ "hello": "world", "numbers": [1, 2, 3] }'
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="formatted-json">Beautified JSON</Label>
                 <Button variant="ghost" size="sm" onClick={() => copyToClipboard(formattedJson, 'Formatted JSON')}>
                    <Copy className="mr-2 h-4 w-4" /> Copy
                </Button>
              </div>
              <Textarea
                id="formatted-json"
                value={formattedJson}
                readOnly
                className="min-h-[400px] font-mono bg-muted/50"
                placeholder="Your formatted JSON will appear here."
              />
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <Button onClick={handleFormat}>
              <Braces className="mr-2 h-4 w-4" /> Beautify JSON
            </Button>
            <Button variant="outline" onClick={handleClear} disabled={!jsonInput && !formattedJson}>
              <Trash2 className="mr-2 h-4 w-4" /> Clear
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>About the JSON Beautifier</CardTitle>
          <CardDescription>
            Learn how to make your JSON data human-readable and easy to debug.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Accordion type="single" collapsible defaultValue="item-1">
            <AccordionItem value="item-1">
              <AccordionTrigger>What is JSON?</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <p>
                  JSON (JavaScript Object Notation) is a lightweight data-interchange format that is easy for humans to read and write and easy for machines to parse and generate. It is often used for transmitting data between a server and a web application as an alternative to XML.
                </p>
                <p>
                  However, raw JSON data is often minified (all whitespace is removed) to save space, making it a long, unreadable single line of text.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>How to Use the JSON Beautifier</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <ol className="list-decimal list-inside space-y-2">
                  <li><strong>Paste Your JSON:</strong> Copy your minified or messy JSON data and paste it into the "Raw JSON" text area on the left.</li>
                  <li><strong>Beautify:</strong> Click the "Beautify JSON" button.</li>
                  <li><strong>View & Copy:</strong> The tool will instantly parse and reformat the JSON with proper indentation and line breaks, displaying it in the "Beautified JSON" text area on the right. You can then easily read it or copy it for use elsewhere.</li>
                  <li><strong>Error Handling:</strong> If your input is not valid JSON, the tool will display an error message to help you find and fix the syntax issue.</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Tips for Working with JSON</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Check Your Syntax:</strong> The most common JSON errors are missing commas between properties, extra commas after the last property, or using single quotes instead of double quotes for keys and string values.</li>
                  <li><strong>Debugging:</strong> Use a beautifier like this one to make API responses or configuration files readable. It's much easier to spot errors in a formatted structure than in a single line.</li>
                  <li><strong>Online Validators:</strong> While our tool helps with formatting, you can use an online JSON validator if you need a more detailed syntax check.</li>
                  <li><strong>Privacy:</strong> This tool is safe for sensitive data because all formatting happens in your browser. Your data is never sent to a server.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
