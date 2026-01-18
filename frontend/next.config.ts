/** @type {import('next').NextConfig} */
import type { NextConfig } from 'next';
import {
  NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY,
} from './utils/env';

const nextConfig: NextConfig = {
  // Use server-side rendering with Node.js (requires 'npm start' or PM2 on production)
  // output: 'export', // Uncomment only for static HTML export

  // Performance optimizations
  experimental: {
    optimizeCss: true,
  },

  // Image optimization
  images: {
    unoptimized: true,
    domains: ['localhost', 'logivis.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
  },

  // Compression
  compress: true,

  // Bundle analyzer
  webpack: (
    config: any,
    { buildId, dev, isServer, defaultLoaders, webpack }: any
  ) => {
    // Optimize bundle size
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      };
    }

    // Development optimizations
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }

    return config;
  },

  // Security headers
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: http://localhost:8000 http://127.0.0.1:8000 https://*.supabase.co; font-src 'self' data:; connect-src 'self' ws: wss: http://localhost:8000 http://127.0.0.1:8000 https://*.supabase.co;",
          },
        ],
      },
    ];
  },

  reactStrictMode: true,

  // Environment variables
  env: {
    // API
    NEXT_PUBLIC_API_URL,
    // Supabase
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },

  // Redirect www to non-www
  redirects: async () => {
    return [
      {
        source: '/(.*)',
        has: [
          {
            type: 'host',
            value: 'www.logivis.com',
          },
        ],
        destination: 'https://logivis.com/$1',
        permanent: true,
      },
    ];
  },

  // Static file caching
  poweredByHeader: false,
  generateEtags: true,
};

export default nextConfig;
