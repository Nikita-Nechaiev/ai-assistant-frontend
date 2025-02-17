import './globals.css';
import Snackbar from '@/ui/Snackbar';
import ReactQueryProvider from '@/providers/ReactQueryProvider';
import { headers } from 'next/headers';
import ZustandHydration from '@/hydration/ZustandHydration';
import { IUser } from '@/models/models';

export const metadata = {
  title: 'Ai Editor',
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
      console.error('Ошибка при декодировании x-user:', error);
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
