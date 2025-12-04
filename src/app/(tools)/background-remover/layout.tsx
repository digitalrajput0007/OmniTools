import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'AI Background Remover - Free Tool to Make Backgrounds Transparent | Online JPG PDF',
  description: 'Automatically remove the background from any image with our free AI-powered tool. Get a transparent background in seconds, no sign-up required.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
