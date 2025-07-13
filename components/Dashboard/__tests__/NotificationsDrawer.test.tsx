import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';

import { PermissionEnum, InvitationStatusEnum, NotificationStatusEnum } from '@/models/enums';
import { IInvitation } from '@/models/models';

import NotificationsDrawer from '../NotificationsDrawer';

/* ------------------------------------------------------------------ */
/*                      1 — Mock nested components                     */
/* ------------------------------------------------------------------ */

// Drawer → просто рендер children, если isOpen
jest.mock('@/ui/Drawer', () => ({
  __esModule: true,
  default: ({ isOpen, children, handleClose }: any) =>
    isOpen ? (
      <div data-testid='mock-drawer'>
        <button data-testid='drawer-close' onClick={handleClose} />
        {children}
      </div>
    ) : null,
}));

// ⚠️ ВАЖНО — путь на уровень выше!
jest.mock('../NotificationItem', () => ({
  __esModule: true,
  default: ({ invitation, onAccept, onMarkAsRead, onDelete }: any) => (
    <li data-testid='mock-item'>
      <span>{invitation.id}</span>
      <button onClick={() => onAccept(invitation.id)}>accept</button>
      <button onClick={() => onMarkAsRead(invitation.id)}>read</button>
      <button onClick={() => onDelete(invitation.id)}>delete</button>
    </li>
  ),
}));

/* ------------------------------------------------------------------ */
/*                         2 — Test data helper                        */
/* ------------------------------------------------------------------ */
const mkInvitation = (id: number): IInvitation => ({
  id,
  inviterEmail: `user${id}@mail.com`,
  session: { id: id + 10, name: `Session ${id}` } as any,
  role: PermissionEnum.READ,
  date: '2025-07-10T12:00:00Z',
  expiresAt: '2025-07-12T12:00:00Z',
  notificationStatus: NotificationStatusEnum.UNREAD,
  invitationStatus: InvitationStatusEnum.PENDING,
  receiver: { id: 99, email: 'me@mail.com', name: 'Me' } as any,
});

/* ------------------------------------------------------------------ */
/*                                 Tests                              */
/* ------------------------------------------------------------------ */
describe('NotificationsDrawer', () => {
  const handleClose = jest.fn();
  const onAccept = jest.fn();
  const onRead = jest.fn();
  const onDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows “No new notifications” when list empty', () => {
    render(
      <NotificationsDrawer
        isOpen
        handleClose={handleClose}
        invitations={[]}
        onAccept={onAccept}
        onMarkAsRead={onRead}
        onDelete={onDelete}
      />,
    );

    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('No new notifications')).toBeInTheDocument();
  });

  it('renders NotificationItem for each invitation', () => {
    const list = [mkInvitation(1), mkInvitation(2), mkInvitation(3)];

    render(
      <NotificationsDrawer
        isOpen
        handleClose={handleClose}
        invitations={list}
        onAccept={onAccept}
        onMarkAsRead={onRead}
        onDelete={onDelete}
      />,
    );

    expect(screen.getAllByTestId('mock-item')).toHaveLength(list.length);
  });

  it('close button triggers handleClose', () => {
    render(
      <NotificationsDrawer
        isOpen
        handleClose={handleClose}
        invitations={[]}
        onAccept={onAccept}
        onMarkAsRead={onRead}
        onDelete={onDelete}
      />,
    );

    fireEvent.click(screen.getByTestId('drawer-close'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('propagates accept/read/delete callbacks from child items', () => {
    const list = [mkInvitation(5)];

    render(
      <NotificationsDrawer
        isOpen
        handleClose={handleClose}
        invitations={list}
        onAccept={onAccept}
        onMarkAsRead={onRead}
        onDelete={onDelete}
      />,
    );

    fireEvent.click(screen.getByText('accept'));
    expect(onAccept).toHaveBeenCalledWith(5);

    fireEvent.click(screen.getByText('read'));
    expect(onRead).toHaveBeenCalledWith(5);

    fireEvent.click(screen.getByText('delete'));
    expect(onDelete).toHaveBeenCalledWith(5);
  });
});
