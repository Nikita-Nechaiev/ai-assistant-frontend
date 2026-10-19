import React from 'react';

import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useUserStore } from '@/store/useUserStore';
import { AiUsageApi } from '@/services/AiUsageApi';
import { SessionApi } from '@/services/SessionApi';
import { queryKeys } from '@/lib/queryKeys';
import { invalidateAiQueries, invalidateSessionQueries } from '@/lib/queryInvalidation';
import { validateAiInput } from '@/helpers/validateAiInput';
import { aiTools } from '@/helpers/aiToolRegistry';
import { useUserSessions } from '@/hooks/dashboard/useUserSessions';

import useAiUsageHistory from '../useAiUsageHistory';
import useAiStatistics from '../useAiStatistics';

jest.mock('@/services/AiUsageApi', () => ({ AiUsageApi: { fetchUsage: jest.fn(), fetchStatistics: jest.fn() } }));
jest.mock('@/services/SessionApi', () => ({ SessionApi: { fetchUserSessions: jest.fn() } }));
function setup<T>(hook: () => T) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });

  return {
    ...renderHook(hook, {
      wrapper: ({ children }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>,
    }),
    client,
  };
}
beforeEach(() => {
  jest.clearAllMocks();
  useUserStore.setState({ user: null });
});
it('disables all private requests until a user is available and scopes every cached result', async () => {
  jest.mocked(AiUsageApi.fetchUsage).mockResolvedValue([]);
  jest.mocked(AiUsageApi.fetchStatistics).mockResolvedValue({ totalUsageNumber: 3 } as any);
  jest.mocked(SessionApi.fetchUserSessions).mockResolvedValue([]);

  const { client, result } = setup(() => ({
    history: useAiUsageHistory(),
    statistics: useAiStatistics(),
    sessions: useUserSessions(''),
  }));

  expect(AiUsageApi.fetchUsage).not.toHaveBeenCalled();
  expect(AiUsageApi.fetchStatistics).not.toHaveBeenCalled();
  expect(SessionApi.fetchUserSessions).not.toHaveBeenCalled();
  act(() => useUserStore.setState({ user: { id: 5 } as any }));
  await waitFor(() => expect(result.current.statistics.isSuccess).toBe(true));
  expect(client.getQueryData(queryKeys.aiStatistics(5))).toMatchObject({ totalUsageNumber: 3 });
  expect(client.getQueryData(queryKeys.aiHistory(5, ''))).toMatchObject({ pages: [[]] });
  expect(client.getQueryData(queryKeys.sessionList(5, ''))).toMatchObject({ pages: [[]] });
});
it('debounces normalized history searches, paginates and manages the request viewer', async () => {
  useUserStore.setState({ user: { id: 7 } as any });

  const usage = { id: 1, result: 'Result' } as any;

  jest
    .mocked(AiUsageApi.fetchUsage)
    .mockResolvedValueOnce(Array(8).fill(usage))
    .mockResolvedValueOnce([usage])
    .mockResolvedValue([]);

  const { result } = setup(useAiUsageHistory);

  await waitFor(() => expect(result.current.hasNextPage).toBe(true));
  await act(async () => {
    await result.current.fetchNextPage();
  });
  expect(AiUsageApi.fetchUsage).toHaveBeenLastCalledWith(2, '', expect.any(AbortSignal));
  await waitFor(() => expect(result.current.allUsage).toHaveLength(9));
  expect(result.current.hasNextPage).toBe(false);
  act(() => result.current.openModalWithUsage(usage));
  expect(result.current.selectedUsage).toBe(usage);
  expect(result.current.isModalOpen).toBe(true);
  act(() => result.current.closeModal());
  expect(result.current.isModalOpen).toBe(false);
  act(() => result.current.setFilterText(' grammar '));
  expect(result.current.debouncedSearch).toBe('');
  await waitFor(() => expect(AiUsageApi.fetchUsage).toHaveBeenLastCalledWith(1, 'grammar', expect.any(AbortSignal)));
});
it('invalidates all affected private aggregates without invalidating a different user', () => {
  const client = new QueryClient();
  const invalidate = jest.spyOn(client, 'invalidateQueries');

  invalidateAiQueries(client);
  invalidateSessionQueries(client);
  expect(invalidate).not.toHaveBeenCalled();
  invalidateSessionQueries(client, 5);
  expect(invalidate.mock.calls.map(([arg]) => arg?.queryKey)).toEqual([queryKeys.sessions(5), queryKeys.dashboard(5)]);
  invalidate.mockClear();
  invalidateAiQueries(client, 5);
  expect(invalidate.mock.calls.map(([arg]) => arg?.queryKey)).toEqual([queryKeys.ai(5), queryKeys.dashboard(5)]);
});
it('validates tool, trimmed text and translation language consistently', () => {
  const translation = aiTools.find((t) => t.requiresTargetLanguage)!;

  expect(validateAiInput(null, 'text', '')).toMatchObject({ ok: false, message: 'Choose an AI tool first.' });
  expect(validateAiInput(aiTools[0], ' \n', '')).toMatchObject({ ok: false, message: 'Input cannot be empty' });
  expect(validateAiInput(translation, 'text', ' ')).toMatchObject({
    ok: false,
    message: 'Please specify a target language',
  });
  expect(validateAiInput(translation, ' text ', ' French ')).toEqual({
    ok: true,
    value: { tool: translation, text: 'text', targetLanguage: 'French' },
  });
});
