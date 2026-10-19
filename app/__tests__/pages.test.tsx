import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';
import { useQuery } from '@tanstack/react-query';

import DocumentHelp from '@/components/Document/DocumentHelp';
import DocumentLoading from '@/components/Document/DocumentLoading';
import { SessionContext } from '@/components/Session/SessionLayout/SessionLayout';

import AiPage from '../ai-assistance/page';
import StepperPage from '../ai-assistance/stepper/page';
import DashboardPage from '../dashboard/page';
import SessionPage from '../session/[id]/page';
import SessionLoading from '../session/loading';
import SessionLayout from '../session/layout';
import ErrorPage from '../error';
import NotFound from '../not-found';

const back = jest.fn();

jest.mock('next/navigation', () => ({ useRouter: () => ({ back }) }));
jest.mock('@tanstack/react-query', () => ({ useQuery: jest.fn() }));
jest.mock('@/components/Layout/Layout', () => ({
  __esModule: true,
  default: ({ children }: any) => <main>{children}</main>,
}));
jest.mock('@/components/Session/SessionLayout/SessionLayout', () => ({
  __esModule: true,
  default: ({ children }: any) => <main>{children}</main>,
  SessionContext: require('react').createContext(null),
}));
jest.mock('@/components/Session/DocumentSection/DocumentList', () => ({
  __esModule: true,
  default: ({ sessionId }: any) => <div>Documents for {sessionId}</div>,
}));
jest.mock('@/components/AiAssistance/AiUsageTable', () => ({
  __esModule: true,
  default: () => <div>Request history</div>,
}));
jest.mock('@/components/AiAssistance/AiToolWorkspace', () => ({
  __esModule: true,
  default: () => <div>Request workspace</div>,
}));
jest.mock('@/components/Dashboard/Dashboard', () => ({
  __esModule: true,
  default: () => <div>Dashboard content</div>,
}));
it('shows AI statistics loading, errors, no data and loaded results without a second tool catalog', () => {
  const query = useQuery as jest.Mock;
  const refetch = jest.fn();

  query.mockReturnValue({ isLoading: true });

  const { rerender } = render(<AiPage />);

  expect(screen.getByLabelText('Loading AI statistics')).toBeInTheDocument();
  query.mockReturnValue({ error: Error('offline'), refetch });
  rerender(<AiPage />);
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
  expect(refetch).toHaveBeenCalled();
  query.mockReturnValue({});
  rerender(<AiPage />);
  expect(screen.queryByText('Your AI at a glance')).not.toBeInTheDocument();

  for (const firstAiUsage of [null, '2026-10-17T12:00:00Z']) {
    query.mockReturnValue({ data: { firstAiUsage, totalUsageNumber: 0, totalWordCount: 0, mostFrequentTool: null } });
    rerender(<AiPage />);
    expect(screen.getByText('Your AI at a glance')).toBeInTheDocument();
  }

  expect(screen.getByRole('link', { name: 'Start a new request' })).toHaveAttribute('href', '/ai-assistance/stepper');
  expect(screen.queryByRole('group', { name: 'Filter AI tools' })).not.toBeInTheDocument();
});
it('renders dashboard and stepper routes', async () => {
  const { rerender } = render(await DashboardPage());

  expect(screen.getByText('Dashboard content')).toBeInTheDocument();
  rerender(<StepperPage />);
  expect(screen.getByText('Request workspace')).toBeInTheDocument();
});
it('waits for a session socket before rendering documents', () => {
  const { rerender } = render(<SessionPage />);

  expect(screen.getByRole('status')).toBeInTheDocument();
  rerender(
    <SessionContext.Provider value={{ socket: null } as any}>
      <SessionPage />
    </SessionContext.Provider>,
  );
  expect(screen.getByRole('status')).toBeInTheDocument();
  rerender(
    <SessionContext.Provider value={{ socket: {}, sessionId: 9 } as any}>
      <SessionPage />
    </SessionContext.Provider>,
  );
  expect(screen.getByText('Documents for 9')).toBeInTheDocument();
});
it('renders route shells and document loading states', () => {
  const { rerender } = render(<SessionLayout>Session children</SessionLayout>);

  expect(screen.getByText('Session children')).toBeInTheDocument();
  expect(SessionLoading()).toBeUndefined();
  rerender(<DocumentLoading editorOnly />);
  expect(screen.getByRole('status', { name: 'Loading editor' })).toBeInTheDocument();
});
it('offers recovery from errors and missing routes', () => {
  const log = jest.spyOn(console, 'error').mockImplementation(() => {}),
    reset = jest.fn();
  const { rerender } = render(<ErrorPage error={new Error('offline')} reset={reset} />);

  fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
  expect(reset).toHaveBeenCalled();
  expect(log).toHaveBeenCalled();
  rerender(<NotFound />);
  fireEvent.click(screen.getByRole('button', { name: 'Go back' }));
  expect(back).toHaveBeenCalled();
  log.mockRestore();
});
it('explains document editing and AI insertion in a dismissible help dialog', () => {
  render(<DocumentHelp />);
  fireEvent.click(screen.getByRole('button', { name: 'Show info about working with your document' }));
  expect(screen.getByRole('dialog')).toHaveTextContent('Paste in document');
  fireEvent.click(screen.getByRole('button', { name: 'Got it' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
