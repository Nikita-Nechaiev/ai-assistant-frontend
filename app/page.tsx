  'use client';

  import { useEffect } from 'react';
  import { useRouter } from 'next/navigation';
  import axios from 'axios';
  import { useUserStore } from '@/store/useUserStore';
  import useSnackbarStore from '@/store/useSnackbarStore';
  import { SnackbarStatusEnum } from '@/models/enums/SnackbarStatusEnum';

  const HomePage: React.FC = () => {
    const { setUser, clearUser } = useUserStore();
    const { setSnackbar } = useSnackbarStore();
    const router = useRouter();

    useEffect(() => {
      const checkAccessToken = async () => {
        let accessToken = localStorage.getItem('accessToken');

        if (!accessToken) {
          const urlParams = new URLSearchParams(window.location.search);
          accessToken = urlParams.get('token');

          if (accessToken) {
            localStorage.setItem('accessToken', accessToken);
          }
        }

        if (!accessToken) {
          return router.replace('/login');
        }

        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
              withCredentials: true,
            },
          );
          const { user, accessToken: newAccessToken } = response.data;
          localStorage.setItem('accessToken', newAccessToken);
          setUser(user);

          router.replace('/dashboard');
        } catch (error) {
          clearUser();
          localStorage.removeItem('accessToken');
          setSnackbar(
            'Session expired or invalid token',
            SnackbarStatusEnum.ERROR,
          );
          router.replace('/login');
        }
      };

      checkAccessToken();
    }, []);

    return null;
  };

  export default HomePage;
