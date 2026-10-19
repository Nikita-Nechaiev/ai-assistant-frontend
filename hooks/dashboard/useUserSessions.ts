import { useInfiniteQuery } from '@tanstack/react-query';

import { SessionApi } from '@/services/SessionApi';
import { useUserStore } from '@/store/useUserStore';
import { queryKeys } from '@/lib/queryKeys';

export const useUserSessions = (search: string) => {
  const userId = useUserStore((state) => state.user?.id);

  return useInfiniteQuery({
    queryKey: queryKeys.sessionList(userId, search),
    enabled: !!userId,
    queryFn: ({ pageParam = 1, signal }) => SessionApi.fetchUserSessions(pageParam, search, signal),
    initialPageParam: 1,
    getNextPageParam: (last, _pages, lastPageParam) => (last.length === 25 ? lastPageParam + 1 : undefined),
  });
};
