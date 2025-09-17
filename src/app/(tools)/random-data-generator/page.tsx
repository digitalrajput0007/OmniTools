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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Copy, RefreshCw, ClipboardCopy } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

// Data sources
const firstNames = ["Alice", "Bob", "Charlie", "Diana", "Ethan", "Fiona", "George", "Hannah", "Ian", "Julia"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"];
const domains = ["example.com", "mail.co", "inbox.org", "test.net"];
const streetNames = ["Main St", "Oak Ave", "Pine Ln", "Maple Dr", "Cedar Blvd"];
const cities = ["Springfield", "Rivertown", "Mapleton", "Oakville", "Fairview"];
const countries = ["USA", "Canada", "UK", "Australia", "Germany"];

// Helper functions
const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomNumber = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomFloat = (min: number, max: number, decimals: number) => (Math.random() * (max - min) + min).toFixed(decimals);
const generateUUID = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
  const r = Math.random() * 16 | 0;
  const v = c === 'x' ? r : (r & 0x3 | 0x8);
  return v.toString(16);
});

// Generator map
const generators: Record<string, () => string> = {
  'First Name': () => getRandomItem(firstNames),
  'Last Name': () => getRandomItem(lastNames),
  'Full Name': () => `${getRandomItem(firstNames)} ${getRandomItem(lastNames)}`,
  'Email': () => `${getRandomItem(firstNames).toLowerCase()}.${getRandomItem(lastNames).toLowerCase()}${getRandomNumber(1,99)}@${getRandomItem(domains)}`,
  'Phone Number': () => `(${getRandomNumber(200, 999)}) ${getRandomNumber(100, 999)}-${getRandomNumber(1000, 9999)}`,
  'Address': () => `${getRandomNumber(1, 9999)} ${getRandomItem(streetNames)}`,
  'City': () => getRandomItem(cities),
  'Country': () => getRandomItem(countries),
  'Integer': () => getRandomNumber(0, 1000).toString(),
  'Float': () => getRandomFloat(0, 1000, 2),
  'UUID': generateUUID,
};

type DataType = keyof typeof generators;

export default function RandomDataGeneratorPage() {
  const [dataType, setDataType] = useState<DataType>('Full Name');
  const [count, setCount] = useState(10);
  const [generatedData, setGeneratedData] = useState<string[]>([]);
  const { toast } = useToast();

  const handleGenerate = () => {
    const generator = generators[dataType];
    if (generator) {
      const newData = Array.from({ length: count }, generator);
      setGeneratedData(newData);
    }
  };
  
  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: 'Copied to Clipboard',
        description: `${fieldName} copied.`,
      });
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      toast({
        title: 'Error',
        description: `Could not copy ${fieldName}.`,
        variant: 'destructive',
      });
    });
  };

  const copyAllToClipboard = () => {
    if(generatedData.length === 0) return;
    const allData = generatedData.join('\n');
    copyToClipboard(allData, 'All generated data');
  }

  // Generate initial data on load
  useState(() => {
    handleGenerate();
  });

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Random Data Generator</CardTitle>
          <CardDescription>
            Create various types of dummy data for your projects and testing needs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid gap-6 md:grid-cols-3">
             <div className="space-y-2">
                <Label htmlFor="data-type">Data Type</Label>
                <Select value={dataType} onValueChange={(v) => setDataType(v as DataType)}>
                  <SelectTrigger id="data-type">
                    <SelectValue placeholder="Select data type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(generators).map(key => (
                      <SelectItem key={key} value={key}>{key}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="count">Number of Items</Label>
                <Input
                    id="count"
                    type="number"
                    value={count}
                    onChange={(e) => setCount(Math.max(1, parseInt(e.target.value, 10)))}
                    min="1"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleGenerate} className="w-full">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Generate
                </Button>
              </div>
          </div>
          
          <Card className="bg-muted/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">Generated Data</CardTitle>
                <Button variant="outline" size="sm" onClick={copyAllToClipboard} disabled={generatedData.length === 0}>
                    <ClipboardCopy className="mr-2 h-4 w-4" />
                    Copy All
                </Button>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-72 w-full">
                    <div className="p-1">
                        {generatedData.length > 0 ? (
                            generatedData.map((item, index) => (
                                <div key={index} className="flex items-center justify-between gap-4 p-2 rounded-md hover:bg-background/50">
                                    <p className="font-mono text-sm">{item}</p>
                                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(item, dataType)}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                                <p>Click "Generate" to create data.</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
