import { renderHook, act } from '@testing-library/react';

import { PermissionEnum, SnackbarStatusEnum } from '@/models/enums';

import { useSessionHeaderSocket } from '../useSessionHeaderSocket';

/* ─────────── light fake Socket ─────────── */
class MockSocket {
  emit = jest.fn();

  private listeners: Record<string, ((...a: any[]) => void)[]> = {};

  on = jest.fn((e: string, cb: (...a: any[]) => void) => {
    (this.listeners[e] ??= []).push(cb);
  });

  off = jest.fn();

  trigger(e: string, ...a: any[]) {
    this.listeners[e]?.forEach((cb) => cb(...a));
  }
}

/* ─────────── external module mocks ─────────── */
const pushMock = jest.fn();

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }));

const setSnackbarMock = jest.fn();

jest.mock('@/store/useSnackbarStore', () => ({
  __esModule: true,
  default: () => ({ setSnackbar: setSnackbarMock }),
}));

jest.mock('@/store/useUserStore', () => ({
  useUserStore: () => ({ user: { id: 1 } }),
}));

/* spies so we can assert updates */
const updateSessionSpy = jest.fn();
const setSessionSpy = jest.fn();

jest.mock('@/store/useSessionStore', () => ({
  useSessionStore: () => ({
    session: { user: { id: 1 }, permissions: [PermissionEnum.READ] },
    updateSession: updateSessionSpy,
    setSession: setSessionSpy,
  }),
}));

/* ─────────── minimal helpers for data stubs ─────────── */
const collaborator = (id: number, p = [PermissionEnum.READ]) => ({ id, permissions: p }) as any;

const sessionPayload = {
  id: 99,
  name: 'My session',
  userCollaborationSessions: [{ user: { id: 1 }, permissions: [PermissionEnum.READ] }],
} as any;

/* ─────────── tests ─────────── */
describe('useSessionHeaderSocket', () => {
  let socket: MockSocket;
  const sessionId = 99;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    socket = new MockSocket();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('requests session data on mount and sets header fields', () => {
    const { result } = renderHook(() => useSessionHeaderSocket({ sessionId, socket: socket as any }));

    expect(socket.emit).toHaveBeenCalledWith('getSessionData', { sessionId });

    act(() =>
      socket.trigger('totalSessionData', {
        sessionData: sessionPayload,
        users: [collaborator(1)],
        timeSpent: 5,
      }),
    );

    expect(result.current.sessionName).toBe('My session');
    expect(result.current.onlineUsers.length).toBe(1);
    expect(result.current.timeSpentMs).toBe(5 * 1000);

    // advance 2 s → timeSpentMs should grow
    act(() => jest.advanceTimersByTime(2000));
    expect(result.current.timeSpentMs).toBe(5 * 1000 + 2000);
  });

  it('updates name on "sessionData" event', () => {
    const { result } = renderHook(() => useSessionHeaderSocket({ sessionId, socket: socket as any }));

    act(() => socket.trigger('sessionData', { name: 'Renamed' }));
    expect(result.current.sessionName).toBe('Renamed');
  });

  it('handles permissionsChanged (updates local store)', () => {
    renderHook(() => useSessionHeaderSocket({ sessionId, socket: socket as any }));

    act(() =>
      socket.trigger('permissionsChanged', {
        userId: 1,
        permissions: [PermissionEnum.EDIT],
      }),
    );

    expect(updateSessionSpy).toHaveBeenCalledWith({
      permissions: [PermissionEnum.EDIT],
    });
  });

  it('helper functions emit correct events', () => {
    const { result } = renderHook(() => useSessionHeaderSocket({ sessionId, socket: socket as any }));

    act(() => result.current.emitChangeSessionName('  New  '));
    expect(socket.emit).toHaveBeenCalledWith('updateSessionName', {
      sessionId,
      newName: 'New',
    });

    act(() => result.current.emitDeleteSession());
    expect(socket.emit).toHaveBeenCalledWith('deleteSession', { sessionId });

    act(() => result.current.emitChangeUserPermissions(2, PermissionEnum.ADMIN));
    expect(socket.emit).toHaveBeenCalledWith('changeUserPermissions', {
      userId: 2,
      permission: PermissionEnum.ADMIN,
    });
  });

  it('redirects if current user not in session payload', () => {
    renderHook(() => useSessionHeaderSocket({ sessionId, socket: socket as any }));

    act(() =>
      socket.trigger('totalSessionData', {
        sessionData: { ...sessionPayload, userCollaborationSessions: [] },
        users: [],
        timeSpent: 0,
      }),
    );

    expect(setSnackbarMock).toHaveBeenCalledWith(
      'You don’t have permissions to access this page',
      SnackbarStatusEnum.ERROR,
    );
    expect(pushMock).toHaveBeenCalledWith('/dashboard');
  });
});
