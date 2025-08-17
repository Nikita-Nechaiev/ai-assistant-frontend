import React from 'react';

import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';

import { PermissionEnum } from '@/models/enums';

import SessionHeader from '../SessionHeader';

const pushMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  useParams: () => ({ id: '777', documentId: undefined }),
}));

jest.mock('@/components/common/UserAvatarCircle', () => ({
  __esModule: true,
  default: ({ email }: { email: string }) => <span data-testid='avatar'>{email}</span>,
}));

jest.mock('@/helpers/RequirePermission', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const emitName = jest.fn();
const emitDel = jest.fn();
const emitPerms = jest.fn();

const hookMock = {
  sessionName: 'Awesome Session',
  onlineUsers: Array.from({ length: 3 }, (_, i) => ({
    id: i + 1,
    name: `U${i + 1}`,
    email: `u${i + 1}@mail.com`,
    avatar: `a${i + 1}.png`,
    permissions: [PermissionEnum.READ],
  })),
  timeSpentMs: 65_000,
  emitChangeSessionName: emitName,
  emitDeleteSession: emitDel,
  emitChangeUserPermissions: emitPerms,
};

jest.mock('@/hooks/sockets/useSessionHeaderSocket', () => ({
  useSessionHeaderSocket: () => hookMock,
}));

const renderHeader = () =>
  render(<SessionHeader sessionId={777} socket={null as any} handleOpenInviteModal={jest.fn()} />);

const getIconButtons = () => screen.getAllByRole('button');

describe('SessionHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows session name, timer and avatars', () => {
    renderHeader();

    expect(screen.getByText(hookMock.sessionName)).toBeInTheDocument();
    expect(screen.getByText('1:05')).toBeInTheDocument();
    expect(screen.getAllByTestId('avatar')).toHaveLength(3);
  });

  it('enters edit mode, saves on Enter and emits change', () => {
    renderHeader();

    const [, editBtn] = getIconButtons();

    fireEvent.click(editBtn);

    const input = screen.getByDisplayValue(hookMock.sessionName);

    fireEvent.change(input, { target: { value: 'New Title' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(emitName).toHaveBeenCalledWith('New Title');
  });

  it('opens delete confirmation and emits delete on confirm', () => {
    renderHeader();

    const [, , deleteBtn] = getIconButtons();

    fireEvent.click(deleteBtn);

    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /delete/i }));

    expect(emitDel).toHaveBeenCalled();
  });

  it('navigates back to dashboard when back arrow clicked', () => {
    renderHeader();

    const [backBtn] = getIconButtons();

    fireEvent.click(backBtn);

    expect(pushMock).toHaveBeenCalledWith('/dashboard');
  });

  it('changes user permissions through avatar callback', () => {
    renderHeader();

    hookMock.emitChangeUserPermissions(2, PermissionEnum.EDIT);
    expect(emitPerms).toHaveBeenCalledWith(2, PermissionEnum.EDIT);
  });
});
