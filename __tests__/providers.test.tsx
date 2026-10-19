import React from 'react';

import { render, screen, act } from '@testing-library/react';
import { useQueryClient } from '@tanstack/react-query';

import ReactQueryProvider from '@/providers/ReactQueryProvider';
import ZustandHydration from '@/hydration/ZustandHydration';
import axiosInstance from '@/services/axiosInstance';
import RequirePermission from '@/components/common/RequirePermission';
import { useSessionStore } from '@/store/useSessionStore';
import { PermissionEnum } from '@/models/enums';
import { useUserStore } from '@/store/useUserStore';
import { queryKeys } from '@/lib/queryKeys';

jest.mock('@/services/axiosInstance', () => ({ __esModule: true, default: { get: jest.fn() } }));

let client: any;

function Consumer() {
  client = useQueryClient();

  return <div>Provider child</div>;
}
it('fetches query data through the configured API and retry policy', async () => {
  (axiosInstance.get as jest.Mock).mockResolvedValue({ data: { value: 42 } });
  render(
    <ReactQueryProvider>
      <Consumer />
    </ReactQueryProvider>,
  );
  expect(screen.getByText('Provider child')).toBeInTheDocument();
  await expect(client.fetchQuery({ queryKey: ['/endpoint', { page: 2 }] })).resolves.toEqual({ value: 42 });
  expect(axiosInstance.get).toHaveBeenCalledWith('/endpoint', { params: { page: 2 } });
  expect(client.getDefaultOptions().queries).toMatchObject({ retry: 1, refetchOnWindowFocus: false });
  client.clear();
});
beforeEach(() => useUserStore.setState({ user: null }));
it('hydrates only an authenticated user', () => {
  const { rerender } = render(<ZustandHydration user={null} />);

  expect(useUserStore.getState().user).toBeNull();

  const user: any = { id: 2, name: 'Alice' };

  rerender(<ZustandHydration user={user} />);
  expect(useUserStore.getState().user).toMatchObject(user);
});
it('renders protected actions only when the session grants the exact permission', () => {
  act(() => useSessionStore.setState({ session: null }));

  const { rerender } = render(<RequirePermission permission={PermissionEnum.EDIT}>Edit action</RequirePermission>);

  expect(screen.queryByText('Edit action')).not.toBeInTheDocument();
  act(() => useSessionStore.setState({ session: { permissions: [PermissionEnum.READ] } as any }));
  rerender(<RequirePermission permission={PermissionEnum.EDIT}>Edit action</RequirePermission>);
  expect(screen.queryByText('Edit action')).not.toBeInTheDocument();
  act(() => useSessionStore.setState({ session: { permissions: [PermissionEnum.READ, PermissionEnum.EDIT] } as any }));
  rerender(<RequirePermission permission={PermissionEnum.EDIT}>Edit action</RequirePermission>);
  expect(screen.getByText('Edit action')).toBeInTheDocument();
  act(() => useSessionStore.setState({ session: null }));
});

it('keeps one client on rerender and cancels/removes only the previous user cache', async () => {
  useUserStore.setState({ user: { id: 1 } as any });

  const { rerender, unmount } = render(
    <ReactQueryProvider>
      <Consumer />
    </ReactQueryProvider>,
  );
  const original = client;

  client.setQueryData(queryKeys.sessions(1), ['private']);
  client.setQueryData(queryKeys.sessions(2), ['other']);
  client.setQueryData(['public'], 'retained');

  let signal!: AbortSignal;
  const pending = client
    .fetchQuery({
      queryKey: queryKeys.aiHistory(1, ''),
      queryFn: ({ signal: s }: any) => {
        signal = s;

        return new Promise(() => {});
      },
    })
    .catch(() => {});

  rerender(
    <ReactQueryProvider>
      <Consumer />
    </ReactQueryProvider>,
  );
  expect(client).toBe(original);
  act(() => useUserStore.setState({ user: { id: 2 } as any }));
  await pending;
  expect(signal.aborted).toBe(true);
  expect(client.getQueryData(queryKeys.sessions(1))).toBeUndefined();
  expect(client.getQueryData(queryKeys.sessions(2))).toEqual(['other']);
  expect(client.getQueryData(['public'])).toBe('retained');
  act(() => useUserStore.setState({ user: null }));
  expect(client.getQueryData(queryKeys.sessions(2))).toBeUndefined();
  unmount();
  client.clear();
});
