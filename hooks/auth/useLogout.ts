import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';

import { AuthApi } from '@/services/AuthApi';
import { useUserStore } from '@/store/useUserStore';

export default function useLogout() {
  const clearUser = useUserStore((state) => state.clearUser);
  const router = useRouter();

  return async () => {
    try {
      const response = await AuthApi.logout();

      if (response.status !== 200) console.log('Logout failed:', response.statusText);

      clearUser();
      router.replace('/login');
    } catch (error) {
      if (error instanceof AxiosError) console.log('Axios error during logout:', error.response?.data || error.message);
    }
  };
}
