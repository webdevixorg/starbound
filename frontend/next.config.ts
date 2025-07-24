/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
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
        hostname: 'your-production-domain.com', // Replace with your actual domain
        pathname: '/media/**',
      },
    ],
    // Alternative: Use domains (deprecated but still works)
    // domains: ['127.0.0.1', 'localhost', 'logivis.com', 'your-production-domain.com'],

    // Optional: Configure image formats and quality
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Other config options...
};

module.exports = nextConfig;
