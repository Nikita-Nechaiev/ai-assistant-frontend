import { useCallback, useState } from 'react';

import { useInfiniteQuery } from '@tanstack/react-query';

import { IAiToolUsage } from '@/models/models';
import { AiUsageApi } from '@/services/AiUsageApi';
import { useUserStore } from '@/store/useUserStore';
import { queryKeys } from '@/lib/queryKeys';
import useDebouncedValue from '@/hooks/common/useDebouncedValue';

export default function useAiUsageHistory() {
  const userId = useUserStore((state) => state.user?.id);
  const [selectedUsage, setSelectedUsage] = useState<IAiToolUsage | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [filterText, setFilterText] = useState('');
  const debouncedSearch = useDebouncedValue(filterText.trim());
  const query = useInfiniteQuery({
    queryKey: queryKeys.aiHistory(userId, debouncedSearch),
    enabled: !!userId,
    queryFn: ({ pageParam, signal }) => AiUsageApi.fetchUsage(pageParam, debouncedSearch, signal),
    getNextPageParam: (lastPage, _pages, lastPageParam) => (lastPage.length === 8 ? lastPageParam + 1 : undefined),
    initialPageParam: 1,
  });
  const openModalWithUsage = useCallback((usage: IAiToolUsage) => {
    setSelectedUsage(usage);
    setModalOpen(true);
  }, []);
  const closeModal = useCallback(() => setModalOpen(false), []);

  return {
    ...query,
    allUsage: query.data?.pages.flat() ?? [],
    selectedUsage,
    isModalOpen,
    filterText,
    setFilterText,
    debouncedSearch,
    openModalWithUsage,
    closeModal,
  };
}
