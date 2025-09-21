
import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppName } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Privacy Policy',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 md:px-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Privacy Policy for {AppName}</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm md:prose-base max-w-none text-muted-foreground space-y-4">
            
            <p>Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

            <p>Welcome to {AppName} ("we," "us," or "our"). We are committed to protecting your privacy. This Privacy Policy explains how we handle your information when you use our website and its tools (the "Service").</p>

            <h2 className="text-xl font-semibold text-foreground">1. Information We Do NOT Collect</h2>
            <p>A core principle of our Service is user privacy. Our tools (such as the image compressor, PDF merger, etc.) are designed to work entirely within your web browser.</p>
            <ul className="list-disc list-inside space-y-1">
                <li><strong>No File Uploads:</strong> We do not upload your files, images, or documents to our servers. All processing happens on your own computer.</li>
                <li><strong>No Personal Data Storage:</strong> We do not ask for, collect, or store any personal information like your name, email address, or other contact details through the use of our tools.</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground">2. Information We Do Collect (Analytics)</h2>
            <p>To improve our Service and understand how users interact with our website, we may use third-party analytics services like Google Analytics. These services may collect:</p>
            <ul className="list-disc list-inside space-y-1">
                <li><strong>Usage Data:</strong> Information such as your device's IP address, browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, and other diagnostic data.</li>
            </ul>
            <p>This data is aggregated and anonymized wherever possible and is used solely for the purpose of improving our website's performance and user experience.</p>
            
            <h2 className="text-xl font-semibold text-foreground">3. Cookies and Tracking Technologies</h2>
            <p>We may use cookies and similar tracking technologies to track activity on our Service and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier.</p>
            <p>We use cookies to serve personalized ads through Google AdSense. Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our sites and/or other sites on the Internet.</p>
            
            <h2 className="text-xl font-semibold text-foreground">4. Third-Party Services (Google AdSense)</h2>
            <p>We use Google AdSense to display advertisements on our site. Google may use cookies to serve ads based on a user's prior visits to our website or other websites. You can opt out of personalized advertising by visiting Google's Ad Settings.</p>

            <h2 className="text-xl font-semibold text-foreground">5. Children's Privacy</h2>
            <p>Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from anyone under the age of 13.</p>

            <h2 className="text-xl font-semibold text-foreground">6. Changes to This Privacy Policy</h2>
            <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.</p>

            <h2 className="text-xl font-semibold text-foreground">7. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at admin@onlinejpgpdf.com.</p>
        </CardContent>
      </Card>
    </div>
  );
}
