/** @type {import('next').NextConfig} */

const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '../config/frontend/.env'),
});

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
  reactStrictMode: true,

  env: {
    // API
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,

    // Supabase
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,

    // Company Info
    NEXT_PUBLIC_COMPANY_NAME: process.env.NEXT_PUBLIC_COMPANY_NAME,
    NEXT_PUBLIC_COMPANY_GENERAL_EMAIL:
      process.env.NEXT_PUBLIC_COMPANY_GENERAL_EMAIL,
    NEXT_PUBLIC_WEBSITE_NAME: process.env.NEXT_PUBLIC_WEBSITE_NAME,
    NEXT_PUBLIC_WEBSITE_URL: process.env.NEXT_PUBLIC_WEBSITE_URL,
    NEXT_PUBLIC_COMPANY_ADDRESS: process.env.NEXT_PUBLIC_COMPANY_ADDRESS,
    NEXT_PUBLIC_COMPANY_PHONE: process.env.NEXT_PUBLIC_COMPANY_PHONE,
    NEXT_PUBLIC_COMPANY_CAREER_EMAIL:
      process.env.NEXT_PUBLIC_COMPANY_CAREER_EMAIL,

    // EmailJS
    NEXT_PUBLIC_EMAILJS_SERVICE_ID: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
    NEXT_PUBLIC_EMAILJS_TEMPLATE_ID:
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
    NEXT_PUBLIC_EMAILJS_PUBLIC_KEY: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,

    // Supabase Storage
    NEXT_PUBLIC_SUPABASE_STORAGE_BASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BASE_URL,
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
