// components/Layout/__tests__/ProfileModal.test.tsx
import React from 'react';

import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event'; // ⬅️ новый импорт

import { SnackbarStatusEnum } from '@/models/enums';

import ProfileModal from '../ProfileModal';

/* ---------------------- mocks (без изменений) --------------------- */
const updateUserMock = jest.fn();
const setSnackbarMock = jest.fn();
const invalidateMock = jest.fn();
const updateProfileApi = jest.fn();

jest.mock('@/store/useUserStore', () => ({
  useUserStore: () => ({
    user: { id: 1, name: 'Alice', avatar: 'https://lh3.google.com/photo.jpg' },
    updateUser: updateUserMock,
  }),
}));
jest.mock('@/store/useSnackbarStore', () => () => ({
  setSnackbar: setSnackbarMock,
}));
jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: invalidateMock }),
}));
jest.mock('@/services/UserApi', () => ({
  UserApi: { updateProfile: (...a: any[]) => updateProfileApi(...a) },
}));
jest.mock('@/helpers/isGoogleAvatar', () => ({ isGoogleAvatar: () => true }));

jest.mock('@/ui/Modal', () => ({
  __esModule: true,
  default: ({ isOpen, onClose, onSubmit, children }: any) =>
    isOpen ? (
      <div data-testid='modal'>
        {children}
        <button onClick={onSubmit}>Save</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    ) : null,
}));
jest.mock('@/ui/InputField', () => ({
  __esModule: true,
  default: (props: any) => <input {...props} />,
}));

/* ------- react-hook-form stub (как и раньше) ------- */
let currentValue = 'Alice';
const resetMock = jest.fn((v) => (currentValue = v?.name ?? ''));
const registerMock = jest.fn((name: string) => ({
  name,
  value: currentValue,
  onChange: (e: any) => (currentValue = e.target.value),
}));

jest.mock('react-hook-form', () => {
  const actual = jest.requireActual('react-hook-form');

  return {
    ...actual,
    useForm: () => ({
      register: registerMock,
      handleSubmit: (cb: any) => () => cb({ name: currentValue }),
      reset: resetMock,
      formState: { errors: {} },
    }),
  };
});

/* ------------------- helpers ------------------- */
global.URL.createObjectURL = jest.fn(() => 'blob://preview') as unknown as typeof URL.createObjectURL;

const renderModal = (extra = {}) => render(<ProfileModal isOpen onClose={jest.fn()} {...extra} />);

/* --------------------- tests -------------------- */
describe('ProfileModal', () => {
  afterEach(() => jest.clearAllMocks());

  it('shows error snackbar when nothing changed', () => {
    renderModal();
    fireEvent.click(screen.getByText('Save'));

    expect(setSnackbarMock).toHaveBeenCalledWith('No changes to update', SnackbarStatusEnum.ERROR);
    expect(updateProfileApi).not.toHaveBeenCalled();
  });

  it('submits modified name, updates store & closes', async () => {
    const onClose = jest.fn();
    const updatedUser = { id: 1, name: 'Bob', avatar: 'new.png' };

    updateProfileApi.mockResolvedValue(updatedUser);

    renderModal({ onClose });

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Bob' },
    });
    await act(async () => fireEvent.click(screen.getByText('Save')));

    expect(updateProfileApi).toHaveBeenCalled();
    expect(updateUserMock).toHaveBeenCalledWith(updatedUser);
    expect(invalidateMock).toHaveBeenCalledWith({ queryKey: ['userSessions'] });
    expect(setSnackbarMock).toHaveBeenCalledWith('Profile updated successfully', SnackbarStatusEnum.SUCCESS);
    expect(onClose).toHaveBeenCalled();
  });
});
