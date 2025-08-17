import React from 'react';

import '@testing-library/jest-dom';
import { render, screen, fireEvent, act } from '@testing-library/react';

const paramsMock = { id: '5', documentId: undefined };

jest.mock('next/navigation', () => ({
  useParams: () => paramsMock,
}));

const socketObj = {};
let hookReturn: any = { socket: socketObj };

jest.mock('@/hooks/sockets/useCollaborationSocket', () => ({
  useCollaborationSocket: () => hookReturn,
}));

jest.mock('@/helpers/RequirePermission', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

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

import SessionLayout from '../SessionLayout';

const Child = () => <p data-testid='child'>page-content</p>;
const renderLayout = () => render(<SessionLayout>{<Child />}</SessionLayout>);

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
