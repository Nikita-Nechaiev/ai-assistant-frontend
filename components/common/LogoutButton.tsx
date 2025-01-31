'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';
import axios, { AxiosError } from 'axios';

const LogoutButton = () => {
  const clearUser = useUserStore((state) => state.clearUser);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + '/auth/logout',
        {},
        { withCredentials: true },
      );

      if (response.status === 200) {
        clearUser();

        router.push('/login');
      } else {
        console.log('Logout failed:', response.statusText);
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(
          'Axios error during logout:',
          error.response?.data || error.message,
        );
      }
    }
  };
  return (
    <button
      onClick={handleLogout}
      className='p-2 bg-red-500 text-mainLight rounded hover:bg-red-600 transition'
    >
      Logout
    </button>
  );
};

export default LogoutButton;
