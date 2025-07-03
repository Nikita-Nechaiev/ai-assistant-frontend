import './globals.css';
import { headers } from 'next/headers';

import Snackbar from '@/ui/Snackbar';
import ReactQueryProvider from '@/providers/ReactQueryProvider';
import ZustandHydration from '@/hydration/ZustandHydration';
import { IUser } from '@/models/models';

export const metadata = {
  metadataBase: new URL('https://www.ai-editor-portfolio.com'),
  title: 'AI Editor - Smart Text Processing',
  description:
    'AI-powered text analysis, translation, and content generation with real-time collaboration. Manage roles, track changes, and enhance documents with intelligent tools.',
  openGraph: {
    title: 'AI Editor - Smart Text Processing',
    description:
      'AI-powered text analysis, translation, and content generation using OpenAI API. Supports real-time collaboration, document versioning, role-based access, and advanced text formatting.',
    url: 'https://www.ai-editor-portfolio.com',
    siteName: 'AI Editor',
    images: [
      {
        url: '/company_logo.png',
        width: 1200,
        height: 630,
        alt: 'AI Editor Logo',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Editor - Smart Text Processing',
    description:
      'AI-powered text analysis, translation, and content generation with OpenAI API. Collaborate in real-time and track document changes effortlessly.',
    images: ['/company_logo.png'],
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const serverHeaders = await headers();
  const userHeader = serverHeaders.get('x-user');

  let user: IUser | null = null;

  if (userHeader) {
    try {
      const decodedUser = Buffer.from(userHeader, 'base64').toString('utf8');

      user = JSON.parse(decodedUser);
    } catch (error) {
      console.error('Error decoding x-user:', error);
    }
  }

  return (
    <html lang='en'>
      <head>
        <link rel='icon' href='/favicon.ico' sizes='any' />
      </head>
      <body className='h-screen w-screen bg-gray-100 flex justify-center items-center'>
        <ReactQueryProvider>
          <div className='relative h-full w-full'>
            <Snackbar />
            <ZustandHydration user={user} />
            {children}
          </div>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
