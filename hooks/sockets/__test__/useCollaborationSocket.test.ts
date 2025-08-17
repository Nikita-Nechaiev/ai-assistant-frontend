import { renderHook, act } from '@testing-library/react';

import { SnackbarStatusEnum } from '@/models/enums';

import { useCollaborationSocket } from '../useCollaborationSocket';

class MockSocket {
  private listeners: Record<string, ((...a: any[]) => void)[]> = {};

  on = jest.fn((ev: string, cb: (...a: any[]) => void) => {
    (this.listeners[ev] ??= []).push(cb);
  });

  emit = jest.fn();

  disconnect = jest.fn();

  trigger(ev: string, ...args: any[]) {
    this.listeners[ev]?.forEach((cb) => cb(...args));
  }
}

jest.mock('socket.io-client', () => ({ io: jest.fn(() => new MockSocket()) }));

const replaceMock = jest.fn();

jest.mock('next/navigation', () => ({ useRouter: () => ({ replace: replaceMock }) }));

jest.mock('@/helpers/isConvertableToNumber', () => ({
  isConvertableToNumber: jest.fn(),
}));

const { isConvertableToNumber } = jest.requireMock('@/helpers/isConvertableToNumber') as {
  isConvertableToNumber: jest.Mock;
};

jest.mock('@/store/useUserStore', () => ({
  useUserStore: () => ({ user: { id: 1 } }),
}));

const setSnackbarMock = jest.fn();

jest.mock('@/store/useSnackbarStore', () => ({
  __esModule: true,
  default: () => ({ setSnackbar: setSnackbarMock }),
}));

const clearSessionMock = jest.fn();

jest.mock('@/store/useSessionStore', () => ({
  useSessionStore: () => ({
    clearSession: clearSessionMock,
    setSession: jest.fn(),
  }),
}));

const { io } = jest.requireMock('socket.io-client') as { io: jest.Mock };
const latestSocket = (): MockSocket => io.mock.results[io.mock.results.length - 1].value as unknown as MockSocket;

describe('useCollaborationSocket', () => {
  beforeEach(() => jest.clearAllMocks());

  it('joins dashboard when no sessionId is provided', () => {
    renderHook(() => useCollaborationSocket({}));
    act(() => latestSocket().trigger('connect'));
    expect(latestSocket().emit).toHaveBeenCalledWith('joinDashboard');
  });

  it('emits joinSession with numeric sessionId', () => {
    isConvertableToNumber.mockReturnValue(true);
    renderHook(() => useCollaborationSocket({ sessionId: '7' }));
    act(() => latestSocket().trigger('connect'));
    expect(latestSocket().emit).toHaveBeenCalledWith('joinSession', { sessionId: 7 });
  });

  it('handles invalid sessionId by snackbar + redirect', () => {
    isConvertableToNumber.mockReturnValue(false);
    renderHook(() => useCollaborationSocket({ sessionId: 'abc' }));
    act(() => latestSocket().trigger('connect'));
    expect(setSnackbarMock).toHaveBeenCalledWith('Invalid session page', SnackbarStatusEnum.ERROR);
    expect(replaceMock).toHaveBeenCalledWith('/dashboard');
    expect(latestSocket().emit).not.toHaveBeenCalledWith('joinSession', expect.anything());
  });

  it('reacts to generic error event', () => {
    renderHook(() => useCollaborationSocket({}));
    act(() => latestSocket().trigger('error', 'boom'));
    expect(setSnackbarMock).toHaveBeenCalledWith('boom', SnackbarStatusEnum.ERROR);
  });

  it('reacts to invalidSession event', () => {
    renderHook(() => useCollaborationSocket({}));
    act(() => latestSocket().trigger('invalidSession', { message: 'bad' }));
    expect(setSnackbarMock).toHaveBeenCalledWith('bad', SnackbarStatusEnum.ERROR);
    expect(replaceMock).toHaveBeenCalledWith('/dashboard');
  });

  it('sessionDeleted → other user (warning)', () => {
    isConvertableToNumber.mockReturnValue(true);
    renderHook(() => useCollaborationSocket({ sessionId: '9' }));

    const s = latestSocket();

    act(() => s.trigger('sessionDeleted', { message: 'kicked', userId: 99 }));
    expect(s.emit).toHaveBeenCalledWith('leaveSession');
    expect(s.disconnect).toHaveBeenCalled();
    expect(setSnackbarMock).toHaveBeenCalledWith('kicked', SnackbarStatusEnum.WARNING);
    expect(replaceMock).toHaveBeenCalledWith('/dashboard');
  });

  it('sessionDeleted → current user (success)', () => {
    isConvertableToNumber.mockReturnValue(true);
    renderHook(() => useCollaborationSocket({ sessionId: '3' }));

    const s = latestSocket();

    act(() => s.trigger('sessionDeleted', { message: 'bye', userId: 1 }));
    expect(setSnackbarMock).toHaveBeenCalledWith('Session has been deleted', SnackbarStatusEnum.SUCCESS);
  });

  it('unmount cleans up: leaveSession / disconnect / clearSession', () => {
    isConvertableToNumber.mockReturnValue(true);

    const { unmount } = renderHook(() => useCollaborationSocket({ sessionId: '5' }));
    const s = latestSocket();

    unmount();
    expect(s.emit).toHaveBeenCalledWith('leaveSession');
    expect(s.disconnect).toHaveBeenCalled();
    expect(clearSessionMock).toHaveBeenCalled();
  });
});
