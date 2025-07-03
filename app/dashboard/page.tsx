import SessionList from '@/components/Dashboard/SessionList';
import MainLayout from '@/components/Layout/Layout';

export default async function DashboardPage() {
  return (
    <MainLayout>
      <SessionList />
    </MainLayout>
  );
}
