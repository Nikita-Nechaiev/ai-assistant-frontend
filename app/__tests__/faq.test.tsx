import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';

import FAQPage from '../faq/page';

jest.mock('@/components/Layout/Layout', () => ({
  __esModule: true,
  default: ({ children }: any) => <main>{children}</main>,
}));
it('filters FAQ categories and searches answers, expands matches and resets empty searches', () => {
  render(<FAQPage />);
  expect(screen.getByRole('status')).toHaveTextContent('15 answers');
  fireEvent.click(screen.getByRole('button', { name: 'Your account' }));
  expect(screen.getByRole('status')).toHaveTextContent('2 answers');
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'reset my password' } });
  expect(screen.getByRole('status')).toHaveTextContent('1 answer');
  expect(document.querySelector('details')).toHaveAttribute('open');
  fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
  expect(screen.getByRole('status')).toHaveTextContent('2 answers');
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'does-not-exist' } });
  expect(screen.getByText('No answers found')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Show all questions' }));
  expect(screen.getByRole('status')).toHaveTextContent('15 answers');

  for (const label of ['Sessions & teamwork', 'Documents & AI', 'Getting started', 'All topics'])
    fireEvent.click(screen.getByRole('button', { name: label }));

  expect(screen.getByRole('link', { name: 'Open dashboard' })).toHaveAttribute('href', '/dashboard');
});
