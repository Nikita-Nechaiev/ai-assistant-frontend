import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { SessionApi } from '@/services/SessionApi';

import { useUserSessions } from '../useUserSessions';

jest.mock('@/services/SessionApi', () => ({
  SessionApi: { fetchUserSessions: jest.fn() },
}));

const fetchMock = SessionApi.fetchUserSessions as jest.Mock;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

describe('useUserSessions', () => {
  beforeEach(() => jest.clearAllMocks());

  it('fetches first page with search term and returns data', async () => {
    fetchMock.mockResolvedValueOnce([{ id: 1 }]);

    const { result } = renderHook(() => useUserSessions('abc'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetchMock).toHaveBeenCalledWith(1, 'abc');
    expect(result.current.data?.pages[0][0].id).toBe(1);
  });

  it('provides nextPageParam only when length === 25', async () => {
    fetchMock.mockResolvedValueOnce(Array(25).fill({})).mockResolvedValueOnce(Array(10).fill({}));

    const { result } = renderHook(() => useUserSessions(''), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(true);

    await act(async () => {
      await result.current.fetchNextPage();
    });

    expect(fetchMock).toHaveBeenLastCalledWith(26, '');
    await waitFor(() => expect(result.current.hasNextPage).toBe(false));
  });
});
