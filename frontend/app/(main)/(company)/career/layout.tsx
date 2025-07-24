import type { Metadata } from 'next';

// SEO Metadata
export const metadata: Metadata = {
  title: 'Career Opportunities | Join Our Team',
  description:
    'Join our innovative team and help shape the future of technology. Explore career opportunities with remote work options and growth potential.',
  keywords: [
    'careers',
    'jobs',
    'employment',
    'remote work',
    'technology careers',
  ],
  openGraph: {
    title: 'Career Opportunities | Join Our Team',
    description:
      'Join our innovative team and help shape the future of technology.',
    type: 'website',
    url: '/career',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Career Opportunities | Join Our Team',
    description:
      'Join our innovative team and help shape the future of technology.',
  },
};

export default function CareerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
