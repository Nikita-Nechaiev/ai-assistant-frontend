  'use client';

  import { useEffect } from 'react';
  import { useRouter } from 'next/navigation';
  import axios, { AxiosError } from 'axios';
  import { useUserStore } from '@/store/useUserStore';

  export default function DashboardPage() {
    const router = useRouter();
    const { clearUser, id } = useUserStore();

    useEffect(() => {
      const storedToken = localStorage.getItem('accessToken');
      if (!storedToken || !id) {
        router.replace('/');
        return;
      }
    }, [id, router]);

    const handleLogout = async () => {
      try {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {}, {
          withCredentials: true
        });
      } catch (error) {
        if (error instanceof AxiosError) {
          console.log('Logout error:', error.response?.data || error.message);
        }
      }

      localStorage.removeItem('accessToken');
      clearUser();
      router.replace('/login');
    };

    return (
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Welcome to the dashboard page!</h1>
        <button
          onClick={handleLogout}
          className="py-2 px-4 bg-red-500 text-white font-semibold rounded-md shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Logout
        </button>
      </div>
    );
  }
