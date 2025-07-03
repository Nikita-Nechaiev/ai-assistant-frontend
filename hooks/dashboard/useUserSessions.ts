import { useInfiniteQuery } from '@tanstack/react-query';

import { SessionApi } from '@/services/SessionApi';

export const useUserSessions = (search: string) =>
  useInfiniteQuery({
    queryKey: ['userSessions', search],
    queryFn: ({ pageParam = 1 }) => SessionApi.fetchUserSessions(pageParam as number, search),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.length === 25 ? last.length + 1 : undefined),
  });
