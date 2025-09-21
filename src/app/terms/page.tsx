
import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppName } from '@/lib/constants';
import Header from '@/components/ui/header';
import Footer from '@/components/ui/footer';

export const metadata: Metadata = {
  title: 'Terms of Service',
};

export default function TermsOfServicePage() {
  return (
    <>
      <Header />
      <div className="container mx-auto max-w-4xl py-12 px-4 md:px-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-headline">Terms of Service for {AppName}</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base max-w-none text-muted-foreground space-y-4">
              
              <p>Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

              <p>Please read these Terms of Service ("Terms") carefully before using the {AppName} website (the "Service") operated by us.</p>
              
              <p>Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service.</p>

              <h2 className="text-xl font-semibold text-foreground">1. Use of Service</h2>
              <p>You agree to use the Service for lawful purposes only. The tools provided on this website are for your personal and commercial use, provided that your use complies with all applicable laws and these Terms.</p>
              <p>The Service is provided "as is" and "as available" without any warranty or condition, express, implied, or statutory. We do not warrant that the Service will be uninterrupted, timely, secure, or error-free.</p>

              <h2 className="text-xl font-semibold text-foreground">2. No Warranty and Limitation of Liability</h2>
              <p>Our tools operate on a best-effort basis. While we strive for accuracy and reliability, we do not guarantee the results. Any action you take upon the information or output from our tools is strictly at your own risk. We will not be liable for any losses and/or damages in connection with the use of our website, including but not to limited to data loss, corruption, or business interruption.</p>
              
              <h2 className="text-xl font-semibold text-foreground">3. Intellectual Property</h2>
              <p>The Service and its original content (excluding content provided by users), features, and functionality are and will remain the exclusive property of {AppName} and its licensors. The content you create, process, or modify using our tools remains your own property.</p>
              
              <h2 className="text-xl font-semibold text-foreground">4. Links to Other Websites</h2>
              <p>Our Service may contain links to third-party web sites or services that are not owned or controlled by us. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party web sites or services.</p>

              <h2 className="text-xl font-semibold text-foreground">5. Termination</h2>
              <p>We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>

              <h2 className="text-xl font-semibold text-foreground">6. Governing Law</h2>
              <p>These Terms shall be governed and construed in accordance with the laws of Your Country/State, without regard to its conflict of law provisions.</p>

              <h2 className="text-xl font-semibold text-foreground">7. Changes to These Terms</h2>
              <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms on this page.</p>

              <h2 className="text-xl font-semibold text-foreground">8. Contact Us</h2>
              <p>If you have any questions about these Terms, please contact us at admin@onlinejpgpdf.com.</p>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </>
  );
}
