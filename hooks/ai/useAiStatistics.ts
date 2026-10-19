import { useQuery } from '@tanstack/react-query';

import { useUserStore } from '@/store/useUserStore';
import { AiUsageApi } from '@/services/AiUsageApi';
import { queryKeys } from '@/lib/queryKeys';

export default function useAiStatistics() {
  const userId = useUserStore((state) => state.user?.id);

  return useQuery({
    queryKey: queryKeys.aiStatistics(userId),
    enabled: !!userId,
    queryFn: ({ signal }) => AiUsageApi.fetchStatistics(signal),
  });
}
