import { headers } from 'next/headers';

export default async function DashboardPage() {
  const serverHeaders = await headers();
  const userHeader = serverHeaders.get('x-user');
  const user = userHeader ? JSON.parse(userHeader) : null;

  return (
    <div>
      <h1>Welcome, {user?.name || 'User'}!</h1>
      <p>Email: {user?.email}</p>
    </div>
  );
}
