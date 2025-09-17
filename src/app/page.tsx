import Link from 'next/link';
import { AppLogo, AppName, tools } from '@/lib/constants';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex items-center gap-3 border-b p-4 md:px-6">
        <AppLogo className="h-8 w-8 text-primary" />
        <h1 className="font-headline text-2xl font-bold tracking-tighter">
          {AppName}
        </h1>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-5xl">
                  Your All-in-One Utility Hub
                </h2>
                <p className="mx-auto max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  OmniToolbox provides a suite of powerful, easy-to-use online
                  tools to streamline your daily tasks. No installation,
                  completely free.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-sm grid-cols-1 gap-6 py-12 sm:max-w-2xl sm:grid-cols-2 lg:max-w-5xl lg:grid-cols-3 xl:max-w-7xl xl:grid-cols-4">
              {tools.map((tool) => (
                <Link href={tool.path} key={tool.name} className="group">
                  <Card className="h-full transition-all duration-300 hover:scale-105 hover:border-primary hover:shadow-lg">
                    <CardHeader className="flex flex-row items-center gap-4">
                      <div className="rounded-md bg-primary/10 p-3">
                        <tool.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="font-headline text-lg">
                          {tool.name}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {tool.description}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <div className="px-6 pb-4">
                      <span className="flex items-center gap-1 text-sm font-semibold text-primary group-hover:text-accent-foreground">
                        Use Tool{' '}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="flex w-full shrink-0 flex-col items-center gap-2 border-t px-4 py-6 sm:flex-row md:px-6">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} {AppName}. All rights reserved.
        </p>
        <nav className="flex gap-4 sm:ml-auto sm:gap-6">
          <Link
            className="text-xs underline-offset-4 hover:underline"
            href="#"
          >
            Terms of Service
          </Link>
          <Link
            className="text-xs underline-offset-4 hover:underline"
            href="#"
          >
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
