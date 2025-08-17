import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';

import { NotificationStatusEnum } from '@/models/enums';

import MainLayout from '../Layout';

const userState = { user: { id: 7, name: 'Alice', email: 'a@mail.com', avatar: 'ava.png' } };

jest.mock('@/store/useUserStore', () => ({
  useUserStore: () => userState,
}));

jest.mock('@/hooks/sockets/useCollaborationSocket', () => ({
  useCollaborationSocket: () => ({ socket: {} }),
}));

const fetchNotifications = jest.fn();
const acceptInvitation = jest.fn();
const updateNotificationStatus = jest.fn();
const deleteInvitation = jest.fn();
const invitationsMock = [{ id: 1, notificationStatus: NotificationStatusEnum.UNREAD }];

jest.mock('@/hooks/sockets/useDashboardSocket', () => ({
  useDashboardSocket: () => ({
    invitations: invitationsMock,
    fetchNotifications,
    acceptInvitation,
    updateNotificationStatus,
    deleteInvitation,
  }),
}));

jest.mock('@/ui/LargeLoader', () => () => <div data-testid='loader'>loader</div>);
jest.mock('@/ui/Snackbar', () => () => <div data-testid='snackbar'>snackbar</div>);
jest.mock('../Sidebar', () => () => <aside data-testid='sidebar'>sidebar</aside>);
jest.mock('../MainContent', () => ({ children }: { children: React.ReactNode }) => (
  <main data-testid='content'>{children}</main>
));

jest.mock('../Header', () => ({
  __esModule: true,
  default: ({ handleToggleDrawwer }: { handleToggleDrawwer: () => void }) => (
    <button data-testid='hdr-btn' onClick={handleToggleDrawwer}>
      hdr
    </button>
  ),
}));

jest.mock('@/components/Dashboard/NotificationsDrawer', () => ({
  __esModule: true,
  default: ({ isOpen, onAccept, onMarkAsRead, onDelete, handleClose }: any) => (
    <div data-testid={isOpen ? 'drawer-open' : 'drawer-closed'}>
      <button onClick={() => onAccept(1)}>acc</button>
      <button onClick={() => onMarkAsRead(1)}>read</button>
      <button onClick={() => onDelete(1)}>del</button>
      <button onClick={handleClose}>close</button>
    </div>
  ),
}));

describe('MainLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loader while user undefined', () => {
    userState.user = undefined as any;
    render(
      <MainLayout>
        <div>child</div>
      </MainLayout>,
    );
    expect(screen.getByTestId('loader')).toBeInTheDocument();
    userState.user = { id: 7 } as any;
  });

  it('renders children and toggles drawer (fetches notifications once)', () => {
    render(
      <MainLayout>
        <div>child</div>
      </MainLayout>,
    );

    expect(screen.getByText('child')).toBeInTheDocument();
    expect(screen.getByTestId('drawer-closed')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('hdr-btn'));
    expect(screen.getByTestId('drawer-open')).toBeInTheDocument();
    expect(fetchNotifications).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText('close'));
    expect(screen.getByTestId('drawer-closed')).toBeInTheDocument();
  });

  it('delegates accept / read / delete actions', () => {
    render(<MainLayout> x </MainLayout>);

    fireEvent.click(screen.getByTestId('hdr-btn'));

    fireEvent.click(screen.getByText('acc'));
    expect(acceptInvitation).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByText('read'));
    expect(updateNotificationStatus).toHaveBeenCalledWith(1, NotificationStatusEnum.READ);

    fireEvent.click(screen.getByText('del'));
    expect(deleteInvitation).toHaveBeenCalledWith(1);
  });
});
