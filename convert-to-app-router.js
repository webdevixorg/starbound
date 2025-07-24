const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, 'frontend', 'app');

// Folder and page structure to create
const structure = {
  'layout.tsx': true, // file
  'page.tsx': true, // home page

  company: {
    about: { 'page.tsx': true },
    career: { 'page.tsx': true },
    contact: { 'page.tsx': true },
    'help-center': { 'page.tsx': true },
    faq: { 'page.tsx': true },
  },

  legal: {
    'privacy-policy': { 'page.tsx': true },
    terms: { 'page.tsx': true },
    warranty: { 'page.tsx': true },
  },

  shop: {
    cart: { 'page.tsx': true },
    category: { 'page.tsx': true },
    checkout: { 'page.tsx': true },
    'order-received': { 'page.tsx': true },
    orders: { 'page.tsx': true },
    products: { 'page.tsx': true },
    'products-single': { 'page.tsx': true },
    wishlist: { 'page.tsx': true },
  },

  user: {
    dashboard: { 'page.tsx': true },
    'edit-profile': { 'page.tsx': true },
    messages: { 'page.tsx': true },
    notifications: { 'page.tsx': true },
    settings: { 'page.tsx': true },
    history: { 'page.tsx': true },
    profile: { 'page.tsx': true },
  },

  blog: {
    add: { 'page.tsx': true },
    list: { 'page.tsx': true },
    posts: { 'page.tsx': true },
    single: { 'page.tsx': true },
    reviews: { 'page.tsx': true },
    'common-reviews': { 'page.tsx': true },
  },

  projects: { 'page.tsx': true },
  feedback: { 'page.tsx': true },
  forum: { 'page.tsx': true },
  updates: { 'page.tsx': true },
  skills: { 'page.tsx': true },
  'contact-support': { 'page.tsx': true },
  'not-found': { 'page.tsx': true },
};

// Template content for a minimal page.tsx
const pageTemplate = (name) => `export default function ${name
  .replace(/-/g, ' ')
  .replace(/\b\w/g, (c) => c.toUpperCase())
  .replace(/\s+/g, '')}Page() {
  return (
    <main>
      <h1>${name} Page</h1>
    </main>
  );
}
`;

// Template content for layout.tsx
const layoutTemplate = `import './globals.css';
import { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`;

// Recursive function to create files/folders
function createStructure(basePath, struct) {
  for (const key in struct) {
    const fullPath = path.join(basePath, key);
    if (struct[key] === true) {
      // Create file
      if (!fs.existsSync(fullPath)) {
        if (key === 'layout.tsx') {
          fs.writeFileSync(fullPath, layoutTemplate);
          console.log(`Created file: ${fullPath}`);
        } else if (key === 'page.tsx') {
          // Use folder name for page title if possible
          const folderName = path.basename(basePath);
          const pageName = folderName === 'app' ? 'Home' : folderName;
          fs.writeFileSync(fullPath, pageTemplate(pageName));
          console.log(`Created file: ${fullPath}`);
        }
      }
    } else {
      // Create directory and recurse
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`Created directory: ${fullPath}`);
      }
      createStructure(fullPath, struct[key]);
    }
  }
}

// Start creation
if (!fs.existsSync(appDir)) {
  fs.mkdirSync(appDir, { recursive: true });
}

createStructure(appDir, structure);

console.log('App router folder structure created successfully!');
