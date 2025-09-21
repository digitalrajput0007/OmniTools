
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PdfSignaturePage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight lg:text-4xl">Add Signature / Fill Form</CardTitle>
          <CardDescription className="text-base mt-2">
            This tool is under construction. We are working hard to bring you a full-featured PDF signing and form-filling experience.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed">
            <p className="text-muted-foreground">Coming Soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
