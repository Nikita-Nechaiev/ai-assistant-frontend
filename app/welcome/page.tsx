import { headers } from 'next/headers';
import { Metadata } from 'next';

import WelcomePage from '@/components/Welcome/WelcomePage';

export const metadata: Metadata = {
  title: 'AI Editor — Write better. Build ideas together.',
  description:
    'Create documents, refine your writing with nine AI tools, and collaborate in real time. Discover AI Editor, a portfolio project by Mykyta Nechaiev.',
  alternates: { canonical: '/welcome' },
  openGraph: {
    title: 'AI Editor — Write better. Build ideas together.',
    description: 'Your documents, your team, and the power of AI. One workspace to bring ideas to life.',
    url: '/welcome',
  },
};

export default async function Welcome() {
  const requestHeaders = await headers();

  return <WelcomePage isAuthenticated={!!requestHeaders.get('x-user')} />;
}
