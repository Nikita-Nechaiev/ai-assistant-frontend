import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*', // Forward all API requests
        destination: 'https://api.ai-editor-portfolio.com/:path*', // Removed extra "/api/"
      },
    ];
  },
};

export default nextConfig;
