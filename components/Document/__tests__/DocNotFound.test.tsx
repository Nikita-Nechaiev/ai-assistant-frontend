import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';

import DocNotFound from '../DocNotFound';

const replaceMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: replaceMock,
  }),
}));

describe('DocNotFound', () => {
  beforeEach(() => replaceMock.mockClear());

  it('renders message & button', () => {
    render(<DocNotFound id={123} />);

    expect(screen.getByRole('heading', { name: /document not found/i })).toBeInTheDocument();
    expect(
      screen.getByText(/the document you are trying to access does not exist or has been deleted/i),
    ).toBeInTheDocument();

    const btn = screen.getByRole('button', { name: /return to session/i });

    expect(btn).toBeInTheDocument();
  });

  it('navigates to session on click', () => {
    render(<DocNotFound id={777} />);

    fireEvent.click(screen.getByRole('button', { name: /return to session/i }));
    expect(replaceMock).toHaveBeenCalledWith('/session/777');
  });

  it('works when id is undefined', () => {
    render(<DocNotFound id={undefined} />);

    fireEvent.click(screen.getByRole('button', { name: /return to session/i }));
    expect(replaceMock).toHaveBeenCalledWith('/session/undefined');
  });
});
