import React from 'react';

import '@testing-library/jest-dom';
import { render, screen, fireEvent, act } from '@testing-library/react';

import { PermissionEnum, SnackbarStatusEnum } from '@/models/enums';

import InvitationModal from '../InvitationModal';

const fetchNotifications = jest.fn();
const createInvitation = jest.fn();
const changeRoleSpy = jest.fn();
const deleteInvSpy = jest.fn();

let capturedErrorCb: (msg: string) => void = () => {};

jest.mock('@/hooks/sockets/useInvitationModalSocket', () => ({
  useInvitationModalSocket: (_socket: any, errCb: (m: string) => void) => {
    capturedErrorCb = errCb;

    return {
      invitations: [],
      fetchNotifications,
      createInvitation,
      changeInvitationRole: changeRoleSpy,
      deleteInvitation: deleteInvSpy,
    };
  },
}));

const setSnackbar = jest.fn();

jest.mock('@/store/useSnackbarStore', () => () => ({ setSnackbar }));

jest.mock('@/ui/Modal', () => ({
  __esModule: true,
  default: ({ isOpen, onClose, onSubmit, children, title }: any) =>
    isOpen ? (
      <div data-testid='modal'>
        <h2>{title}</h2>
        {children}
        <button onClick={onSubmit}>Send Invitation</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    ) : null,
}));

let formState = { email: '', role: PermissionEnum.READ };

jest.mock('../InvitationForm', () => ({
  __esModule: true,
  default: () => (
    <div>
      <input data-testid='email' placeholder='email' onChange={(e) => (formState.email = e.target.value)} />
      <select data-testid='role' onChange={(e) => (formState.role = e.target.value as unknown as PermissionEnum)}>
        <option value={PermissionEnum.READ}>READ</option>
        <option value={PermissionEnum.EDIT}>EDIT</option>
      </select>
    </div>
  ),
}));

const listProps: any[] = [];

jest.mock('../InvitationList', () => ({
  __esModule: true,
  default: (props: any) => {
    listProps.push(props);

    return <div data-testid='inv-list' />;
  },
}));

jest.mock('react-hook-form', () => {
  const actual = jest.requireActual('react-hook-form');

  return {
    ...actual,
    useForm: () => ({
      control: {},
      handleSubmit: (cb: any) => () => cb({ ...formState }),
      reset: () => {
        formState = { email: '', role: PermissionEnum.READ };
      },
      formState: { errors: {} },
    }),
  };
});

const renderModal = (extra = {}) =>
  render(<InvitationModal isOpen socket={{} as any} onClose={jest.fn()} {...extra} />);

describe('InvitationModal', () => {
  afterEach(() => {
    jest.clearAllMocks();
    formState = { email: '', role: PermissionEnum.READ };
    listProps.length = 0;
  });

  it('fetches notifications when opened', () => {
    renderModal();
    expect(fetchNotifications).toHaveBeenCalled();
  });

  it('submits form → createInvitation, then closes', async () => {
    const onClose = jest.fn();

    renderModal({ onClose });

    fireEvent.change(screen.getByTestId('email'), {
      target: { value: 'bob@mail.com' },
    });
    fireEvent.change(screen.getByTestId('role'), {
      target: { value: PermissionEnum.EDIT },
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Send Invitation'));
    });

    expect(createInvitation).toHaveBeenCalledWith({
      email: 'bob@mail.com',
      role: PermissionEnum.EDIT,
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('passes delete / changeRole callbacks to InvitationList', () => {
    renderModal();

    const props = listProps[0];

    expect(props.deleteInvitation).toBe(deleteInvSpy);
    expect(props.changeInvitationRole).toBe(changeRoleSpy);
  });

  it('shows snackbar when error callback is invoked', () => {
    capturedErrorCb('E-mail invalid');
    expect(setSnackbar).toHaveBeenCalledWith('E-mail invalid', SnackbarStatusEnum.ERROR);
  });
});
