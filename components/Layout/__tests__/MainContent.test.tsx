import React from 'react';

import { render, screen } from '@testing-library/react';

import MainContent from '../MainContent';

describe('MainContent', () => {
  it('wraps children and applies layout classes', () => {
    render(
      <MainContent>
        <p>inside-content</p>
      </MainContent>,
    );

    const main = screen.getByRole('main');

    expect(screen.getByText('inside-content')).toBeInTheDocument();

    expect(main).toHaveClass('flex-1', 'pl-[40px]', 'pt-[100px]', 'overflow-auto', 'bg-white');
  });
});
