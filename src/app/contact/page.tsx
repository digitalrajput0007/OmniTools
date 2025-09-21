
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Mail, Copy } from 'lucide-react';
import Header from '@/components/ui/header';
import Footer from '@/components/ui/footer';

// Note: We are keeping the Metadata export for Next.js to use static analysis.
// This page is a client component to support the interactive 'copy' button.
// import type { Metadata } from 'next';
// export const metadata: Metadata = {
//   title: 'Contact Us',
// };

export default function ContactPage() {
  const { toast } = useToast();
  const email = 'admin@onlinejpgpdf.com';

  const copyEmail = () => {
    navigator.clipboard.writeText(email).then(() => {
      toast({
        title: 'Email Copied',
        description: 'The email address has been copied to your clipboard.',
      });
    }).catch(err => {
      console.error('Failed to copy email: ', err);
      toast({
        title: 'Error',
        description: 'Could not copy the email address.',
        variant: 'destructive',
      });
    });
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-2xl py-12 px-4 md:px-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-headline">Contact Us</CardTitle>
              <CardDescription>
                We'd love to hear from you.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <p className="text-muted-foreground">
                For support, feature requests, partnership opportunities, or general inquiries, please don't hesitate to reach out. The best way to get in touch with us is by email.
              </p>
              
              <div className="flex flex-col items-center gap-4 rounded-lg border bg-secondary/30 p-6">
                <div className="flex items-center gap-2 text-lg font-semibold text-primary">
                  <Mail className="h-5 w-5" />
                  <span>{email}</span>
                </div>
                <div className='flex gap-4'>
                    <Button onClick={copyEmail}>
                        <Copy className="mr-2 h-4 w-4" /> Copy Email
                    </Button>
                     <Button variant="outline" asChild>
                        <a href={`mailto:${email}`}>
                            <Mail className="mr-2 h-4 w-4" /> Open in Mail App
                        </a>
                    </Button>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">
                We do our best to respond to all messages within 2-3 business days.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
