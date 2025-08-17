import React from 'react';

import { render, screen } from '@testing-library/react';

import Sidebar from '../Sidebar';

jest.mock('@/components/common/AppLogo', () => ({
  __esModule: true,
  default: () => <div data-testid='app-logo'>logo</div>,
}));

jest.mock('../NavigationList', () => ({
  __esModule: true,
  default: () => <nav data-testid='navigation'>nav-list</nav>,
}));

jest.mock('@/components/common/LogoutButton', () => ({
  __esModule: true,
  default: () => <button data-testid='logout'>logout</button>,
}));

describe('Sidebar', () => {
  it('renders AppLogo, NavigationList and LogoutButton in order', () => {
    render(<Sidebar />);

    const logo = screen.getByTestId('app-logo');

    expect(logo).toBeInTheDocument();

    const nav = screen.getByTestId('navigation');

    expect(nav).toBeInTheDocument();
    expect(logo.compareDocumentPosition(nav) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    const logout = screen.getByTestId('logout');

    expect(logout).toBeInTheDocument();
    expect(nav.compareDocumentPosition(logout) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('applies sidebar container styles', () => {
    const { container } = render(<Sidebar />);
    const aside = container.querySelector('aside');

    expect(aside).toHaveClass('w-64', 'p-2', 'bg-gray-900', 'text-mainLight', 'flex', 'flex-col', 'fixed', 'h-full');
  });
});
