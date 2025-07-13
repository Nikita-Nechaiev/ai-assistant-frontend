import React from 'react';

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';

import LogoutButton from '../LogoutButton';

/* ------------------------------------------------------------------ */
/*                       Mock external dependencies                    */
/* ------------------------------------------------------------------ */

// 1) axios.post → подменяем
jest.mock('axios');

const mockedPost = axios.post as jest.Mock;

// 2) next/navigation router
const replaceMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

// 3) Zustand user-store
const clearUserMock = jest.fn();

jest.mock('@/store/useUserStore', () => ({
  useUserStore: (sel: any) => sel({ clearUser: clearUserMock }),
}));

/* ------------------------------------------------------------------ */
/*                               Tests                                */
/* ------------------------------------------------------------------ */
describe('LogoutButton', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calls API, clears user and redirects on successful logout', async () => {
    mockedPost.mockResolvedValue({ status: 200 }); // успех

    render(<LogoutButton />);

    fireEvent.click(screen.getByRole('button', { name: /logout/i }));

    await waitFor(() => {
      expect(mockedPost).toHaveBeenCalledWith(expect.stringContaining('/auth/logout'), {}, { withCredentials: true });
    });

    expect(clearUserMock).toHaveBeenCalledTimes(1);
    expect(replaceMock).toHaveBeenCalledWith('/login');
  });

  it('handles API error: does NOT clear user or redirect', async () => {
    mockedPost.mockRejectedValue(new Error('network fail'));

    render(<LogoutButton />);
    fireEvent.click(screen.getByRole('button', { name: /logout/i }));

    await waitFor(() => expect(mockedPost).toHaveBeenCalled());

    expect(clearUserMock).not.toHaveBeenCalled();
    expect(replaceMock).not.toHaveBeenCalled();
  });
});
