import React from 'react';

import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';

import { SnackbarStatusEnum } from '@/models/enums';

import AiUsageTable from '../AiUsageTable';

const useInfiniteQueryMock = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  useInfiniteQuery: (...args: any) => useInfiniteQueryMock(...args),
}));

jest.mock('@/components/common/InputField', () => ({
  __esModule: true,
  default: ({ marginBottom: _marginBottom, ...rest }: any) => (
    <label>
      Input mock
      <input {...rest} aria-label='search-input' />
    </label>
  ),
}));

const setSnackbarMock = jest.fn();

jest.mock('@/store/useSnackbarStore', () => () => ({
  setSnackbar: setSnackbarMock,
}));

Object.assign(navigator, {
  clipboard: { writeText: jest.fn() },
});

const mkUsage = (id: string, tool = 'Demo') => ({
  id,
  timestamp: new Date('2024-01-02T10:00:00Z').toISOString(),
  toolName: tool,
  sentText: `sent-${id}`,
  result: `result-${id}`,
});

const baseQuery = () => ({
  data: undefined as any,
  isLoading: false,
  fetchNextPage: jest.fn(),
  hasNextPage: false,
  isFetchingNextPage: false,
});

const mockQueryState = (opts: Partial<ReturnType<typeof baseQuery>> = {}) => {
  useInfiniteQueryMock.mockReturnValue({ ...baseQuery(), ...opts });
};

describe('AiUsageTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loader on first fetch', () => {
    mockQueryState({ isLoading: true });
    render(<AiUsageTable />);

    expect(screen.getByText('Loading request history…')).toBeInTheDocument();
  });

  it('shows “no data” placeholder', () => {
    mockQueryState({ data: { pages: [[]] } });
    render(<AiUsageTable />);

    expect(screen.getByText('A fresh page. Plenty of possibilities.')).toBeInTheDocument();
  });

  it('renders table rows and opens modal', () => {
    const usage = mkUsage('1');

    mockQueryState({ data: { pages: [[usage]] } });
    render(<AiUsageTable />);

    expect(screen.getByText(usage.toolName)).toBeInTheDocument();

    fireEvent.click(screen.getByText('View result'));

    const modal = screen.getByRole('dialog');

    expect(modal).toBeInTheDocument();
    expect(within(modal).getByText(usage.sentText)).toBeInTheDocument();
  });

  it('copies result & shows snackbar', async () => {
    const usage = mkUsage('2');

    mockQueryState({ data: { pages: [[usage]] } });
    render(<AiUsageTable />);

    fireEvent.click(screen.getByText('View result'));

    const modal = screen.getByRole('dialog');

    fireEvent.click(within(modal).getByRole('button', { name: 'Copy original text' }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(usage.sentText);
    await waitFor(() =>
      expect(setSnackbarMock).toHaveBeenCalledWith('Text copied to clipboard!', SnackbarStatusEnum.SUCCESS),
    );
  });

  it('"Show more" button fetches next page', () => {
    const fetchNextPage = jest.fn();

    mockQueryState({
      data: { pages: [[mkUsage('3')]] },
      hasNextPage: true,
      fetchNextPage,
    });
    render(<AiUsageTable />);

    fireEvent.click(screen.getByText('Show more'));
    expect(fetchNextPage).toHaveBeenCalled();
  });
});
