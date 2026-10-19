import React from 'react';

import { render, screen } from '@testing-library/react';

import ChatMessage from '../ChatMessage';

jest.mock('@/components/common/UserAvatarCircle', () => ({
  __esModule: true,
  default: ({ name }: any) => <img alt={name} />,
}));

const sender: any = { name: 'Alice', avatar: 'avatar.png' };

it('shows another collaborator and a valid timestamp', () => {
  render(<ChatMessage sender={sender} text='Hello' isCurrentUser={false} createdAt='2026-10-17T12:00:00Z' />);
  expect(screen.getByText('Alice')).toBeInTheDocument();
  expect(screen.getByText('Hello')).toBeInTheDocument();
  expect(document.querySelector('time')).toHaveAttribute('datetime', '2026-10-17T12:00:00.000Z');
});
it('labels the current sender as You and ignores invalid timestamps', () => {
  render(<ChatMessage sender={sender} text='My message' isCurrentUser createdAt='invalid' />);
  expect(screen.getByText('You')).toBeInTheDocument();
  expect(screen.getByText('My message')).toHaveClass('bg-primary');
  expect(document.querySelector('time')).toBeNull();
});
