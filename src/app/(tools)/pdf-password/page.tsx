
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function PdfPasswordPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="text-center">
             <CardTitle className="text-3xl font-bold tracking-tight lg:text-4xl">Add or Remove PDF Password</CardTitle>
             <CardDescription className="text-base mt-2">
              Secure your PDFs with a password or remove existing protection.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
            <Alert>
              <Terminal className="h-4 w-4" />
              <AlertTitle>Feature Under Maintenance</AlertTitle>
              <AlertDescription>
                <p>
                  The PDF Password tool is temporarily unavailable.
                </p>
                <p className="mt-2">
                   We are working to implement a solution that provides industry-standard, secure encryption compatible with all major PDF viewers. Thank you for your patience.
                </p>
              </AlertDescription>
            </Alert>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>About PDF Password Protection</CardTitle>
          <CardDescription>
            Understand how to secure and manage access to your PDF documents.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Accordion type="single" collapsible defaultValue="item-1">
            <AccordionItem value="item-1">
              <AccordionTrigger>Why Protect a PDF?</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <p>
                  Password-protecting a PDF is a crucial step for securing sensitive information. It ensures that only individuals with the correct password can open and view the document's contents. This is ideal for sharing confidential reports, private records, or any document that should not be publicly accessible.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>What is Standard Encryption?</AccordionTrigger>
                <AccordionContent>
                    <p className="text-muted-foreground">
                        Standard PDF encryption (like AES-256) ensures that the file is truly secure and will prompt for a password in viewers like Adobe Acrobat, Apple Preview, and modern browsers. Our goal is to provide this level of security, and we are actively working on it.
                    </p>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Security and Compatibility</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <ul className="list-disc list-inside space-y-2">
                    <li><strong>Client-Side Security:</strong> The entire encryption and decryption process happens in your browser. Your PDF and your password are never sent to a server, ensuring maximum privacy.</li>
                    <li><strong>Forgot Your Password?</strong> This tool cannot recover lost passwords. If you forget the password to an encrypted PDF, you will not be able to open it.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
