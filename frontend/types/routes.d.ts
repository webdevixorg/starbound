// Custom route types to fix TypeScript validation issues

declare module 'next' {
  interface AppRouter {
    '/resources/how-to-videos': any;
    '/resources/product-reviews': any;
    '/resources/user-manuals': any;
  }
}

export {};
