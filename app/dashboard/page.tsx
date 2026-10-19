import Dashboard from '@/components/Dashboard/Dashboard';
import MainLayout from '@/components/Layout/Layout';

export default async function DashboardPage() {
  return (
    <MainLayout title='Overview'>
      <Dashboard />
    </MainLayout>
  );
}
