import React from 'react';

import { render } from '@testing-library/react';

import SmallLoader from '../SmallLoader';

describe('SmallLoader', () => {
  it('renders three bouncing dots', () => {
    const { container } = render(<SmallLoader />);

    const dots = container.querySelectorAll('div.rounded-full');

    expect(dots.length).toBe(3);

    dots.forEach((dot) => {
      expect(dot).toHaveClass('animate-pulse');
    });
  });
});
