import React from 'react';

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';

import LogoutButton from '../LogoutButton';

jest.mock('axios');

const mockedPost = axios.post as jest.Mock;

const replaceMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

const clearUserMock = jest.fn();

jest.mock('@/store/useUserStore', () => ({
  useUserStore: (sel: any) => sel({ clearUser: clearUserMock }),
}));

describe('LogoutButton', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calls API, clears user and redirects on successful logout', async () => {
    mockedPost.mockResolvedValue({ status: 200 });

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
