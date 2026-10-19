import React from 'react';

import { render, screen } from '@testing-library/react';

import NavigationList from '../NavigationList';

jest.mock('@/helpers/navigation', () => {
  const mockNav = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/sessions', label: 'Sessions' },
    { href: '/profile', label: 'Profile' },
  ];

  return { navigation: mockNav };
});

jest.mock('next/link', () => ({ href, children, ...props }: any) => (
  <a href={href} data-testid='link' {...props}>
    {children}
  </a>
));

let currentPath = '/dashboard';

jest.mock('next/navigation', () => ({
  usePathname: () => currentPath,
}));

const { navigation: navMock } = require('@/helpers/navigation') as {
  navigation: { href: string; label: string }[];
};

describe('NavigationList', () => {
  it('renders a link for every item in navigation helper', () => {
    render(<NavigationList />);

    const links = screen.getAllByTestId('link');

    expect(links).toHaveLength(navMock.length);

    navMock.forEach((item) => {
      expect(screen.getByRole('link', { name: item.label })).toHaveAttribute('href', item.href);
    });
  });

  it('adds the “active” class only for the current pathname', () => {
    const { rerender } = render(<NavigationList />);

    expect(screen.getByRole('link', { name: /Dashboard/ })).toHaveClass('bg-accent');
    expect(screen.getByRole('link', { name: /Sessions/ })).not.toHaveClass('bg-accent');

    currentPath = '/sessions';
    rerender(<NavigationList />);

    expect(screen.getByRole('link', { name: /Sessions/ })).toHaveClass('bg-accent');
    expect(screen.getByRole('link', { name: /Dashboard/ })).not.toHaveClass('bg-accent');
  });
});
