
import { tools, toolDescriptions } from '@/lib/constants';
import { notFound } from 'next/navigation';
import ToolClientPage from './client-page';
import type { Metadata } from 'next';

type Props = {
  params: { tool: string };
};

export function generateStaticParams() {
  return tools.map((tool) => ({
    tool: tool.path.substring(1),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const toolSlug = params.tool;
  const tool = tools.find((t) => t.path === `/${toolSlug}`);

  if (!tool) {
    return {
      title: 'Tool Not Found',
    };
  }

  const description = toolDescriptions[tool.path as keyof typeof toolDescriptions] || tool.description;
  const title = `${tool.name} | OmniToolbox`;
  
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": tool.name,
    "description": description,
    "url": `https://www.omnibox.dev${tool.path}`,
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0"
    }
  };

  return {
    title,
    description,
    alternates: {
      canonical: `https://www.omnibox.dev${tool.path}`,
    },
    openGraph: {
      title,
      description,
      url: `https://www.omnibox.dev${tool.path}`,
      siteName: 'OmniToolbox',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    other: {
      'application/ld+json': JSON.stringify(jsonLd, null, 2),
    },
  };
}


export default function ToolPage({ params }: Props) {
  const toolSlug = params.tool;
  const tool = tools.find((t) => t.path === `/` + toolSlug);

  if (!tool) {
    notFound();
  }

  return <ToolClientPage toolSlug={toolSlug} />;
}
