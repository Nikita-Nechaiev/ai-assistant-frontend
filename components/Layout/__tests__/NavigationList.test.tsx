import React from 'react';

import { render, screen } from '@testing-library/react';

import NavigationList from '../NavigationList';

/* ------------------------------------------------------------------ */
/* 1 — mock helpers/navigation                                        */
/* ------------------------------------------------------------------ */
jest.mock('@/helpers/navigation', () => {
  const mockNav = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/sessions', label: 'Sessions' },
    { href: '/profile', label: 'Profile' },
  ];

  return { navigation: mockNav };
});

/* ------------------------------------------------------------------ */
/* 2 — other external mocks                                           */
/* ------------------------------------------------------------------ */
// simple <a> instead of next/link that keeps ALL props (incl. className)
jest.mock('next/link', () => ({ href, children, ...props }: any) => (
  <a href={href} data-testid='link' {...props}>
    {children}
  </a>
));

let currentPath = '/dashboard';

jest.mock('next/navigation', () => ({
  usePathname: () => currentPath,
}));

/* ------------------------------------------------------------------ */
const { navigation: navMock } = require('@/helpers/navigation') as {
  navigation: { href: string; label: string }[];
};
/* ------------------------------------------------------------------ */

describe('NavigationList', () => {
  it('renders a link for every item in navigation helper', () => {
    render(<NavigationList />);

    const links = screen.getAllByTestId('link');

    expect(links).toHaveLength(navMock.length);

    navMock.forEach((item) => {
      expect(screen.getByText(item.label)).toHaveAttribute('href', item.href);
    });
  });

  it('adds the “active” class only for the current pathname', () => {
    const { rerender } = render(<NavigationList />);

    // initially /dashboard is active
    expect(screen.getByText('Dashboard')).toHaveClass('bg-gray-700');
    expect(screen.getByText('Sessions')).not.toHaveClass('bg-gray-700');

    // switch current path -> /sessions
    currentPath = '/sessions';
    rerender(<NavigationList />);

    expect(screen.getByText('Sessions')).toHaveClass('bg-gray-700');
    expect(screen.getByText('Dashboard')).not.toHaveClass('bg-gray-700');
  });
});
