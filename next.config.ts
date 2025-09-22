
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.qrserver.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Exclude qpdf-wasm from server-side bundle
    if (isServer) {
      config.externals.push('qpdf-wasm');
    }
    return config;
  },
  sitemap: async () => {
    const { tools } = await import('./src/lib/constants');
    const toolPages = tools.map(tool => ({
      url: `https://onlinejpgpdf.com${tool.path}`,
      lastModified: new Date(),
    }));
    return [
      { url: 'https://onlinejpgpdf.com', lastModified: new Date() },
      { url: 'https://onlinejpgpdf.com/about', lastModified: new Date() },
      { url: 'https://onlinejpgpdf.com/contact', lastModified: new Date() },
      ...toolPages,
    ];
  },
};

export default nextConfig;
