
import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppName } from '@/lib/constants';
import Header from '@/components/ui/header';
import Footer from '@/components/ui/footer';

export const metadata: Metadata = {
  title: 'About Us',
};

export default function AboutPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="flex-1">
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
                  {AppName} was born out of a simple frustration every student knows: constantly hitting paywalls and sign-up forms just to use a basic online tool. Whether it was compressing an image for a project, converting a file for a class assignment, or merging PDFs for research, I found myself jumping between different websites, each with its own limitations. I envisioned a single, reliable hub where all these essential utilities could live together—beautifully designed, completely free, and with no strings attached.
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
                <h2 className="text-2xl font-semibold text-foreground">Meet the Team</h2>
                <p>
                  {AppName} is a passion project built and maintained by a single student developer dedicated to creating useful and accessible web applications for everyone.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
