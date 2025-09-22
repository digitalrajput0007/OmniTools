
// 'use server' is not needed here as this is a route handler

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://onlinejpgpdf.com';

export async function GET(request: Request) {
  const content = `
User-agent: *
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml
  `.trim();

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
