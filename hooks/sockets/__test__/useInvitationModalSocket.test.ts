import { renderHook, act } from '@testing-library/react';

import { PermissionEnum } from '@/models/enums';

import { useInvitationModalSocket } from '../useInvitationModalSocket';

class MockSocket {
  private listeners: Record<string, ((...a: any[]) => void)[]> = {};

  on = jest.fn((ev: string, cb: (...a: any[]) => void) => {
    (this.listeners[ev] ??= []).push(cb);
  });

  off = jest.fn();

  emit = jest.fn();

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
    act(() => socket.trigger('newInvitation', makeInv(2))); // duplicate
    expect(result.current.invitations.map((i) => i.id)).toEqual([1, 2]);

    // update role of id 2
    act(() => socket.trigger('invitationUpdated', makeInv(2, PermissionEnum.EDIT)));
    expect(result.current.invitations.find((i) => i.id === 2)?.role).toBe(PermissionEnum.EDIT);

    // delete id 1
    act(() => socket.trigger('notificationDeleted', { invitationId: 1 }));
    expect(result.current.invitations.map((i) => i.id)).toEqual([2]);
  });

  it('calls onError callback on socket "error"', () => {
    const errSpy = jest.fn();

    renderHook(() => useInvitationModalSocket(socket as any, errSpy));

    act(() => socket.trigger('error', 'boom'));
    expect(errSpy).toHaveBeenCalledWith('boom');
  });

  it('helper functions emit correct payloads', () => {
    const { result } = renderHook(() => useInvitationModalSocket(socket as any));

    act(() => result.current.createInvitation({ email: 'a@b.com', role: PermissionEnum.ADMIN }));
    expect(socket.emit).toHaveBeenCalledWith('createInvitation', {
      email: 'a@b.com',
      role: PermissionEnum.ADMIN,
    });

    act(() => result.current.changeInvitationRole(5, PermissionEnum.READ));
    expect(socket.emit).toHaveBeenCalledWith('changeInvitationRole', {
      invitationId: 5,
      newRole: PermissionEnum.READ,
    });

    act(() => result.current.deleteInvitation(5));
    expect(socket.emit).toHaveBeenCalledWith('deleteNotification', {
      invitationId: 5,
    });

    act(() => result.current.fetchNotifications());
    expect(socket.emit).toHaveBeenCalledWith('getInvitations');
  });
});
