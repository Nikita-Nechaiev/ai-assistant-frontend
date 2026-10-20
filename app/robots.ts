import type { MetadataRoute } from 'next';

import { site } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    // Allow crawlers to read noindex on auth pages; private content still requires login.
    rules: { userAgent: '*', allow: '/', disallow: '/api/' },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
