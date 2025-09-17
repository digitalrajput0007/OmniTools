
import type { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { AppName } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Contact Us',
};

export default function ContactPage() {
  return (
    <div className="container mx-auto max-w-2xl py-12 px-4 md:px-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">Contact Us</CardTitle>
          <CardDescription>
            We'd love to hear from you. Fill out the form below or email us at [your-email@example.com].
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground">
            For support, feature requests, or general inquiries, please get in touch. We typically respond within 2-3 business days.
          </p>
          <div className="text-center text-sm text-red-500 font-bold">
            [Note: This is a placeholder form and does not actually send messages. You will need to integrate an email sending service to make it functional.]
          </div>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Your Name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="your.email@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" placeholder="Your message..." className="min-h-[150px]" />
            </div>
            <Button type="submit" className="w-full" disabled>
              Send Message
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
