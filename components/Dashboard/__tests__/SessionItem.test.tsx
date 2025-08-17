import React from 'react';

import { render, screen } from '@testing-library/react';

import { ISessionItem, ICollaborator } from '@/models/models';

import SessionItem from '../SessionItem';

jest.mock('next/link', () => ({ href, children }: any) => (
  <a href={href} data-testid='link'>
    {children}
  </a>
));
jest.mock('@/ui/TruncateText', () => ({
  __esModule: true,
  default: ({ text }: any) => <span data-testid='truncated'>{text}</span>,
}));
jest.mock('../../common/UserAvatarCircle', () => ({
  __esModule: true,
  default: ({ email }: any) => <span data-testid='avatar'>{email}</span>,
}));

const mkSession = (id: number, collaborators: number, lastInteracted: Date, createdAt: Date): ISessionItem => ({
  id,
  name: `Super Session ${id}`,
  collaborators: Array.from(
    { length: collaborators },
    (_, i) =>
      ({
        id: i,
        name: `User${i}`,
        email: `user${i}@mail.com`,
        avatar: `avatar${i}.png`,
      }) as ICollaborator,
  ),
  lastInteracted,
  createdAt,
});

const dateISO = new Date('2025-07-10T00:00:00Z');

describe('SessionItem', () => {
  it('renders main info, link and avatars (≤4)', () => {
    const item = mkSession(42, 3, dateISO, dateISO);

    render(<SessionItem session={item} index={0} />);

    expect(screen.getByTestId('link')).toHaveAttribute('href', '/session/42');
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByTestId('truncated')).toHaveTextContent(item.name);

    expect(screen.getAllByTestId('avatar')).toHaveLength(3);
    expect(screen.queryByText(/^\+\d+$/)).toBeNull();
  });

  it('renders extra-count bubble when collaborators > 4', () => {
    const item = mkSession(55, 6, dateISO, dateISO);

    render(<SessionItem session={item} index={4} />);

    expect(screen.getAllByTestId('avatar')).toHaveLength(4);
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('shows formatted last-interacted date', () => {
    const item = mkSession(77, 2, dateISO, dateISO);

    render(<SessionItem session={item} index={2} />);

    const formatted = dateISO.toLocaleDateString();

    expect(screen.getByText(new RegExp(`Last Interacted: ${formatted}`))).toBeInTheDocument();
  });
});
