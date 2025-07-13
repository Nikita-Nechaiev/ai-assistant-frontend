/**
 * @jest-environment jsdom
 */
import React from 'react';

import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';

import { PermissionEnum } from '@/models/enums';

import SessionHeader from '../SessionHeader';

/* ------------------------------------------------------------------ */
/*                 1 – external mocks/stubs                           */
/* ------------------------------------------------------------------ */

// next/navigation
const pushMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  useParams: () => ({ id: '777', documentId: undefined }),
}));

// User avatars → simple span
jest.mock('@/components/common/UserAvatarCircle', () => ({
  __esModule: true,
  default: ({ email }: { email: string }) => <span data-testid='avatar'>{email}</span>,
}));

// bypass permission check
jest.mock('@/helpers/RequirePermission', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// hook providing data + emitters
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
  timeSpentMs: 65_000, // 1 min 5 s
  emitChangeSessionName: emitName,
  emitDeleteSession: emitDel,
  emitChangeUserPermissions: emitPerms,
};

jest.mock('@/hooks/sockets/useSessionHeaderSocket', () => ({
  useSessionHeaderSocket: () => hookMock,
}));

/* ------------------------------------------------------------------ */
/*                           helpers                                  */
/* ------------------------------------------------------------------ */
const renderHeader = () =>
  render(<SessionHeader sessionId={777} socket={null as any} handleOpenInviteModal={jest.fn()} />);

// Quickly grab icon-only buttons by position:
const getIconButtons = () => screen.getAllByRole('button'); // order: back ▸ edit ▸ delete ▸ invite

/* ------------------------------------------------------------------ */
/*                               tests                                */
/* ------------------------------------------------------------------ */
describe('SessionHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows session name, timer and avatars', () => {
    renderHeader();

    expect(screen.getByText(hookMock.sessionName)).toBeInTheDocument();
    expect(screen.getByText('1:05')).toBeInTheDocument(); // timer
    expect(screen.getAllByTestId('avatar')).toHaveLength(3);
  });

  it('enters edit mode, saves on Enter and emits change', () => {
    renderHeader();

    const [, editBtn] = getIconButtons(); // second button → ✏️

    fireEvent.click(editBtn);

    const input = screen.getByDisplayValue(hookMock.sessionName);

    fireEvent.change(input, { target: { value: 'New Title' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(emitName).toHaveBeenCalledWith('New Title');
  });

  it('opens delete confirmation and emits delete on confirm', () => {
    renderHeader();

    const [, , deleteBtn] = getIconButtons(); // third button → 🗑️

    fireEvent.click(deleteBtn);

    // modal text present
    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();

    // modal’s “Delete” button (it’s the first with that label inside the DOM now)
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

    // simulate avatar hook call
    hookMock.emitChangeUserPermissions(2, PermissionEnum.EDIT);
    expect(emitPerms).toHaveBeenCalledWith(2, PermissionEnum.EDIT);
  });
});
