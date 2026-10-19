import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';
import { useQuery } from '@tanstack/react-query';

import DashboardStatistics from '../DashboardStatistics';
import DashboardActivityChart from '../DashboardActivityChart';

jest.mock('@tanstack/react-query', () => ({ useQuery: jest.fn() }));
jest.mock('@/store/useUserStore', () => ({ useUserStore: (selector: any) => selector({ user: { id: 7 } }) }));

const query = useQuery as jest.Mock;
const data = (active = false) => ({
  overview: {
    totalTimeSpentSeconds: 0,
    totalTimeSpentLabel: '0s',
    totalDocuments: 0,
    totalSessions: 0,
    createdSessions: 0,
    joinedSessions: 0,
  },
  activity: {
    startDate: '2026-09-18',
    endDate: '2026-10-17',
    timeZone: 'UTC',
    maxDailyCount: active ? 3 : 0,
    totals: { documentsCreated: active ? 3 : 0, aiRequests: 0 },
    days: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.UTC(2026, 8, 18 + i)).toISOString().slice(0, 10),
      documentsCreated: active && i === 29 ? 3 : 0,
      aiRequests: 0,
    })),
  },
});

it('keeps all four metrics and the chart visible for a new account', () => {
  query.mockReturnValue({ data: data(), isPending: false, isFetching: false });
  render(<DashboardStatistics />);

  for (const label of ['Time in sessions', 'Shared documents', 'Sessions created', 'Sessions joined'])
    expect(screen.getByText(label)).toBeInTheDocument();

  expect(screen.getByText('0s')).toBeInTheDocument();
  expect(screen.getByText('No recorded activity in this period')).toBeInTheDocument();
  expect(query.mock.calls.at(-1)[0]).toMatchObject({ queryKey: ['user', 7, 'statistics', 'dashboard'], enabled: true });
});
it('supports refresh, loading, initial errors and stale-data errors', () => {
  const refetch = jest.fn();

  query.mockReturnValue({ data: undefined, isPending: true, isFetching: true, refetch });

  const { rerender } = render(<DashboardStatistics />);

  expect(screen.getByLabelText('Loading workspace statistics')).toBeInTheDocument();
  expect(screen.getByRole('button')).toBeDisabled();
  query.mockReturnValue({ error: new Error('offline'), isPending: false, isFetching: false, refetch });
  rerender(<DashboardStatistics />);
  expect(screen.getByRole('alert')).toHaveTextContent('Could not load statistics');
  fireEvent.click(screen.getByRole('button'));
  expect(refetch).toHaveBeenCalledTimes(1);
  query.mockReturnValue({ data: data(), error: new Error('offline'), refetch });
  rerender(<DashboardStatistics />);
  expect(screen.getByRole('status')).toHaveTextContent('last loaded data');
});
it('lets users inspect activity with arrow keys, mouse and pointer', () => {
  const { container } = render(<DashboardActivityChart activity={data(true).activity as any} />);
  const chart = screen.getByRole('group');

  expect(screen.getByRole('status')).toHaveTextContent('Oct 17: 3 documents');
  fireEvent.keyDown(chart, { key: 'ArrowLeft' });
  expect(screen.getByRole('status')).toHaveTextContent('Oct 16: 0 documents');
  fireEvent.keyDown(chart, { key: 'ArrowRight' });
  fireEvent.keyDown(chart, { key: 'ArrowRight' });
  expect(screen.getByRole('status')).toHaveTextContent('Oct 17: 3 documents');

  const regions = container.querySelectorAll('rect');

  fireEvent.mouseEnter(regions[0]);
  expect(screen.getByRole('status')).toHaveTextContent('Sep 18:');
  fireEvent.pointerDown(regions[1]);
  expect(screen.getByRole('status')).toHaveTextContent('Sep 19:');
  fireEvent.keyDown(chart, { key: 'Tab' });
  expect(screen.getByRole('status')).toHaveTextContent('Sep 19:');
});
