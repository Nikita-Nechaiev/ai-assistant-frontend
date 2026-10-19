import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';

import SessionItem from '../SessionItem';

const session = (n = 3): any => ({
  id: 1,
  name: 'Project',
  lastInteracted: '2026-10-17T12:00:00Z',
  collaborators: Array.from({ length: n }, (_, id) => ({ id, name: `User ${id}`, avatar: `/uploads/${id}.png` })),
});

it('links to the session, displays collaborator photos and a readable date', () => {
  render(<SessionItem session={session()} />);
  expect(screen.getByRole('link')).toHaveAttribute('href', '/session/1');
  expect(screen.getByText('Project')).toBeInTheDocument();
  expect(screen.getAllByRole('img')).toHaveLength(3);
  expect(screen.getByText('17 Oct 2026')).toBeInTheDocument();
});
it('limits avatars to three, shows extra count and falls back to initials on image failure', () => {
  render(<SessionItem session={session(6)} />);
  expect(screen.getByText('+3')).toBeInTheDocument();
  fireEvent.error(screen.getAllByRole('img')[0]);
  expect(screen.getByLabelText('User 0')).toBeInTheDocument();
});
it('handles missing photos, unknown names and missing or invalid dates', () => {
  const value = session(1);

  value.collaborators[0] = { id: 1, name: '', avatar: '' };
  value.lastInteracted = null;

  const { rerender } = render(<SessionItem session={value} />);

  expect(screen.getByText('?')).toBeInTheDocument();
  expect(screen.getByText('1 member')).toBeInTheDocument();
  expect(screen.getByText('No activity yet')).toBeInTheDocument();
  rerender(<SessionItem session={{ ...value, lastInteracted: 'bad' }} />);
  expect(screen.getByText('No activity yet')).toBeInTheDocument();
});
