/**
 * @jest-environment jsdom
 */
import React from 'react';

import '@testing-library/jest-dom';
import { render, screen, fireEvent, act } from '@testing-library/react';

/* ──────────────────────────────────────────────────────────
 * 1 – global mocks (router, socket hook, permission helper)
 * ───────────────────────────────────────────────────────── */
const paramsMock = { id: '5', documentId: undefined };

jest.mock('next/navigation', () => ({
  useParams: () => paramsMock,
  // router isn’t used inside SessionLayout itself – no other stubs needed
}));

// The collaboration-socket hook: we’ll mutate its return between tests
const socketObj = {}; // dummy instance
let hookReturn: any = { socket: socketObj };

jest.mock('@/hooks/sockets/useCollaborationSocket', () => ({
  useCollaborationSocket: () => hookReturn,
}));

// By-pass permission checks
jest.mock('@/helpers/RequirePermission', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

/* ──────────────────────────────────────────────────────────
 * 2 – simple stubs for children rendered by SessionLayout
 * ───────────────────────────────────────────────────────── */
jest.mock('@/ui/LargeLoader', () => ({
  __esModule: true,
  default: () => <div data-testid='loader' />,
}));

jest.mock('../SessionHeader', () => ({
  __esModule: true,
  default: ({ handleOpenInviteModal }: { handleOpenInviteModal: () => void }) => (
    <header data-testid='header'>
      <button onClick={handleOpenInviteModal}>open-invite</button>
    </header>
  ),
}));

// Expose Chat’s open/close state via data-attribute for easy testing
jest.mock('../../Chat/Chat', () => ({
  __esModule: true,
  default: ({ isOpen }: { isOpen: boolean }) => (
    <div data-testid='chat' data-open={String(isOpen)}>
      CHAT
    </div>
  ),
}));

jest.mock('../../InvitationModal/InvitationModal', () => ({
  __esModule: true,
  default: ({ isOpen }: { isOpen: boolean }) => (isOpen ? <div data-testid='invite-modal'>INVITE</div> : null),
}));

/* ──────────────────────────────────────────────────────────
 * 3 – import component under test AFTER mocks
 * ───────────────────────────────────────────────────────── */
import SessionLayout from '../SessionLayout';

/* ──────────────────────────────────────────────────────────
 * 4 – helpers
 * ───────────────────────────────────────────────────────── */
const Child = () => <p data-testid='child'>page-content</p>;
const renderLayout = () => render(<SessionLayout>{<Child />}</SessionLayout>);

/* ──────────────────────────────────────────────────────────
 * 5 – tests
 * ───────────────────────────────────────────────────────── */
describe('SessionLayout', () => {
  afterEach(() => jest.clearAllMocks());

  it('shows loader while socket not yet ready', () => {
    hookReturn = { socket: null };
    renderLayout();

    expect(screen.getByTestId('loader')).toBeInTheDocument();
    expect(screen.queryByTestId('header')).not.toBeInTheDocument();
  });

  it('renders header + children once socket available', () => {
    hookReturn = { socket: socketObj };
    renderLayout();

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('toggles Chat drawer: floating button → Chat open/close', () => {
    hookReturn = { socket: socketObj };
    renderLayout();

    const fab = screen.getByRole('button', { name: '' });

    fireEvent.click(fab);

    expect(screen.getByTestId('chat')).toHaveAttribute('data-open', 'true');
    expect(screen.queryByRole('button', { name: '' })).not.toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByTestId('chat'));
    });

    act(() => {
      (screen.getByTestId('chat') as any).props?.handleClose?.();
    });
  });

  it('opens InvitationModal via header callback', () => {
    hookReturn = { socket: socketObj };
    renderLayout();

    expect(screen.queryByTestId('invite-modal')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('open-invite'));

    expect(screen.getByTestId('invite-modal')).toBeInTheDocument();
  });
});
