
import { tools } from '@/lib/constants';
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

  // Dynamically import the metadata from the specific tool's page
  try {
    const toolMetadataModule = await import(`../${toolSlug}/page`);
    if (toolMetadataModule.metadata) {
      return toolMetadataModule.metadata;
    }
  } catch (error) {
    console.error(`Could not load metadata for ${toolSlug}:`, error);
  }

  // Fallback metadata if specific metadata isn't found
  const title = `${tool.name} | Online JPG PDF`;
  const description = tool.description;

  return {
    title,
    description,
    alternates: {
      canonical: `https://www.onlinejpgpdf.com${tool.path}`,
    },
    openGraph: {
      title,
      description,
      url: `https://www.onlinejpgpdf.com${tool.path}`,
      siteName: 'Online JPG PDF',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
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
