import { renderHook, act } from '@testing-library/react';

import { PermissionEnum } from '@/models/enums';

import { useInvitationModalSocket } from '../useInvitationModalSocket';

class MockSocket {
  private listeners: Record<string, ((...a: any[]) => void)[]> = {};

  on = jest.fn((ev: string, cb: (...a: any[]) => void) => {
    (this.listeners[ev] ??= []).push(cb);
  });

  off = jest.fn();

  emit = jest.fn((ev: string, payload?: any, ack?: (...a: any[]) => void) => {
    if (typeof ack === 'function') {
      if (ev === 'createInvitation') {
        ack({
          ok: true,
          invitation: {
            id: 123,
            email: payload?.email,
            role: payload?.role,
          },
        });
      } else if (ev === 'changeInvitationRole') {
        ack({ ok: true, updated: { invitationId: payload?.invitationId, newRole: payload?.newRole } });
      } else if (ev === 'deleteInvitation' || ev === 'deleteNotification') {
        ack({ ok: true, deleted: { invitationId: payload?.invitationId } });
      } else if (ev === 'getInvitations') {
        ack({ ok: true, invitations: [] });
      } else {
        ack({ ok: true });
      }
    }
  });

  trigger(ev: string, ...args: any[]) {
    this.listeners[ev]?.forEach((cb) => cb(...args));
  }
}

const makeInv = (id: number, role = PermissionEnum.READ) => ({ id, role }) as any;

describe('useInvitationModalSocket', () => {
  let socket: MockSocket;

  beforeEach(() => {
    jest.clearAllMocks();
    socket = new MockSocket();
  });

  it('sets initial list via "invitations"', () => {
    const { result } = renderHook(() => useInvitationModalSocket(socket as any));
    const list = [makeInv(1), makeInv(2)];

    act(() => socket.trigger('invitations', list));
    expect(result.current.invitations).toEqual(list);
  });

  it('adds new invitation only once, updates existing, removes deleted', () => {
    const { result } = renderHook(() => useInvitationModalSocket(socket as any));

    act(() => socket.trigger('invitations', [makeInv(1)]));
    act(() => socket.trigger('newInvitation', makeInv(2)));
    act(() => socket.trigger('newInvitation', makeInv(2)));
    expect(result.current.invitations.map((i) => i.id)).toEqual([1, 2]);

    act(() => socket.trigger('invitationUpdated', makeInv(2, PermissionEnum.EDIT)));
    expect(result.current.invitations.find((i) => i.id === 2)?.role).toBe(PermissionEnum.EDIT);

    act(() => socket.trigger('invitationDeleted', { invitationId: 1 }));
    expect(result.current.invitations.map((i) => i.id)).toEqual([2]);
  });

  it('calls onError callback on socket "error"', () => {
    const errSpy = jest.fn();

    renderHook(() => useInvitationModalSocket(socket as any, errSpy));

    act(() => socket.trigger('error', 'boom'));
    expect(errSpy).toHaveBeenCalledWith('boom');
  });

  it('helper functions emit correct payloads', async () => {
    const { result } = renderHook(() => useInvitationModalSocket(socket as any));

    await act(async () => {
      await result.current.createInvitation({ email: 'a@b.com', role: PermissionEnum.ADMIN });
    });
    {
      const calls = (socket.emit as jest.Mock).mock.calls;
      const [ev, payload, ack] = calls[calls.length - 1];

      expect(ev).toBe('createInvitation');
      expect(payload).toEqual(
        expect.objectContaining({
          email: 'a@b.com',
          role: PermissionEnum.ADMIN,
        }),
      );

      if (ack !== undefined) expect(typeof ack).toBe('function');
    }

    await act(async () => {
      await result.current.changeInvitationRole(5, PermissionEnum.READ);
    });
    {
      const calls = (socket.emit as jest.Mock).mock.calls;
      const [ev, payload, ack] = calls[calls.length - 1];

      expect(ev).toBe('changeInvitationRole');
      expect(payload).toEqual(
        expect.objectContaining({
          invitationId: 5,
          newRole: PermissionEnum.READ,
        }),
      );

      if (ack !== undefined) expect(typeof ack).toBe('function');
    }

    await act(async () => {
      await result.current.deleteInvitation(5);
    });
    {
      const calls = (socket.emit as jest.Mock).mock.calls;
      const [ev, payload, ack] = calls[calls.length - 1];

      expect(ev).toBe('deleteInvitation');
      expect(payload).toEqual(
        expect.objectContaining({
          invitationId: 5,
        }),
      );

      if (ack !== undefined) expect(typeof ack).toBe('function');
    }

    await act(async () => {
      await result.current.fetchNotifications();
    });
    {
      const calls = (socket.emit as jest.Mock).mock.calls;
      const [ev, payload, ack] = calls[calls.length - 1];

      expect(ev).toBe('getInvitations');

      if (payload !== undefined) expect(payload).toEqual(expect.any(Object));

      if (ack !== undefined) expect(typeof ack).toBe('function');
    }
  });
});
