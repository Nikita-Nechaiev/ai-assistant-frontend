import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  devIndicators: false,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.ai-editor-portfolio.com/:path*',
      },
    ];
  },
};

export default nextConfig;
