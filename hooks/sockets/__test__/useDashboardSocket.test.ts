import { renderHook, act } from '@testing-library/react';

import { InvitationStatusEnum, NotificationStatusEnum, SnackbarStatusEnum } from '@/models/enums';

import { useDashboardSocket } from '../useDashboardSocket';

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

const pushMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

const setSnackbarMock = jest.fn();

jest.mock('@/store/useSnackbarStore', () => ({
  __esModule: true,
  default: () => ({ setSnackbar: setSnackbarMock }),
}));

const makeInvitation = (
  id: number,
  notif: NotificationStatusEnum = NotificationStatusEnum.UNREAD,
  inv: InvitationStatusEnum = InvitationStatusEnum.PENDING,
) => ({
  id,
  role: 'VIEWER',
  invitationStatus: inv,
  notificationStatus: notif,
  date: '2025-01-01',
  expiresAt: '2025-02-01',
  inviterEmail: `u${id}@mail.com`,
  receiver: {} as any,
  session: {} as any,
});

describe('useDashboardSocket', () => {
  let socket: MockSocket;

  beforeEach(() => {
    jest.clearAllMocks();
    socket = new MockSocket();
  });

  it('initialises invitations via "notifications"', () => {
    const { result } = renderHook(() => useDashboardSocket(socket as any));
    const list = [makeInvitation(1), makeInvitation(2)];

    act(() => socket.trigger('notifications', list));
    expect(result.current.invitations).toEqual(list);
  });

  it('upserts on new / updated invitation events', () => {
    const { result } = renderHook(() => useDashboardSocket(socket as any));

    act(() => socket.trigger('notifications', [makeInvitation(1)]));
    act(() => socket.trigger('newInvitation', makeInvitation(2)));
    expect(result.current.invitations.map((i) => i.id)).toEqual([1, 2]);

    const updated = makeInvitation(2, NotificationStatusEnum.READ, InvitationStatusEnum.PENDING);

    act(() => socket.trigger('invitationUpdated', updated));

    expect(result.current.invitations.find((i) => i.id === 2)?.notificationStatus).toBe(NotificationStatusEnum.READ);
  });

  it('removes on "notificationDeleted"', () => {
    const { result } = renderHook(() => useDashboardSocket(socket as any));

    act(() => socket.trigger('notifications', [makeInvitation(1), makeInvitation(2)]));
    act(() => socket.trigger('notificationDeleted', { invitationId: 1 }));
    expect(result.current.invitations.map((i) => i.id)).toEqual([2]);
  });

  it('accepts invitation → snackbar + redirect', () => {
    renderHook(() => useDashboardSocket(socket as any));

    act(() =>
      socket.trigger('invitationAccepted', {
        invitationSessionId: 77,
        invitationId: 3,
      }),
    );

    expect(setSnackbarMock).toHaveBeenCalledWith('Invitation accepted. Redirecting…', SnackbarStatusEnum.SUCCESS);
    expect(pushMock).toHaveBeenCalledWith('/session/77');
  });

  it('exposes helpers that emit correct payloads', () => {
    const { result } = renderHook(() => useDashboardSocket(socket as any));

    act(() => result.current.fetchNotifications());
    expect(socket.emit).toHaveBeenCalledWith('getNotifications');

    act(() => result.current.acceptInvitation(9));
    expect(socket.emit).toHaveBeenCalledWith('acceptInvitation', {
      invitationId: 9,
    });

    act(() => result.current.updateNotificationStatus(9, NotificationStatusEnum.READ));
    expect(socket.emit).toHaveBeenCalledWith('updateNotificationStatus', {
      invitationId: 9,
      status: NotificationStatusEnum.READ,
    });

    act(() => result.current.deleteInvitation(9));
    expect(socket.emit).toHaveBeenCalledWith('deleteNotification', {
      invitationId: 9,
    });
  });
});
