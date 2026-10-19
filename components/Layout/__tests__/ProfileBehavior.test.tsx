import React from 'react';

import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { UserApi } from '@/services/UserApi';

import ProfileModal from '../ProfileModal';

jest.mock('@/services/UserApi');

let user: any = { id: 1, name: 'Alice', avatar: '/uploads/avatar.png', email: 'alice@example.com' };
const updateUser = jest.fn(),
  snackbar = jest.fn(),
  invalidateQueries = jest.fn();

jest.mock('@/store/useUserStore', () => ({ useUserStore: () => ({ user, updateUser }) }));
jest.mock('@/store/useSnackbarStore', () => ({ __esModule: true, default: () => ({ setSnackbar: snackbar }) }));
jest.mock('@tanstack/react-query', () => ({ useQueryClient: () => ({ invalidateQueries }) }));
beforeEach(() => {
  jest.clearAllMocks();
  user = { id: 1, name: 'Alice', avatar: '/uploads/avatar.png', email: 'alice@example.com' };
  URL.createObjectURL = jest.fn(() => 'blob:avatar');
});
it('validates blank names and leaves the email read-only', async () => {
  render(<ProfileModal isOpen onClose={jest.fn()} />);
  expect(screen.getByLabelText('Email address')).toHaveAttribute('readonly');
  fireEvent.change(screen.getByLabelText('Display name'), { target: { value: ' ' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  await screen.findByRole('alert');
  expect(UserApi.updateProfile).not.toHaveBeenCalled();
});
it('uploads avatar changes, revokes previews and can cancel', async () => {
  const close = jest.fn();

  (UserApi.updateProfile as jest.Mock).mockResolvedValue({ ...user, avatar: '/uploads/new.png' });

  const { unmount } = render(<ProfileModal isOpen onClose={close} />);
  const file = new File(['image'], 'new.png', { type: 'image/png' }),
    input = screen.getByLabelText('Upload profile photo');

  fireEvent.change(input, { target: { files: [] } });
  fireEvent.change(input, { target: { files: [file] } });
  fireEvent.change(input, { target: { files: [file] } });
  expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:avatar');
  expect(screen.getByAltText('Avatar preview')).toHaveAttribute('src', 'blob:avatar');
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  await waitFor(() => expect(close).toHaveBeenCalled());
  expect((UserApi.updateProfile as jest.Mock).mock.calls[0][0].get('avatar')).toBe(file);
  expect(updateUser).toHaveBeenCalled();
  unmount();
  expect(URL.revokeObjectURL).toHaveBeenCalled();
});
it('reports update errors and renders missing user information safely', async () => {
  user = null;
  (UserApi.updateProfile as jest.Mock).mockRejectedValue(Error('offline'));

  const close = jest.fn();

  render(<ProfileModal isOpen onClose={close} />);
  expect(screen.getByLabelText('Email address')).toHaveValue('');
  fireEvent.change(screen.getByLabelText('Display name'), { target: { value: 'Bob' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  await waitFor(() => expect(snackbar).toHaveBeenCalledWith('Failed to update profile', 'error'));
  expect(close).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(close).toHaveBeenCalled();
});
it('renders a name initial when there is no profile photo', () => {
  user.avatar = undefined;
  render(<ProfileModal isOpen onClose={jest.fn()} />);
  expect(screen.getByText('A')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Change profile photo' }));
  fireEvent.click(screen.getByRole('button', { name: 'Upload a photo' }));
});
