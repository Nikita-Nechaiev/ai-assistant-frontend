import axios from 'axios';
import { useUserStore } from '@/store/useUserStore';
import Router from 'next/router';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const refreshResponse = await axios.get<{ message: string }>(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-cookies`,
          {
            withCredentials: true,
          },
        );

        return axiosInstance.request(error.config);
      } catch (refreshError) {
        const { clearUser } = useUserStore.getState();
        clearUser();

        Router.push('/login');
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
