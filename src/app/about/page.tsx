
import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppName } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'About Us',
};

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 md:px-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-headline">About {AppName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-muted-foreground">
          <p className="text-lg">
            Welcome to {AppName}, your all-in-one destination for a powerful suite of free online utilities. Our mission is to make everyday digital tasks simpler and more efficient for everyone, from students and professionals to developers and casual internet users.
          </p>
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Our Story</h2>
            <p>
              [**Your Story Here** - Explain why you started this website. Were you a developer who couldn't find all the right tools in one place? A student who wanted to create a helpful resource? Be authentic. For example: "{AppName} was born out of a simple frustration: constantly having to jump between different websites for basic tasks like compressing an image, converting a file, or generating a QR code. We envisioned a single, reliable hub where all these tools could live together, beautifully designed and completely free to use." ]
            </p>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Our Philosophy</h2>
            <p>
              We believe in the power of simplicity and accessibility. That's why our tools are:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li><strong>Completely Free:</strong> No hidden fees, no subscriptions. Just powerful tools at your fingertips.</li>
              <li><strong>Privacy-Focused:</strong> All processing is done in your browser. Your files and data are never uploaded to our servers, ensuring your information remains private.</li>
              <li><strong>Easy to Use:</strong> We prioritize clean, intuitive design. You don't need to be a tech expert to use our tools.</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Meet the Team (Optional)</h2>
            <p>
              [**Your Team Info Here** - If you're a solo creator or a small team, introduce yourself! This adds a human touch. For example: "{AppName} is currently developed and maintained by [Your Name], a passionate software developer dedicated to creating useful and accessible web applications." ]
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
