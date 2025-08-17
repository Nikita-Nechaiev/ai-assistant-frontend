import { renderHook, act } from '@testing-library/react';

import { SnackbarStatusEnum } from '@/models/enums';

import { useChatSocket } from '../useChatSocket';

class MockSocket {
  private listeners: Record<string, ((...a: any[]) => void)[]> = {};

  on = jest.fn((ev: string, cb: (...a: any[]) => void) => {
    (this.listeners[ev] ??= []).push(cb);
  });

  off = jest.fn((ev: string, cb: (...a: any[]) => void) => {
    this.listeners[ev] = (this.listeners[ev] || []).filter((f) => f !== cb);
  });

  emit = jest.fn();

  trigger(ev: string, ...args: any[]) {
    this.listeners[ev]?.forEach((cb) => cb(...args));
  }
}

const setSnackbarMock = jest.fn();

jest.mock('@/store/useSnackbarStore', () => ({
  __esModule: true,
  default: () => ({ setSnackbar: setSnackbarMock }),
}));

describe('useChatSocket', () => {
  const sampleMsgs = [{ id: 1, text: 'hi' }];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('populates messages on "messages" event', () => {
    const socket = new MockSocket();
    const { result } = renderHook(() => useChatSocket({ socket: socket as any, isOpen: false }));

    act(() => socket.trigger('messages', sampleMsgs));
    expect(result.current.messages).toEqual(sampleMsgs);
  });

  it('appends a new message on "newMessage" event', () => {
    const socket = new MockSocket();
    const { result } = renderHook(() => useChatSocket({ socket: socket as any, isOpen: false }));

    act(() => socket.trigger('messages', sampleMsgs));
    act(() => socket.trigger('newMessage', { id: 2, text: 'yo' }));

    expect(result.current.messages).toEqual([
      { id: 1, text: 'hi' },
      { id: 2, text: 'yo' },
    ]);
  });

  it('shows snackbar on "error" event', () => {
    const socket = new MockSocket();

    renderHook(() => useChatSocket({ socket: socket as any, isOpen: false }));

    act(() => socket.trigger('error', 'boom'));
    expect(setSnackbarMock).toHaveBeenCalledWith('boom', SnackbarStatusEnum.ERROR);
  });

  it('emits getMessages once chat opens', () => {
    const socket = new MockSocket();
    const { rerender } = renderHook(
      ({ open }: { open: boolean }) => useChatSocket({ socket: socket as any, isOpen: open }),
      { initialProps: { open: false } },
    );

    expect(socket.emit).not.toHaveBeenCalledWith('getMessages');
    rerender({ open: true });
    expect(socket.emit).toHaveBeenCalledWith('getMessages');
  });

  it('sendMessage trims and emits sendMessage', () => {
    const socket = new MockSocket();
    const { result } = renderHook(() => useChatSocket({ socket: socket as any, isOpen: false }));

    act(() => result.current.sendMessage('   hello  '));
    expect(socket.emit).toHaveBeenCalledWith('sendMessage', { message: 'hello' });

    act(() => result.current.sendMessage('   '));
    expect(socket.emit).toHaveBeenCalledTimes(1);
  });
});
