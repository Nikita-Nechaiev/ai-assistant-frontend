import React from 'react';

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import axiosInstance from '@/services/axiosInstance';
import { useUserStore } from '@/store/useUserStore';
import { queryKeys } from '@/lib/queryKeys';

import AiToolWorkspace from '../AiToolWorkspace';

jest.mock('@/services/axiosInstance', () => ({ __esModule: true, default: { post: jest.fn() } }));

const snackbar = jest.fn();

jest.mock('@/store/useSnackbarStore', () => ({ __esModule: true, default: () => ({ setSnackbar: snackbar }) }));

function setup() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const invalidate = jest.spyOn(client, 'invalidateQueries');

  useUserStore.setState({ user: { id: 7 } as any });
  render(
    <QueryClientProvider client={client}>
      <AiToolWorkspace />
    </QueryClientProvider>,
  );

  return { client, invalidate };
}

const post = axiosInstance.post as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  Object.assign(navigator, { clipboard: { writeText: jest.fn().mockResolvedValue(undefined) } });
});
it('validates translation, blocks repeated submissions, shows and copies results, and restarts', async () => {
  let resolve!: (value: any) => void;

  post.mockImplementation(
    () =>
      new Promise((r) => {
        resolve = r;
      }),
  );

  const { invalidate } = setup();

  fireEvent.click(screen.getByRole('button', { name: /Text Translation/ }));

  const run = screen.getByRole('button', { name: 'Run tool' });

  expect(run).toBeDisabled();
  fireEvent.change(screen.getByLabelText('Your text'), { target: { value: '   ' } });
  fireEvent.change(screen.getByLabelText('Translate into'), { target: { value: ' French ' } });
  expect(run).toBeDisabled();
  fireEvent.change(screen.getByLabelText('Your text'), { target: { value: ' Hello ' } });
  fireEvent.click(run);
  fireEvent.submit(run.closest('form')!);
  await waitFor(() => expect(post).toHaveBeenCalledTimes(1));
  expect(post).toHaveBeenCalledWith('/ai-tool-usage/translation', { text: 'Hello', targetLanguage: 'French' });
  await act(async () => resolve({ data: { result: 'Bonjour' } }));
  expect(await screen.findByText('Bonjour')).toBeInTheDocument();
  expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.ai(7) });
  expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.dashboard(7) });
  fireEvent.click(screen.getByRole('button', { name: 'Copy ai result' }));
  await waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Bonjour'));
  fireEvent.click(screen.getByRole('button', { name: /Try another tool/ }));
  expect(screen.getByRole('button', { name: /Grammar and Spelling Check/ })).toBeInTheDocument();
});
it('retains entered text after a failed request and allows retry', async () => {
  post.mockRejectedValueOnce(Error('offline')).mockResolvedValueOnce({ data: { result: 'Checked' } });
  setup();
  fireEvent.click(screen.getByRole('button', { name: /Grammar and Spelling Check/ }));
  fireEvent.change(screen.getByLabelText('Your text'), { target: { value: 'Text' } });
  fireEvent.click(screen.getByRole('button', { name: 'Run tool' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('please try again');
  expect(screen.getByLabelText('Your text')).toHaveValue('Text');
  expect(snackbar).toHaveBeenCalledWith('Could not complete your request. Please try again.', 'error');
  fireEvent.click(screen.getByRole('button', { name: 'Run tool' }));
  expect(await screen.findByText('Checked')).toBeInTheDocument();
});
