import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import type { ICollaborationSession } from '@/models/models';
import { useUserStore } from '@/store/useUserStore';
import { queryKeys } from '@/lib/queryKeys';
import { SessionApi } from '@/services/SessionApi';

import { useCreateSession } from '../useCreateSession';

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock('@/services/SessionApi', () => ({
  SessionApi: { createSession: jest.fn() },
}));

const createSessionMock = SessionApi.createSession as jest.Mock;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

describe('useCreateSession', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls SessionApi.createSession and returns data', async () => {
    const fakeSession = { id: 1, name: 'foo' } as ICollaborationSession;

    createSessionMock.mockResolvedValueOnce(fakeSession);

    const { result } = renderHook(() => useCreateSession(), { wrapper });

    let returned: ICollaborationSession;

    await act(async () => {
      returned = await result.current.mutateAsync('foo');
    });

    expect(returned!).toBe(fakeSession);
    expect(createSessionMock).toHaveBeenCalledWith('foo');

    await waitFor(() => {
      expect(result.current.data).toBe(fakeSession);
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it('exposes error state on failure', async () => {
    const err = new Error('boom');

    createSessionMock.mockRejectedValueOnce(err);

    const { result } = renderHook(() => useCreateSession(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync('bar').catch(() => {});
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
      expect(result.current.error?.message).toBe('boom');
    });
  });
});

it('refreshes the current user session list and dashboard after creation', async () => {
  useUserStore.setState({ user: { id: 7 } as any });

  const client = new QueryClient();
  const invalidate = jest.spyOn(client, 'invalidateQueries');
  const created = jest.fn();

  createSessionMock.mockResolvedValue({ id: 5 });

  const { result } = renderHook(() => useCreateSession(created), {
    wrapper: ({ children }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>,
  });

  await act(async () => {
    await result.current.mutateAsync('Project');
  });
  expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.sessions(7) });
  expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.dashboard(7) });
  expect(created).toHaveBeenCalledTimes(1);
  client.clear();
  useUserStore.setState({ user: null });
});
