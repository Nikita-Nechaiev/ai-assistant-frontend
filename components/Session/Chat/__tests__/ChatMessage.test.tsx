import React from 'react';

import { render, screen } from '@testing-library/react';

import { PermissionEnum } from '@/models/enums';
import { ICollaborator } from '@/models/models';

import ChatMessage from '../ChatMessage';

jest.mock('@/components/common/UserAvatarCircle', () => ({
  __esModule: true,
  default: ({ avatar }: { avatar: string }) => <span data-testid='avatar'>{avatar}</span>,
}));

const mkSender = (idx = 1): ICollaborator => ({
  id: idx,
  name: `User${idx}`,
  email: `user${idx}@mail.com`,
  avatar: `avatar${idx}.png`,
  permissions: [PermissionEnum.READ],
});

describe('ChatMessage', () => {
  it('renders sender name, text and avatar for other user (left-aligned)', () => {
    const sender = mkSender(5);

    render(<ChatMessage sender={sender} text='Hello world' isCurrentUser={false} />);

    expect(screen.getByText('Hello world')).toBeInTheDocument();
    expect(screen.getByText(sender.name)).toBeInTheDocument();

    expect(screen.getByTestId('avatar').textContent).toBe(sender.avatar);

    const bubble = screen.getByText('Hello world').closest('div')!.parentElement!;
    const wrapper = bubble.parentElement!;

    expect(wrapper).toHaveClass('justify-start');
  });

  it('renders current-user bubble right-aligned, blue theme, avatar after bubble', () => {
    const sender = mkSender(9);

    render(<ChatMessage sender={sender} text='My message' isCurrentUser />);

    const bubble = screen.getByText('My message').parentElement!;

    expect(bubble).toHaveClass('bg-blue-100');

    const wrapper = bubble.parentElement!;

    expect(wrapper).toHaveClass('justify-end');

    const avatar = screen.getByTestId('avatar');

    expect(wrapper.lastChild).toBe(avatar);
  });
});
