import axios from 'axios';
import { useUserStore } from '@/store/useUserStore';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const refreshResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {
            withCredentials: true,
          },
        );

        const { accessToken } = refreshResponse.data;
        localStorage.setItem('accessToken', accessToken);
        error.config.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance.request(error.config);
      } catch (refreshError) {
        const { clearUser } = useUserStore.getState();
        clearUser();
        localStorage.removeItem('accessToken');
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
