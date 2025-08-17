import React from 'react';

import { render, screen } from '@testing-library/react';

import AppLogo from '../AppLogo';

jest.mock('next/link', () => ({ href, children }: any) => (
  <a href={href} data-testid='mock-link'>
    {children}
  </a>
));

describe('AppLogo', () => {
  it('renders inside <Link> by default', () => {
    render(<AppLogo />);

    const link = screen.getByTestId('mock-link');

    expect(link).toHaveAttribute('href', '/dashboard');

    expect(screen.getByAltText('AI Powered Editor')).toBeInTheDocument();
    expect(screen.getByText('AI Powered Editor')).toBeInTheDocument();
  });

  it('renders plain content when isLink = false', () => {
    render(<AppLogo isLink={false} />);

    expect(screen.queryByTestId('mock-link')).toBeNull();

    expect(screen.getByAltText('AI Powered Editor')).toBeInTheDocument();
    expect(screen.getByText('AI Powered Editor')).toBeInTheDocument();
  });
});
