import React from 'react';

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import axios from 'axios';

import Login from '../login/page';
import Forgot from '../forgot-password/page';
import Register from '../registration/page';
import Reset from '../reset-password/[token]/page';

jest.mock('axios', () => ({
  __esModule: true,
  default: { post: jest.fn(), isAxiosError: (e: any) => !!e?.isAxiosError },
}));

const push = jest.fn(),
  replace = jest.fn(),
  snackbar = jest.fn(),
  setUser = jest.fn();

jest.mock('next/navigation', () => ({ useRouter: () => ({ push, replace }) }));
jest.mock('@/store/useUserStore', () => ({ useUserStore: () => ({ setUser }) }));
jest.mock('@/store/useSnackbarStore', () => ({ __esModule: true, default: () => ({ setSnackbar: snackbar }) }));

const post = axios.post as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  post.mockResolvedValue({ data: { user: { id: 1 } } });
});

const fill = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const submit = () => fireEvent.submit(document.querySelector('form')!);
const credentials = () => {
  fill('Email address', 'alice@example.com');
  fill('Password', 'Password1');
};

it('validates login fields, signs in and stores the returned user', async () => {
  render(<Login />);
  submit();
  await screen.findByText('Email is required');
  expect(post).not.toHaveBeenCalled();
  credentials();
  submit();
  await waitFor(() => expect(replace).toHaveBeenCalledWith('/dashboard'));
  expect(setUser).toHaveBeenCalledWith({ id: 1 });
  expect(post).toHaveBeenCalledWith(
    expect.stringContaining('/auth/login'),
    { email: 'alice@example.com', password: 'Password1' },
    expect.objectContaining({ withCredentials: true }),
  );
});
it.each([
  [true, 'Invalid email or password!'],
  [false, 'An unexpected error occurred'],
])('handles login rejection (%s)', async (isAxiosError, message) => {
  post.mockRejectedValue({ isAxiosError });
  render(<Login />);
  credentials();
  submit();
  await waitFor(() => expect(snackbar).toHaveBeenCalledWith(message, 'error'));
  expect(screen.getByRole('button', { name: 'Sign in' })).toBeEnabled();
});
it('requests a password reset for the supplied email', async () => {
  render(<Forgot />);
  fill('Email address', 'alice@example.com');
  submit();
  await waitFor(() => expect(snackbar).toHaveBeenCalledWith('Password reset link sent to your email.', 'success'));
  expect(post).toHaveBeenCalledWith(expect.stringContaining('/auth/forgot-password'), { email: 'alice@example.com' });
});
it.each([
  [{ isAxiosError: true, response: { data: { message: 'Try later' } } }, 'Try later'],
  [{ isAxiosError: true }, 'Failed to send password reset link'],
  [Error('network'), 'An unexpected error occurred'],
])('handles reset-email failures %#', async (error, message) => {
  post.mockRejectedValue(error);
  render(<Forgot />);
  fill('Email address', 'alice@example.com');
  submit();
  await waitFor(() => expect(snackbar).toHaveBeenCalledWith(message, 'error'));
});

const registration = () => {
  fill('Full name', 'Alice');
  credentials();
  fill('Confirm password', 'Password1');
};

it('validates mismatched registration passwords and creates a multipart account with optional avatar', async () => {
  render(<Register />);
  registration();
  fill('Confirm password', 'different');
  submit();
  await screen.findByText('Passwords do not match');
  expect(post).not.toHaveBeenCalled();
  fill('Confirm password', 'Password1');

  const file = new File(['photo'], 'avatar.png', { type: 'image/png' });

  URL.createObjectURL = jest.fn(() => 'blob:avatar');
  fireEvent.change(screen.getByLabelText('Upload profile photo'), { target: { files: [file] } });
  submit();
  await waitFor(() => expect(push).toHaveBeenCalledWith('/dashboard'));

  const body = post.mock.calls[0][1] as FormData;

  expect(body.get('name')).toBe('Alice');
  expect(body.get('avatar')).toBe(file);
  expect(setUser).toHaveBeenCalledWith({ id: 1 });
});
it.each([
  [{ isAxiosError: true, response: { status: 409 } }, 'User with this email already exists!'],
  [{ isAxiosError: true, response: { status: 500 } }, 'Registration error'],
  [Error('network'), 'Registration error'],
])('handles registration failure %#', async (error, message) => {
  post.mockRejectedValue(error);
  render(<Register />);
  registration();
  submit();
  await waitFor(() => expect(snackbar).toHaveBeenCalledWith(message, 'error'));
});
it('resets a password using the resolved route token', async () => {
  render(<Reset params={Promise.resolve({ token: 'reset-token' })} />);
  await act(async () => {});
  fill('New password', 'Password1');
  fill('Confirm new password', 'Password1');
  submit();
  await waitFor(() => expect(replace).toHaveBeenCalledWith('/login'));
  expect(post).toHaveBeenCalledWith(expect.stringContaining('/auth/reset-password/reset-token'), {
    password: 'Password1',
  });
});
it.each([
  [true, 'Failed to reset password'],
  [false, 'An unexpected error occurred'],
])('handles password reset rejection (%s)', async (isAxiosError, message) => {
  post.mockRejectedValue({ isAxiosError });
  render(<Reset params={Promise.resolve({ token: 'token' })} />);
  await act(async () => {});
  fill('New password', 'Password1');
  fill('Confirm new password', 'Password1');
  submit();
  await waitFor(() => expect(snackbar).toHaveBeenCalledWith(message, 'error'));
});
it('does not send a request without a reset token', async () => {
  render(<Reset params={new Promise(() => {})} />);
  await act(async () => {});
  fill('New password', 'Password1');
  fill('Confirm new password', 'Password1');
  submit();
  await waitFor(() => expect(snackbar).toHaveBeenCalledWith('Invalid token.', 'error'));
  expect(post).not.toHaveBeenCalled();
});
