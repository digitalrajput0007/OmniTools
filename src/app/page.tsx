
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  AppLogo,
  AppName,
  tools
} from '@/lib/constants';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import {
  ArrowRight,
} from 'lucide-react';


export const metadata: Metadata = {
  title: `${AppName} - Free Online Tools for Images, PDFs, and More`,
  description: `Your all-in-one hub for free online utilities. Compress images, convert image formats, merge or split PDFs, generate QR codes, create dummy data, and much more. All tools are private, secure, and work in your browser.`
};


export default function Home() {
  return (
    <>
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-5xl">
                Your All-in-One Utility Hub
              </h2>
              <p className="mx-auto max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                {AppName} offers a comprehensive suite of free, powerful, and easy-to-use online utilities.
                Whether you need to compress images, merge PDFs, convert file formats, generate QR codes, or create dummy data for testing, our tools are designed to streamline your daily tasks—all without installation, right in your browser.
              </p>
            </div>
          </div>
           <div className="mx-auto mt-12 grid max-w-sm grid-cols-1 gap-6 sm:max-w-4xl sm:grid-cols-2 lg:max-w-5xl lg:grid-cols-3 xl:max-w-7xl xl:grid-cols-4">
            {tools.map((tool) => (
              <Link href={tool.path} key={tool.name} className="group">
                <Card className="flex h-full flex-col transition-all duration-300 hover:scale-[1.02] hover:border-primary hover:shadow-lg hover:shadow-primary/10">
                  <CardHeader className="flex-grow flex-row items-start gap-4">
                    <div className="rounded-md bg-primary/10 p-3">
                      <tool.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="font-headline text-lg">
                        {tool.name}
                      </CardTitle>
                      <CardDescription className="mt-1 text-sm">
                        {tool.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardFooter>
                    <span className="flex items-center gap-1 text-sm font-semibold text-primary">
                      Use Tool{' '}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
