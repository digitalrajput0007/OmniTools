
import Link from 'next/link';
import { AppName } from '@/lib/constants';

export default function Footer() {
    return (
        <footer className="flex w-full shrink-0 flex-col items-center gap-2 border-t bg-secondary px-4 py-6 sm:flex-row md:px-6">
            <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {AppName}. All rights reserved.
            </p>
            <nav className="flex flex-wrap justify-center gap-x-4 gap-y-2 sm:ml-auto sm:gap-6">
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
        </footer>
    );
}
