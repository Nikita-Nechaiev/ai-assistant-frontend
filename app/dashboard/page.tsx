import MainLayout from '@/components/Dashboard/Layout';
import SessionList from '@/components/Dashboard/SessionList';

export default async function DashboardPage() {
  return (
    <MainLayout>
      <SessionList />
    </MainLayout>
  );
}
