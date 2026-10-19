import axios, { InternalAxiosRequestConfig } from 'axios';

import { useUserStore } from '@/store/useUserStore';

interface AuthRetryRequestConfig extends InternalAxiosRequestConfig {
  hasRetriedAuth?: boolean;
}

function redirectToLogin() {
  useUserStore.getState().clearUser();
  window.location.href = '/login';
}

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const config = error.config as AuthRetryRequestConfig | undefined;

      if (!config || config.hasRetriedAuth) {
        redirectToLogin();

        return Promise.reject(error);
      }

      config.hasRetriedAuth = true;

      try {
        await axios.post<{ message: string }>(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-cookies`,
          {},
          {
            withCredentials: true,
          },
        );
      } catch (refreshError) {
        redirectToLogin();

        return Promise.reject(refreshError);
      }

      return axiosInstance.request(config);
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
