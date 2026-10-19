import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';

import DocNotFound from '../DocNotFound';

const replaceMock = jest.fn();
let sessionId: string | undefined = '777';

jest.mock('next/navigation', () => ({
  useParams: () => ({ id: sessionId }),
  useRouter: () => ({
    replace: replaceMock,
  }),
}));

describe('DocNotFound', () => {
  beforeEach(() => replaceMock.mockClear());

  it('renders message & button', () => {
    render(<DocNotFound />);

    expect(screen.getByRole('heading', { name: /document not found/i })).toBeInTheDocument();
    expect(
      screen.getByText(/the document you are trying to access does not exist or has been deleted/i),
    ).toBeInTheDocument();

    const btn = screen.getByRole('button', { name: /return to session/i });

    expect(btn).toBeInTheDocument();
  });

  it('navigates to session on click', () => {
    render(<DocNotFound />);

    fireEvent.click(screen.getByRole('button', { name: /return to session/i }));
    expect(replaceMock).toHaveBeenCalledWith('/session/777');
  });

  it('works when id is undefined', () => {
    sessionId = undefined;
    render(<DocNotFound />);

    fireEvent.click(screen.getByRole('button', { name: /return to session/i }));
    expect(replaceMock).toHaveBeenCalledWith('/dashboard');
  });
});
