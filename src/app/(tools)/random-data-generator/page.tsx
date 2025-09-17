'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Copy, RefreshCw, ClipboardCopy, FileDown } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Data sources
const firstNames = ["Alice", "Bob", "Charlie", "Diana", "Ethan", "Fiona", "George", "Hannah", "Ian", "Julia"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"];
const defaultDomains = ["example.com", "mail.co", "inbox.org", "test.net"];
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

const baseGenerators: Record<string, () => string> = {
  'First Name': () => getRandomItem(firstNames),
  'Last Name': () => getRandomItem(lastNames),
  'Phone Number': () => `(${getRandomNumber(200, 999)}) ${getRandomNumber(100, 999)}-${getRandomNumber(1000, 9999)}`,
  'Address': () => `${getRandomNumber(1, 9999)} ${getRandomItem(streetNames)}`,
  'City': () => getRandomItem(cities),
  'Country': () => getRandomItem(countries),
  'Integer': () => getRandomNumber(0, 1000).toString(),
  'Float': () => getRandomFloat(0, 1000, 2),
  'UUID': generateUUID,
};

type DataType = keyof typeof baseGenerators | 'Full Name' | 'Email';
type GeneratedRecord = Partial<Record<DataType, string>>;

export default function RandomDataGeneratorPage() {
  const [selectedFields, setSelectedFields] = useState<DataType[]>(['Full Name', 'Email']);
  const [count, setCount] = useState(10);
  const [customDomain, setCustomDomain] = useState('');
  const [generatedData, setGeneratedData] = useState<GeneratedRecord[]>([]);
  const { toast } = useToast();
  
  const availableFields: DataType[] = ['First Name', 'Last Name', 'Full Name', 'Email', 'Phone Number', 'Address', 'City', 'Country', 'Integer', 'Float', 'UUID'];
  const fieldOrder: DataType[] = ['First Name', 'Last Name', 'Full Name', 'Phone Number', 'Email', 'Address', 'City', 'Country', 'Integer', 'Float', 'UUID'];

  const displayedFields = useMemo(() => {
    return fieldOrder.filter(field => selectedFields.includes(field));
  }, [selectedFields]);

  const handleFieldToggle = (field: DataType) => {
    setSelectedFields(prev => 
      prev.includes(field) 
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const handleGenerate = () => {
    if (selectedFields.length === 0) {
      toast({
        title: 'No Fields Selected',
        description: 'Please select at least one data type to generate.',
        variant: 'destructive',
      });
      return;
    }
    
    const newData = Array.from({ length: count }, () => {
      const record: GeneratedRecord = {};
      const domain = customDomain || getRandomItem(defaultDomains);

      let firstName = '';
      let lastName = '';
      let fullName = '';

      // Generate base name fields first if needed
      if (selectedFields.includes('First Name')) {
        firstName = baseGenerators['First Name']();
        record['First Name'] = firstName;
      }
      if (selectedFields.includes('Last Name')) {
        lastName = baseGenerators['Last Name']();
        record['Last Name'] = lastName;
      }
      if (selectedFields.includes('Full Name')) {
        const fn = firstName || baseGenerators['First Name']();
        const ln = lastName || baseGenerators['Last Name']();
        if (!firstName) firstName = fn;
        if (!lastName) lastName = ln;
        fullName = `${fn} ${ln}`;
        record['Full Name'] = fullName;
      }

      // Handle other fields, including email with its special logic
      selectedFields.forEach(field => {
        if (field === 'Email') {
          if (firstName && lastName) {
            record.Email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;
          } else if (firstName) {
            record.Email = `${firstName.toLowerCase()}@${domain}`;
          } else if (fullName) {
             const nameParts = fullName.split(' ');
             const fn = nameParts[0] || '';
             const ln = nameParts.slice(1).join(' ') || '';
             record.Email = `${fn.toLowerCase()}.${ln.toLowerCase().replace(/ /g,'.')}@${domain}`;
          } else {
            const fn = baseGenerators['First Name']();
            const ln = baseGenerators['Last Name']();
            record.Email = `${fn.toLowerCase()}.${ln.toLowerCase()}@${domain}`;
          }
        } else if (baseGenerators[field] && !record[field]) {
          record[field] = baseGenerators[field]();
        }
      });
      return record;
    });
    setGeneratedData(newData);
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
    const header = displayedFields.join('\t');
    const rows = generatedData.map(row => displayedFields.map(field => row[field] ?? '').join('\t'));
    const allData = [header, ...rows].join('\n');
    copyToClipboard(allData, 'All generated data');
  }

  const exportToPdf = () => {
    if (generatedData.length === 0) return;
    const doc = new jsPDF();
    (doc as any).autoTable({
      head: [displayedFields],
      body: generatedData.map(row => displayedFields.map(field => row[field] ?? '')),
    });
    doc.save('random-data.pdf');
  };

  const exportToExcel = () => {
    if (generatedData.length === 0) return;
    const worksheet = XLSX.utils.json_to_sheet(generatedData.map(row => {
      const newRow: Record<string, string | undefined> = {};
      displayedFields.forEach(field => {
        newRow[field] = row[field];
      });
      return newRow;
    }));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Random Data');
    XLSX.writeFile(workbook, 'random-data.xlsx');
  };

  // Generate initial data on load, only on client
  useEffect(() => {
    handleGenerate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="md:col-span-3">
              <Label>Data Fields to Generate</Label>
              <Card className="mt-2">
                <CardContent className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 md:grid-cols-4">
                  {availableFields.map(key => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={key}
                        checked={selectedFields.includes(key as DataType)}
                        onCheckedChange={() => handleFieldToggle(key as DataType)}
                      />
                      <label
                        htmlFor={key}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {key}
                      </label>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="count">Number of Rows</Label>
                <Input
                    id="count"
                    type="number"
                    value={count}
                    onChange={(e) => setCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    min="1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="custom-domain">Custom Email Domain (Optional)</Label>
                <Input
                  id="custom-domain"
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder="e.g., mycompany.com"
                />
              </div>
              <Button onClick={handleGenerate} className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Generate Data
              </Button>
            </div>
          </div>
          
          <Card className="bg-muted/30">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-lg">Generated Data</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={copyAllToClipboard} disabled={generatedData.length === 0}>
                      <ClipboardCopy className="mr-2 h-4 w-4" />
                      Copy All
                  </Button>
                   <Button variant="outline" size="sm" onClick={exportToPdf} disabled={generatedData.length === 0}>
                      <FileDown className="mr-2 h-4 w-4" />
                      PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportToExcel} disabled={generatedData.length === 0}>
                      <FileDown className="mr-2 h-4 w-4" />
                      Excel
                  </Button>
                </div>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-96 w-full rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {displayedFields.map(field => <TableHead key={field}>{field}</TableHead>)}
                          <TableHead className="w-[50px] text-right">Copy</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {generatedData.length > 0 ? (
                          generatedData.map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                              {displayedFields.map(field => (
                                <TableCell key={field} className="font-mono text-xs">{row[field]}</TableCell>
                              ))}
                              <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(displayedFields.map(field => row[field]).join(', '), 'Row')}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={displayedFields.length + 1} className="h-24 text-center">
                              No data generated. Select fields and click "Generate Data".
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                </ScrollArea>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
