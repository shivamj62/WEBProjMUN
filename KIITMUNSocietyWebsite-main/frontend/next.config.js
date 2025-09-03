/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for better build compatibility
  experimental: {
    esmExternals: 'loose',
  },
  
  // Ensure TypeScript path mapping works in build
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Configure image domains for both local and production
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '*.onrender.com',
        pathname: '/uploads/**',
      },
    ],
  },
  
  // Dynamic API rewrites based on environment
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
  
  // Output configuration for static export if needed
  output: 'standalone',
  
  // Disable source maps in production for faster builds
  productionBrowserSourceMaps: false,
};

module.exports = nextConfig;
