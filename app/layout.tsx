import './globals.css';
import Snackbar from '@/ui/Snackbar';
import ReactQueryProvider from '@/providers/ReactQueryProvider';
import { headers } from 'next/headers';
import { IUser } from '@/models/app-models/models';
import ZustandHydration from '@/hydration/ZustandHydration';

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
  const user: IUser = userHeader ? JSON.parse(userHeader) : null;

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
