import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';

import { PermissionEnum } from '@/models/enums';

import UserAvatarCircle from '../UserAvatarCircle';

const isGoogleAvatarMock = jest.fn();

jest.mock('@/helpers/isGoogleAvatar', () => ({
  isGoogleAvatar: (...args: any) => isGoogleAvatarMock(...args),
}));

jest.mock('@/helpers/RequirePermission', () => ({
  __esModule: true,
  default: ({ children }: any) => <>{children}</>,
}));

const currentUser = { id: 99 };

jest.mock('@/store/useUserStore', () => ({
  useUserStore: () => ({ user: currentUser }),
}));

describe('UserAvatarCircle', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('builds correct img src depending on isGoogleAvatar', () => {
    isGoogleAvatarMock.mockReturnValueOnce(true);

    const url = 'https://lh3.googleusercontent.com/photo.jpg';

    const { rerender } = render(<UserAvatarCircle avatar={url} />);

    expect(screen.getByRole('img')).toHaveAttribute('src', url);

    isGoogleAvatarMock.mockReturnValueOnce(false);

    const apiPath = '/uploads/avatar.png';

    rerender(<UserAvatarCircle avatar={apiPath} />);
    expect(screen.getByRole('img')).toHaveAttribute('src', `${process.env.NEXT_PUBLIC_API_URL}${apiPath}`);
  });

  it('toggles tooltip on avatar click and closes on outside click', () => {
    isGoogleAvatarMock.mockReturnValue(true);

    render(
      <UserAvatarCircle
        userId={1}
        name='John Doe'
        email='john@mail.com'
        avatar='url'
        currentPermission={PermissionEnum.READ}
      />,
    );

    expect(screen.queryByText('John Doe')).toBeNull();

    fireEvent.click(screen.getByRole('img'));
    expect(screen.getByText('John Doe')).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByText('John Doe')).toBeNull();
  });

  it('renders and triggers “Change role” button', () => {
    const changePerm = jest.fn();

    render(
      <UserAvatarCircle
        userId={2}
        name='Jane'
        email='jane@mail.com'
        avatar='url'
        currentPermission={PermissionEnum.READ}
        changeUserPermissions={changePerm}
      />,
    );

    fireEvent.click(screen.getByRole('img'));

    const btn = screen.getByRole('button', { name: /change to edit/i });

    expect(btn).toBeInTheDocument();

    fireEvent.click(btn);
    expect(changePerm).toHaveBeenCalledWith(2, PermissionEnum.EDIT);
  });

  it('does NOT show “Change role” when user is ADMIN', () => {
    render(
      <UserAvatarCircle
        userId={3}
        name='Admin'
        email='admin@mail.com'
        avatar='url'
        currentPermission={PermissionEnum.ADMIN}
        changeUserPermissions={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('img'));
    expect(screen.queryByText(/change to/i)).toBeNull();
  });
});
