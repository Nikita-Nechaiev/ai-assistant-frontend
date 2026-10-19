import React from 'react';

import { render, screen } from '@testing-library/react';

import LargeLoader from '../LargeLoader';

it('announces that the workspace is loading', () => {
  render(<LargeLoader />);
  expect(screen.getByRole('status')).toHaveTextContent('Preparing your workspace');
  expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
});
