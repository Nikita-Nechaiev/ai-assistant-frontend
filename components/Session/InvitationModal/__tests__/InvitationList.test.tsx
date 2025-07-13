/**
 * @jest-environment jsdom
 */
import React from 'react';

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { PermissionEnum } from '@/models/enums';
import { IInvitation } from '@/models/models';

import InvitationList from '../InvitationList';

/* ───────────────────────────────────────────
 * 1 – mock the nested InvitationItem
 * ───────────────────────────────────────── */
const itemProps: any[] = [];

jest.mock('../InvitationItem', () => ({
  __esModule: true,
  default: (props: any) => {
    itemProps.push(props); // capture props for later assertions

    return <div data-testid='inv-item'>{props.invitation.id}</div>;
  },
}));

/* ───────────────────────────────────────────
 * 2 – helpers to build fake invitations
 * ───────────────────────────────────────── */
const mkInvitation = (id: number, role = PermissionEnum.READ): IInvitation =>
  ({
    id,
    role,
    inviterEmail: `alice${id}@mail.com`,
    session: { id: 1, name: 'Session' },
    date: '',
    expiresAt: '',
    notificationStatus: 'unread',
    invitationStatus: 'pending',
    receiver: { id: 4, email: 'bob@mail.com', name: 'Bob' },
  }) as unknown as IInvitation;

/* ───────────────────────────────────────────
 * 3 – tests
 * ───────────────────────────────────────── */
describe('InvitationList', () => {
  afterEach(() => {
    jest.clearAllMocks();
    itemProps.length = 0;
  });

  it('shows placeholder when list empty', () => {
    render(<InvitationList invitations={[]} deleteInvitation={jest.fn()} changeInvitationRole={jest.fn()} />);

    expect(screen.getByText(/no invitations found/i)).toBeInTheDocument();
    expect(screen.queryByTestId('inv-item')).not.toBeInTheDocument();
  });

  it('renders one InvitationItem per invitation and forwards callbacks', () => {
    const deleteSpy = jest.fn();
    const changeSpy = jest.fn();
    const invitations = [mkInvitation(10), mkInvitation(20, PermissionEnum.EDIT)];

    render(<InvitationList invitations={invitations} deleteInvitation={deleteSpy} changeInvitationRole={changeSpy} />);

    // correct amount rendered
    expect(screen.getAllByTestId('inv-item')).toHaveLength(invitations.length);

    // every child received the right props
    itemProps.forEach((p: any, idx: number) => {
      expect(p.invitation).toBe(invitations[idx]);
      expect(p.deleteInvitation).toBe(deleteSpy);
      expect(p.changeInvitationRole).toBe(changeSpy);
    });
  });
});
