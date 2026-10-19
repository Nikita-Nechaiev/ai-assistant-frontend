import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';

import { aiToolList } from '@/helpers/aiToolsList';

import Step1SelectTool from '../Step1SelectTool';

it('shows available tools and lets the user select a tool', () => {
  const select = jest.fn();

  render(<Step1SelectTool onToolSelect={select} isOnDocumentPage={false} />);

  for (const tool of aiToolList) expect(screen.getByRole('button', { name: tool.name })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: aiToolList[0].name }));
  expect(select).toHaveBeenCalledWith(aiToolList[0]);
});
it('filters tools without navigating away', () => {
  render(<Step1SelectTool onToolSelect={jest.fn()} isOnDocumentPage />);
  fireEvent.click(screen.getByRole('button', { name: 'Translation' }));
  expect(screen.getByRole('button', { name: 'Translation' })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.queryByRole('button', { name: aiToolList[0].name })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'All tools' }));
  expect(screen.getByRole('button', { name: aiToolList[0].name })).toBeInTheDocument();
});
