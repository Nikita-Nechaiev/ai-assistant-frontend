import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export default async function HomePage() {
  const requestHeaders = await headers();

  redirect(requestHeaders.get('x-user') ? '/dashboard' : '/welcome');
}
