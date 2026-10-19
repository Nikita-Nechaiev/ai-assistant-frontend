'use client';
import { ReactNode, useEffect, useState } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import axiosInstance from '@/services/axiosInstance';
import { useUserStore } from '@/store/useUserStore';
import { queryKeys } from '@/lib/queryKeys';

interface ReactQueryProviderProps {
  children: ReactNode;
}

const ReactQueryProvider: React.FC<ReactQueryProviderProps> = ({ children }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            queryFn: async ({ queryKey }) => {
              const [endpoint, params] = queryKey;
              const response = await axiosInstance.get(endpoint as string, {
                params,
              });

              return response.data;
            },
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  useEffect(
    () =>
      useUserStore.subscribe((state, previous) => {
        const previousId = previous.user?.id;

        if (previousId && previousId !== state.user?.id) {
          void queryClient.cancelQueries({ queryKey: queryKeys.user(previousId) });
          queryClient.removeQueries({ queryKey: queryKeys.user(previousId) });
        }
      }),
    [queryClient],
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

export default ReactQueryProvider;
