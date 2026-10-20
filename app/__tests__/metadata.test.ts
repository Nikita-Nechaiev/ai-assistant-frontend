import { readFileSync } from 'node:fs';
import path from 'node:path';

import { site, siteMetadata } from '@/lib/seo';

import { metadata as defaults } from '../layout';
import { metadata as welcome } from '../welcome/page';
import robots from '../robots';
import sitemap from '../sitemap';
import manifest from '../manifest';

jest.mock('next/headers', () => ({ headers: jest.fn() }));
jest.mock('@/components/Welcome/WelcomePage', () => ({ __esModule: true, default: () => null }));
jest.mock('@/providers/ReactQueryProvider', () => ({ __esModule: true, default: () => null }));
jest.mock('@/hydration/ZustandHydration', () => ({ __esModule: true, default: () => null }));
jest.mock('@/components/common/Snackbar', () => ({ __esModule: true, default: () => null }));

it('indexes the public landing page while auth and private pages inherit noindex', () => {
  expect(defaults.robots).toEqual({ index: false, follow: false });
  expect(welcome.robots).toEqual({ index: true, follow: true });
  expect(welcome.alternates?.canonical).toBe('/welcome');
  expect(sitemap().map(({ url }) => url)).toEqual([`${site.url}/welcome`]);
  expect(robots()).toEqual({
    rules: { userAgent: '*', allow: '/', disallow: '/api/' },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  });
});

it('keeps search, Open Graph and Twitter previews consistent on the landing page', () => {
  expect(welcome.title).toBe(site.title);
  expect(welcome.description).toBe(site.description);
  expect(welcome.metadataBase?.origin).toBe(site.url);
  expect(welcome.openGraph).toMatchObject({ title: site.title, description: site.description, url: '/welcome' });
  expect(welcome.twitter).toMatchObject({
    card: 'summary_large_image',
    title: site.title,
    description: site.description,
    images: [expect.objectContaining({ url: '/social-preview.png' })],
  });
  expect(welcome.openGraph).toEqual(siteMetadata.openGraph);

  const png = readFileSync(path.join(process.cwd(), 'public/social-preview.png'));

  expect(png.subarray(1, 4).toString()).toBe('PNG');
  expect(welcome.openGraph).toMatchObject({
    images: [
      expect.objectContaining({
        url: '/social-preview.png',
        width: png.readUInt32BE(16),
        height: png.readUInt32BE(20),
      }),
    ],
  });
  expect(png.readUInt32BE(16)).toBe(1200);
  expect(png.readUInt32BE(20)).toBe(630);
});

it('serves real ICO frames and correctly sized branded app icons', () => {
  const ico = readFileSync(path.join(process.cwd(), 'app/favicon.ico'));

  expect(ico.readUInt16LE(0)).toBe(0);
  expect(ico.readUInt16LE(2)).toBe(1);
  expect(ico.readUInt16LE(4)).toBeGreaterThan(0);

  const app = manifest();

  expect(app).toMatchObject({ name: site.name, start_url: '/welcome', theme_color: site.themeColor });
  expect(defaults.manifest).toBe('/manifest.webmanifest');

  for (const icon of app.icons!) {
    const image = readFileSync(path.join(process.cwd(), 'public', icon.src));

    expect(`${image.readUInt32BE(16)}x${image.readUInt32BE(20)}`).toBe(icon.sizes);
  }

  const appleIcon = readFileSync(path.join(process.cwd(), 'app/apple-icon.png'));

  expect(appleIcon.readUInt32BE(16)).toBe(180);
  expect(appleIcon.readUInt32BE(20)).toBe(180);
  expect(readFileSync(path.join(process.cwd(), 'public/logo.svg'), 'utf8')).toContain('<svg');
});
