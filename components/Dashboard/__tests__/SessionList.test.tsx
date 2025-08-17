import React from 'react';

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useInfiniteQuery as _useInfiniteQuery, useMutation as _useMutation } from '@tanstack/react-query';

jest.mock('@tanstack/react-query');

const useInfiniteQuery = _useInfiniteQuery as jest.Mock;
const useMutation = _useMutation as jest.Mock;

const pushMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

jest.mock('@/services/SessionApi', () => ({
  SessionApi: {
    fetchUserSessions: jest.fn(),
    createSession: jest.fn(),
  },
}));

import SessionList from '../SessionList';

jest.mock('@/store/useUserStore', () => ({
  useUserStore: () => ({ user: { name: 'Alice' } }),
}));

const snackbarMock = jest.fn();

jest.mock('@/store/useSnackbarStore', () => () => ({
  setSnackbar: snackbarMock,
}));

jest.mock('@/ui/InputField', () => ({
  __esModule: true,
  default: ({ value = '', onChange, label }: any) => (
    <div>
      <span>{label}</span>
      <input aria-label={label} value={value} onChange={onChange} />
    </div>
  ),
}));
jest.mock('@/ui/SmallLoader', () => ({
  __esModule: true,
  default: () => <span data-testid='loader'>loader</span>,
}));
jest.mock('@/ui/Modal', () => ({
  __esModule: true,
  default: ({ isOpen, children, onClose, onSubmit }: any) =>
    isOpen ? (
      <div data-testid='modal'>
        {children}
        <button onClick={onSubmit}>submit</button>
        <button onClick={onClose}>close</button>
      </div>
    ) : null,
}));
jest.mock('../SessionItem', () => ({
  __esModule: true,
  default: ({ session }: any) => <li data-testid='session-item'>{session.name}</li>,
}));

const mkPage = (count: number, start = 0) =>
  Array.from({ length: count }, (_, i) => ({
    id: i + start,
    name: `Session ${i + start}`,
  }));

const baseQry = () => ({
  data: undefined as any,
  isLoading: false,
  error: null as any,
  fetchNextPage: jest.fn(),
  hasNextPage: false,
  isFetchingNextPage: false,
});

const setupQuery = (opts: Partial<ReturnType<typeof baseQry>> = {}) => {
  useInfiniteQuery.mockReturnValue({ ...baseQry(), ...opts });
};

const setupMutation = () => {
  const mutate = jest.fn();

  useMutation.mockReturnValue({ mutate });

  return mutate;
};

describe('SessionList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loader while fetching', () => {
    setupQuery({ isLoading: true });
    render(<SessionList />);

    expect(screen.getByTestId('loader')).toBeInTheDocument();
    expect(screen.getByText(/loading sessions/i)).toBeInTheDocument();
  });

  it('shows “No sessions” placeholder when data empty', () => {
    setupQuery({ data: { pages: [[]] } });
    render(<SessionList />);

    expect(screen.getByText('No sessions found')).toBeInTheDocument();
  });

  it('renders sessions and “Show More” fetches next page', () => {
    const fetchNextPage = jest.fn();

    setupQuery({
      data: { pages: [mkPage(3)] },
      hasNextPage: true,
      fetchNextPage,
    });
    render(<SessionList />);

    expect(screen.getAllByTestId('session-item')).toHaveLength(3);
    fireEvent.click(screen.getByText(/show more/i));
    expect(fetchNextPage).toHaveBeenCalled();
  });

  it('opens modal and creates session', async () => {
    setupQuery({ data: { pages: [[]] } });

    const mutateMock = setupMutation();

    render(<SessionList />);

    fireEvent.click(screen.getByText(/create session/i));

    const modal = screen.getByTestId('modal');

    expect(modal).toBeInTheDocument();

    const nameInput = screen.getByLabelText('Session Name') as HTMLInputElement;

    expect(nameInput.value).toMatch(/Alice/);

    fireEvent.click(screen.getByText('submit'));
    expect(mutateMock).toHaveBeenCalledWith(nameInput.value);

    const onSuccess = useMutation.mock.calls[0][0].onSuccess;

    onSuccess({ id: 77 });
    await waitFor(() => expect(snackbarMock).toHaveBeenCalled());
    expect(pushMock).toHaveBeenCalledWith('/session/77');
  });

  it('displays error message', () => {
    setupQuery({ error: { message: 'boom!' } });
    render(<SessionList />);

    expect(screen.getByText(/failed to load sessions/i)).toBeInTheDocument();
  });
});
