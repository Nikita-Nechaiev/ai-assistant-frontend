import React from 'react';

import '@testing-library/jest-dom';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';

import { PermissionEnum } from '@/models/enums';
import { IInvitation } from '@/models/models';

import RoleDropdown from '../RoleDropdown';

const mkInvitation = (role: PermissionEnum): IInvitation => ({ id: 77, role }) as unknown as IInvitation;

const renderMenu = (invitation = mkInvitation(PermissionEnum.READ)) => {
  const changeInvitationRole = jest.fn();
  const deleteInvitation = jest.fn();
  const closeMenu = jest.fn();

  const utils = render(
    <div data-testid='outside'>
      <RoleDropdown
        invitation={invitation}
        changeInvitationRole={changeInvitationRole}
        deleteInvitation={deleteInvitation}
        closeMenu={closeMenu}
      />
    </div>,
  );

  return { ...utils, changeInvitationRole, deleteInvitation, closeMenu };
};

afterEach(() => {
  jest.clearAllMocks();
  cleanup();
});

describe('RoleDropdown', () => {
  it('shows correct actions depending on current role', () => {
    const { unmount } = renderMenu(mkInvitation(PermissionEnum.READ));

    expect(screen.queryByText(/change to read/i)).not.toBeInTheDocument();
    expect(screen.getByText(/change to edit/i)).toBeInTheDocument();

    unmount();

    renderMenu(mkInvitation(PermissionEnum.EDIT));

    expect(screen.getByText(/change to read/i)).toBeInTheDocument();
    expect(screen.queryByText(/change to edit/i)).not.toBeInTheDocument();
  });

  it('fires changeInvitationRole and closes menu', () => {
    const { changeInvitationRole, closeMenu } = renderMenu(mkInvitation(PermissionEnum.READ));

    fireEvent.click(screen.getByText(/change to edit/i));

    expect(changeInvitationRole).toHaveBeenCalledWith(77, PermissionEnum.EDIT);
    expect(closeMenu).toHaveBeenCalled();
  });

  it('fires deleteInvitation and closes menu', () => {
    const { deleteInvitation, closeMenu } = renderMenu();

    fireEvent.click(screen.getByText(/delete invitation/i));

    expect(deleteInvitation).toHaveBeenCalledWith(77);
    expect(closeMenu).toHaveBeenCalled();
  });

  it('closes when clicking outside the menu', () => {
    const { closeMenu } = renderMenu();

    fireEvent.mouseDown(screen.getByTestId('outside'));

    expect(closeMenu).toHaveBeenCalled();
  });
});
