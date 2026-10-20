import { headers } from 'next/headers';
import { Metadata } from 'next';

import WelcomePage from '@/components/Welcome/WelcomePage';
import { siteMetadata } from '@/lib/seo';

export const metadata: Metadata = {
  ...siteMetadata,
  alternates: { canonical: '/welcome' },
  robots: { index: true, follow: true },
};

export default async function Welcome() {
  const requestHeaders = await headers();

  return <WelcomePage isAuthenticated={!!requestHeaders.get('x-user')} />;
}
