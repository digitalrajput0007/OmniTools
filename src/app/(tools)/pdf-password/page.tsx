
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';

export default function PdfPasswordPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="text-center">
             <CardTitle className="text-3xl font-bold tracking-tight lg:text-4xl">PDF Password Tool</CardTitle>
             <CardDescription className="text-base mt-2">
              Secure your PDFs with a password or remove existing protection.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Feature Under Maintenance</AlertTitle>
            <AlertDescription>
              <p>The PDF Password tool is temporarily unavailable.</p>
              <p className="mt-2">
                We are working to implement a solution that provides industry-standard, secure encryption compatible with all major PDF viewers. This requires a specific browser technology (WASM) that is currently unavailable in our environment.
              </p>
              <p className="mt-2">Thank you for your patience.</p>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
