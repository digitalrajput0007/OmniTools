
import Link from 'next/link';
import { AppName } from '@/lib/constants';
import { AppLogo } from '@/components/ui/header';

export default function Footer() {
    return (
        <footer className="border-t bg-secondary">
            <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row md:px-6">
                <div className="flex flex-col items-center gap-2 sm:items-start">
                    <Link href="/" className="font-headline text-xl font-semibold" aria-label="Home">
                        {AppName}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                        &copy; {new Date().getFullYear()} {AppName}. All rights reserved.
                    </p>
                </div>
                <nav className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-center sm:ml-auto sm:gap-6 sm:text-left">
                    <Link
                        className="text-xs underline-offset-4 hover:underline"
                        href="/about"
                    >
                        About Us
                    </Link>
                    <Link
                        className="text-xs underline-offset-4 hover:underline"
                        href="/contact"
                    >
                        Contact
                    </Link>
                    <Link
                        className="text-xs underline-offset-4 hover:underline"
                        href="/terms"
                    >
                        Terms of Service
                    </Link>
                    <Link
                        className="text-xs underline-offset-4 hover:underline"
                        href="/privacy"
                    >
                        Privacy Policy
                    </Link>
                </nav>
            </div>
        </footer>
    );
}
