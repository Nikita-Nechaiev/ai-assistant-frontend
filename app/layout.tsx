import './globals.css';
import { headers } from 'next/headers';
import type { Metadata, Viewport } from 'next';

import Snackbar from '@/components/common/Snackbar';
import ReactQueryProvider from '@/providers/ReactQueryProvider';
import ZustandHydration from '@/hydration/ZustandHydration';
import { IUser } from '@/models/models';
import { site, siteMetadata } from '@/lib/seo';

export const metadata: Metadata = {
  ...siteMetadata,
  // Only the public welcome page opts into indexing.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: site.themeColor };

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
      <body className='min-h-dvh w-full bg-muted'>
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
