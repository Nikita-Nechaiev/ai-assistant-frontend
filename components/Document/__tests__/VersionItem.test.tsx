import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';

import VersionItem from '../VersionItem';

const version: any = { id: 1, userEmail: 'user@mail.com', createdAt: '2026-10-17T12:00:00Z' };

it('shows author/date and marks selected and current versions independently', () => {
  const props = {
    version,
    isSelected: false,
    isCurrent: false,
    onClick: jest.fn(),
    onMouseEnter: jest.fn(),
    onMouseLeave: jest.fn(),
  };
  const { rerender } = render(<VersionItem {...props} />);

  expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
  expect(screen.getByText('user@mail.com')).toBeInTheDocument();
  expect(screen.getByText('17 October 2026')).toBeInTheDocument();
  rerender(<VersionItem {...props} isSelected isCurrent />);
  expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByText('Current')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button'));
  expect(props.onClick).toHaveBeenCalledWith(version);
  fireEvent.focus(screen.getByRole('button'));
  expect(props.onMouseEnter).toHaveBeenCalledWith(version);
  fireEvent.blur(screen.getByRole('button'));
  expect(props.onMouseLeave).toHaveBeenCalled();
});
it('handles an invalid version date and mouse previews', () => {
  const enter = jest.fn(),
    leave = jest.fn();

  render(
    <VersionItem
      version={{ ...version, createdAt: 'invalid' }}
      isSelected={false}
      isCurrent={false}
      onClick={jest.fn()}
      onMouseEnter={enter}
      onMouseLeave={leave}
    />,
  );
  expect(screen.getByText('Saved version')).toBeInTheDocument();
  fireEvent.mouseEnter(screen.getByRole('button'));
  expect(enter).toHaveBeenCalled();
  fireEvent.mouseLeave(screen.getByRole('button'));
  expect(leave).toHaveBeenCalled();
});
