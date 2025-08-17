import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';

import { InvitationStatusEnum, NotificationStatusEnum, PermissionEnum } from '@/models/enums';
import { getExpirationMessage, isInvitationExpired } from '@/helpers/notificationHelpers';
import { ICollaborationSession, IInvitation, IUser } from '@/models/models';

import NotificationItem from '../NotificationItem';

jest.mock('@/helpers/notificationHelpers', () => ({
  getReceivedMessage: jest.fn(() => 'Received 1h ago'),
  getExpirationMessage: jest.fn(() => 'Expires in 1h'),
  isInvitationExpired: jest.fn(() => false),
}));

const mockIsExpired = isInvitationExpired as jest.Mock;
const mockExpireMsg = getExpirationMessage as jest.Mock;

const baseInvitation: IInvitation = {
  id: 1,
  inviterEmail: 'alice@mail.com',
  session: { id: 11, name: 'Project X' } as ICollaborationSession,
  role: PermissionEnum.EDIT,
  date: '2025-07-10T12:00:00Z',
  expiresAt: '2025-07-12T12:00:00Z',
  notificationStatus: NotificationStatusEnum.UNREAD,
  invitationStatus: InvitationStatusEnum.PENDING,
  receiver: {
    id: 2,
    email: 'bob@mail.com',
    name: 'Bob',
  } as IUser,
};

describe('NotificationItem', () => {
  const onAccept = jest.fn();
  const onRead = jest.fn();
  const onDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders invitation info and unread dot', () => {
    render(
      <NotificationItem invitation={baseInvitation} onAccept={onAccept} onMarkAsRead={onRead} onDelete={onDelete} />,
    );

    expect(screen.getByText('New Invitation')).toBeInTheDocument();
    expect(screen.getByText(baseInvitation.inviterEmail)).toBeInTheDocument();
    expect(screen.getByText(baseInvitation.session.name)).toBeInTheDocument();

    const rootItem = screen.getAllByRole('listitem')[0];

    expect(rootItem.querySelector('div.bg-red-500')).toBeInTheDocument();
  });

  it('marks as read when list item clicked', () => {
    render(
      <NotificationItem invitation={baseInvitation} onAccept={onAccept} onMarkAsRead={onRead} onDelete={onDelete} />,
    );

    const rootItem = screen.getAllByRole('listitem')[0];

    fireEvent.click(rootItem);
    expect(onRead).toHaveBeenCalledWith(baseInvitation.id);
  });

  it('fires delete without triggering mark-as-read', () => {
    render(
      <NotificationItem invitation={baseInvitation} onAccept={onAccept} onMarkAsRead={onRead} onDelete={onDelete} />,
    );

    fireEvent.click(screen.getByTitle('Delete'));
    expect(onDelete).toHaveBeenCalledWith(baseInvitation.id);
    expect(onRead).not.toHaveBeenCalled();
  });

  it('accepts invitation when “Accept” clicked', () => {
    render(
      <NotificationItem invitation={baseInvitation} onAccept={onAccept} onMarkAsRead={onRead} onDelete={onDelete} />,
    );

    fireEvent.click(screen.getByRole('button', { name: /accept/i }));
    expect(onAccept).toHaveBeenCalledWith(baseInvitation.id);
  });

  it('disables “Accept” when invitation expired', () => {
    mockIsExpired.mockReturnValueOnce(true);
    mockExpireMsg.mockReturnValueOnce('Expired');

    render(
      <NotificationItem
        invitation={{ ...baseInvitation }}
        onAccept={onAccept}
        onMarkAsRead={onRead}
        onDelete={onDelete}
      />,
    );

    expect(screen.queryByRole('button', { name: /accept/i })).toBeNull();
    expect(screen.getAllByText(/expired/i).length).toBeGreaterThan(0);
  });
});
