import type { Metadata } from 'next';

export const site = {
  name: 'AI Editor',
  url: 'https://www.ai-editor-portfolio.com',
  title: 'AI Editor Case Study | Mykyta Nechaiev — Developer Portfolio',
  description:
    'Full-stack developer portfolio case study by Mykyta Nechaiev: a Next.js, NestJS, and PostgreSQL app with real-time collaboration and AI tools.',
  themeColor: '#1a5cc1',
};

export const siteMetadata: Metadata = {
  metadataBase: new URL(site.url),
  applicationName: site.name,
  title: site.title,
  description: site.description,
  authors: [{ name: 'Mykyta Nechaiev' }],
  openGraph: {
    title: site.title,
    description: site.description,
    url: '/welcome',
    siteName: site.name,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/social-preview.png',
        width: 1200,
        height: 630,
        alt: 'AI Editor — full-stack developer portfolio case study by Mykyta Nechaiev',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: site.title,
    description: site.description,
    images: [{ url: '/social-preview.png', alt: 'AI Editor portfolio case study by Mykyta Nechaiev' }],
  },
  // Next.js adds the ICO and Apple Touch Icon from the files in app/.
  icons: { icon: { url: '/logo.svg', type: 'image/svg+xml' } },
  manifest: '/manifest.webmanifest',
};
