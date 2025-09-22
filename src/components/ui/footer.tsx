
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="border-t bg-secondary">
            <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row md:px-6">
                <div className="flex flex-col items-center gap-2 sm:items-start">
                    <p className="text-center text-xs text-muted-foreground sm:text-left">
                        © {new Date().getFullYear()} onlinejpgpdf.com. All rights reserved.
                    </p>
                </div>
                <nav className="flex w-full flex-wrap justify-center gap-x-4 gap-y-2 text-center sm:ml-auto sm:justify-end sm:gap-6">
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
