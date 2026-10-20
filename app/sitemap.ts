import type { MetadataRoute } from 'next';

import { site } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${site.url}/welcome` }];
}
