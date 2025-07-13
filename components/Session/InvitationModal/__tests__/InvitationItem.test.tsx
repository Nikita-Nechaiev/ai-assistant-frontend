/**
 * @jest-environment jsdom
 */
import React from 'react';

import '@testing-library/jest-dom';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';

import { PermissionEnum } from '@/models/enums';
import { IInvitation } from '@/models/models';

import InvitationItem from '../InvitationItem';

/* ──────────────────────────────────────────────────────────
 * 1 – mocks for nested / permission components
 * ───────────────────────────────────────────────────────── */
const dropdownProps: any[] = [];

jest.mock('../RoleDropdown', () => ({
  __esModule: true,
  default: (props: any) => {
    dropdownProps.push(props);

    return <div data-testid='dropdown'>ROLE&nbsp;MENU</div>;
  },
}));

// bypass permission check
jest.mock('@/helpers/RequirePermission', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

/* ──────────────────────────────────────────────────────────
 * 2 – helpers
 * ───────────────────────────────────────────────────────── */
const mkInvitation = (id: number, role: PermissionEnum): IInvitation =>
  ({
    id,
    role,
    receiver: { email: `user${id}@mail.com`, id: 9, name: 'User' },
  }) as unknown as IInvitation;

/* ──────────────────────────────────────────────────────────
 * 3 – tests
 * ───────────────────────────────────────────────────────── */
describe('InvitationItem', () => {
  const changeSpy = jest.fn();
  const deleteSpy = jest.fn();

  const renderItem = (inv = mkInvitation(1, PermissionEnum.READ)) =>
    render(<InvitationItem invitation={inv} changeInvitationRole={changeSpy} deleteInvitation={deleteSpy} />);

  afterEach(() => {
    jest.clearAllMocks();
    dropdownProps.length = 0;
  });

  it('renders receiver email and current role', () => {
    const inv = mkInvitation(7, PermissionEnum.EDIT);

    renderItem(inv);

    expect(screen.getByText(inv.receiver.email)).toBeInTheDocument();
    expect(screen.getByText(/role: edit/i)).toBeInTheDocument();
  });

  it('toggles RoleDropdown on ellipsis click and passes correct props', async () => {
    const inv = mkInvitation(3, PermissionEnum.READ);

    renderItem(inv);

    // initially closed
    expect(screen.queryByTestId('dropdown')).not.toBeInTheDocument();

    // open
    fireEvent.click(screen.getByRole('button'));

    const menu = screen.getByTestId('dropdown');

    expect(menu).toBeInTheDocument();

    // correct props forwarded
    expect(dropdownProps[0].invitation).toBe(inv);
    expect(dropdownProps[0].changeInvitationRole).toBe(changeSpy);
    expect(dropdownProps[0].deleteInvitation).toBe(deleteSpy);

    // call closeMenu & wait for disappearance
    await act(async () => dropdownProps[0].closeMenu());
    await waitFor(() => {
      expect(screen.queryByTestId('dropdown')).not.toBeInTheDocument();
    });
  });
});
