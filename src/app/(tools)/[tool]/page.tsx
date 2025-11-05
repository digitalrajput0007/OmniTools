
import { tools } from '@/lib/constants';
import { notFound } from 'next/navigation';
import ToolClientPage from './client-page';

type Props = {
  params: { tool: string };
};

export function generateStaticParams() {
  return tools.map((tool) => ({
    tool: tool.path.substring(1),
  }));
}

export default function ToolPage({ params }: Props) {
  const toolSlug = params.tool;
  const tool = tools.find((t) => t.path === `/` + toolSlug);

  if (!tool) {
    notFound();
  }

  return <ToolClientPage toolSlug={toolSlug} />;
}
