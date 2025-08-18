import { fetchCategories } from '@/services/api';

export async function headerMenuItems() {
  // Fetch categories for Blog
  const blogCategories = await fetchCategories(1, 10, 14);
  const blogMenuItems = blogCategories
    .map((cat: { name: string; slug: string; children?: any[] }) => ({
      title: cat.name,
      href: `/posts?category=${cat.slug}`,
      items: (cat.children || []).map(
        (sub: { name: string; slug: string }) => ({
          label: sub.name,
          href: `/posts?category=${cat.slug}&subcategory=${sub.slug}`,
        })
      ),
    }))
    .slice(0, 5); // Limit to first 5 blog categories

  // Fetch categories for Shop
  const shopCategories = await fetchCategories(1, 10, 16);
  const shopMenuItems = shopCategories
    .map((cat: { name: string; slug: string; children?: any[] }) => ({
      title: cat.name,
      href: `/shop?category=${cat.slug.trim()}`,
      items: (cat.children || []).map(
        (sub: { name: string; slug: string }) => ({
          label: sub.name,
          href: `/shop?category=${cat.slug.trim()}&subcategory=${sub.slug.trim()}`,
        })
      ),
    }))
    .slice(0, 5); // Limit to first 5 shop categories

  const headerMenuItems = [
    {
      label: 'Shop',
      href: '/shop',
      direct: true,
    },
    {
      label: 'Categories',
      href: '/shop',
      megaMenu: true,
      items: shopMenuItems,
    },
    {
      label: 'Blog',
      href: '/posts',
      megaMenu: true,
      items: blogMenuItems,
    },
    {
      label: 'Forum',
      href: '/forum',
      direct: true,
    },
    {
      label: 'Contact',
      href: '/contact-support',
      subItems: [
        { label: 'Contact Support', href: '/contact-support' },
        { label: 'Help Center', href: '/help-center' },
        { label: 'Careers', href: '/careers' },
      ],
    },
  ];

  return headerMenuItems;
}
