/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prevent CSS caching issues
  experimental: {
    optimizeCss: true,
  },
  // Force CSS reloads in development
  webpack: (config: any, { dev }: { dev: boolean }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
  images: {
    domains: [
      'logivis.com',
      '127.0.0.1',
      'localhost',
      'pxrnjcxsxlridkkqehyo.supabase.co',
    ],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: 'logivis.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pxrnjcxsxlridkkqehyo.supabase.co',
        pathname: '/storage/v1/object/**', // Supabase storage path
      },
    ],
    // Alternative: Use domains (deprecated but still works)
    // domains: ['127.0.0.1', 'localhost', 'logivis.com', 'your-production-domain.com'],

    // Optional: Configure image formats and quality
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",

    // Handle image loading errors gracefully
    unoptimized: false,

    // Improve image loading
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Other config options...
};

module.exports = nextConfig;
