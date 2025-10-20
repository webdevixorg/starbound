/** @type {import('next').NextConfig} */
import type { NextConfig } from 'next';

const pathModule = require('path');
const fs = require('fs');

// Function to load environment variables
function loadEnvConfig() {
  const envPath = pathModule.resolve(__dirname, '../config/frontend/.env');

  if (!fs.existsSync(envPath)) {
    console.error(`Environment file not found at ${envPath}`);
    throw new Error(`Environment file not found at ${envPath}`);
  }

  const envConfig = require('dotenv').config({
    path: envPath,
  });

  if (envConfig.error) {
    console.error('Error loading .env file:', envConfig.error);
    throw envConfig.error;
  }

  // Verify required environment variables
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  const missingVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }

  return envConfig;
}

// Load environment configuration
loadEnvConfig();

const nextConfig: NextConfig = {
  // Performance optimizations
  experimental: {
    optimizeCss: true,
  },

  // Image optimization
  images: {
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
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    // Supabase
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    // Third-party services
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY:
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET:
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
    // Analytics
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
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
