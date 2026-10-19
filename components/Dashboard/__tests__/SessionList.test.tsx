import React from 'react';

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import { useUserSessions } from '@/hooks/dashboard/useUserSessions';

import SessionList from '../SessionList';

jest.mock('@/hooks/dashboard/useUserSessions');
jest.mock('../SessionItem', () => ({ __esModule: true, default: ({ session }: any) => <li>{session.name}</li> }));

const query = useUserSessions as jest.Mock;
const create = jest.fn();
const state = (overrides = {}) => ({
  data: { pages: [[]] },
  isLoading: false,
  error: null,
  refetch: jest.fn(),
  fetchNextPage: jest.fn().mockResolvedValue({ isError: false }),
  hasNextPage: false,
  isFetchingNextPage: false,
  isFetchNextPageError: false,
  ...overrides,
});
const sessions = (count: number) => Array.from({ length: count }, (_, id) => ({ id, name: `Session ${id}` }));

beforeEach(() => {
  jest.clearAllMocks();
  query.mockReturnValue(state());
});
it('shows loading and retryable errors', () => {
  query.mockReturnValue(state({ isLoading: true }));

  const { rerender } = render(<SessionList onCreateSession={create} />);

  expect(screen.getByRole('status')).toHaveTextContent('Loading sessions');

  const refetch = jest.fn();

  query.mockReturnValue(state({ error: new Error('offline'), refetch }));
  rerender(<SessionList onCreateSession={create} />);
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
  expect(refetch).toHaveBeenCalledTimes(1);
});
it('lets an empty account create its first session', () => {
  render(<SessionList onCreateSession={create} />);
  expect(screen.getByText('No sessions yet')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Create your first session' }));
  expect(create).toHaveBeenCalledTimes(1);
});
it('debounces searches and allows clearing unmatched results', async () => {
  jest.useFakeTimers();
  render(<SessionList onCreateSession={create} />);
  fireEvent.change(screen.getByRole('textbox'), { target: { value: ' project ' } });
  act(() => {
    jest.advanceTimersByTime(350);
  });
  expect(query).toHaveBeenLastCalledWith('project');
  expect(screen.getByText('No sessions found')).toBeInTheDocument();
  fireEvent.click(screen.getAllByRole('button', { name: 'Clear search' })[0]);
  act(() => {
    jest.advanceTimersByTime(350);
  });
  expect(query).toHaveBeenLastCalledWith('');
  jest.useRealTimers();
});
it('reveals cached sessions before fetching another page', async () => {
  const value = state({ data: { pages: [sessions(9)] }, hasNextPage: true });

  query.mockReturnValue(value);
  render(<SessionList onCreateSession={create} />);
  expect(screen.getAllByRole('listitem')).toHaveLength(6);
  fireEvent.click(screen.getByRole('button', { name: /Show More/i }));
  await waitFor(() => expect(screen.getAllByRole('listitem')).toHaveLength(9));
  expect(value.fetchNextPage).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: /Show More/i }));
  await waitFor(() => expect(value.fetchNextPage).toHaveBeenCalledTimes(1));
});
it('does not advance pagination after a failed request', async () => {
  const value = state({
    data: { pages: [sessions(6)] },
    hasNextPage: true,
    isFetchNextPageError: true,
    fetchNextPage: jest.fn().mockResolvedValue({ isError: true }),
  });

  query.mockReturnValue(value);
  render(<SessionList onCreateSession={create} />);
  fireEvent.click(screen.getByRole('button', { name: /Show More/i }));
  await waitFor(() => expect(value.fetchNextPage).toHaveBeenCalled());
  expect(screen.getAllByRole('listitem')).toHaveLength(6);
  expect(screen.getByRole('alert')).toHaveTextContent('Could not load more sessions');
});
