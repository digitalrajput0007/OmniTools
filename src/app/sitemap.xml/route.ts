// 'use server' is not needed here as this is a route handler
import { tools } from '@/lib/constants';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.omnibox.dev';

function generateSitemap() {
  const lastModified = new Date().toISOString();

  const staticPages = [
    { url: `${BASE_URL}/`, priority: 1.0 },
    { url: `${BASE_URL}/about`, priority: 0.8 },
    { url: `${BASE_URL}/contact`, priority: 0.5 },
    { url: `${BASE_URL}/privacy`, priority: 0.5 },
    { url: `${BASE_URL}/terms`, priority: 0.5 },
  ];

  const toolPages = tools.map(tool => ({
    url: `${BASE_URL}${tool.path}`,
    priority: 0.9,
  }));

  const allPages = [...staticPages, ...toolPages];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allPages
    .map(({ url, priority }) => {
      return `
    <url>
      <loc>${url}</loc>
      <lastmod>${lastModified}</lastmod>
      <priority>${priority.toFixed(1)}</priority>
    </url>
  `;
    })
    .join('')}
</urlset>`;

  return sitemap.trim();
}

export async function GET() {
  const body = generateSitemap();

  return new Response(body, {
    status: 200,
    headers: {
      'Cache-control': 'public, s-maxage=86400, stale-while-revalidate',
      'content-type': 'application/xml',
    },
  });
}
