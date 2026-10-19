import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';
import { useMutation } from '@tanstack/react-query';

import Dashboard from '../Dashboard';
import CreateSessionDialog from '../CreateSessionDialog';

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(),
  useQueryClient: () => ({ invalidateQueries: jest.fn() }),
}));

let user: any = { name: 'Star Smith' };

jest.mock('@/store/useUserStore', () => ({
  useUserStore: (selector: any) => (selector ? selector({ user }) : { user }),
}));

const push = jest.fn(),
  snackbar = jest.fn();

jest.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
jest.mock('@/store/useSnackbarStore', () => ({ __esModule: true, default: () => ({ setSnackbar: snackbar }) }));
jest.mock('../SessionList', () => ({
  __esModule: true,
  default: ({ onCreateSession }: any) => <button onClick={onCreateSession}>Create first session</button>,
}));
jest.mock('../DashboardStatistics', () => ({ __esModule: true, default: () => <section aria-label='Statistics' /> }));

const mutation = useMutation as jest.Mock;
const reset = jest.fn(),
  mutate = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  user = { name: 'Star Smith' };
  mutation.mockReturnValue({ reset, mutate, isPending: false, error: null });
});
it('keeps the greeting, statistics, session list and shared-session card', () => {
  render(<Dashboard />);
  expect(screen.getByRole('heading', { name: /Welcome back, Star/ })).toBeInTheDocument();
  expect(screen.getByRole('region', { name: 'Statistics' })).toBeInTheDocument();
  expect(screen.getByText('Create. Invite. Collaborate.')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'AI Assistance' })).toHaveAttribute('href', '/ai-assistance');
  fireEvent.click(screen.getByRole('button', { name: 'Create a session' }));
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(screen.getByLabelText('Session name')).toHaveValue("Star Smith's session");
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Create first session' }));
  expect(screen.getByRole('dialog')).toBeInTheDocument();
});
it('allows creating a trimmed title and handles success', () => {
  const close = jest.fn();

  render(<CreateSessionDialog open onOpenChange={close} triggerRef={{ current: null }} />);

  const input = screen.getByLabelText('Session name');

  fireEvent.change(input, { target: { value: '   ' } });
  expect(screen.getByRole('button', { name: 'Create session' })).toBeDisabled();
  fireEvent.change(input, { target: { value: ' Project ' } });
  fireEvent.click(screen.getByRole('button', { name: 'Create session' }));
  expect(mutate).toHaveBeenCalledWith('Project');
  mutation.mock.calls.at(-1)[0].onSuccess({ id: 23 });
  expect(close).toHaveBeenCalledWith(false);
  expect(push).toHaveBeenCalledWith('/session/23');
  expect(snackbar).toHaveBeenCalledWith('Session created successfully!', 'success');
});
it('handles a missing name, pending requests and retryable creation failures', () => {
  user = null;
  mutation.mockReturnValue({ reset, mutate, isPending: true, error: new Error('offline') });

  const { rerender } = render(<CreateSessionDialog open onOpenChange={jest.fn()} triggerRef={{ current: null }} />);

  expect(screen.getByLabelText('Session name')).toHaveValue('Untitled session');
  expect(screen.getByRole('button', { name: 'Creating…' })).toBeDisabled();
  expect(screen.getByRole('alert')).toHaveTextContent('Please try again');
  rerender(<CreateSessionDialog open={false} onOpenChange={jest.fn()} triggerRef={{ current: null }} />);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
