'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Modal from '@/ui/Modal';
import InputField from '@/ui/InputField';
import { PermissionEnum } from '@/models/enums';
import { IInvitation } from '@/models/models';
import { BsThreeDots } from 'react-icons/bs';
import RequirePermission from '@/helpers/RequirePermission';
import { IoIosArrowDropdown } from 'react-icons/io';

interface InvitationFormInputs {
  email: string;
  role: PermissionEnum;
}

interface InvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  createInvitation: (invitationData: InvitationFormInputs) => void;
  invitations: IInvitation[];
  changeInvitationRole: (invitationId: number, newRole: PermissionEnum) => void;
  deleteInvitation: (invitationId: number) => void;
}

const InvitationModal: React.FC<InvitationModalProps> = ({
  isOpen,
  onClose,
  createInvitation,
  invitations,
  deleteInvitation,
  changeInvitationRole,
}) => {
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<InvitationFormInputs>({
    defaultValues: {
      email: '',
      role: PermissionEnum.READ,
    },
  });

  const onSubmit = (data: InvitationFormInputs) => {
    createInvitation(data);
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        reset();
        onClose();
      }}
      onSubmit={handleSubmit(onSubmit)}
      title='Invite a Collaborator'
      submitText='Send Invitation'
      width='w-full max-w-xl'
      cancelText='Cancel'
    >
      <InvitationForm control={control} errors={errors} />
      <InvitationList
        deleteInvitation={deleteInvitation}
        invitations={invitations}
        changeInvitationRole={changeInvitationRole}
      />
    </Modal>
  );
};

const InvitationForm: React.FC<{ control: any; errors: any }> = ({
  control,
  errors,
}) => (
  <div className='space-y-4'>
    <Controller
      name='email'
      control={control}
      rules={{
        required: 'Email is required.',
        pattern: {
          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          message: 'Invalid email address.',
        },
      }}
      render={({ field }) => (
        <InputField
          id='invite-email'
          label='Collaborator Email'
          {...field}
          type='email'
          placeholder='name@example.com'
          error={errors.email?.message}
          required
          marginBottom={20}
        />
      )}
    />
    <Controller
      name='role'
      control={control}
      render={({ field }) => (
        <div>
          <label
            htmlFor='permission-select'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Select Role
          </label>
          <div className='relative'>
            <select
              id='permission-select'
              className='p-3 w-full rounded-lg bg-white border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none pr-10'
              {...field}
            >
              {Object.values(PermissionEnum)
                .filter((el) => el !== PermissionEnum.ADMIN)
                .map((permission) => (
                  <option key={permission} value={permission}>
                    {permission.toUpperCase()}
                  </option>
                ))}
            </select>
            <div className='absolute inset-y-0 right-3 flex items-center pointer-events-none'>
              <IoIosArrowDropdown size={25} />
            </div>
          </div>
        </div>
      )}
    />
  </div>
);

const InvitationList: React.FC<{
  deleteInvitation: (invitationId: number) => void;
  invitations: IInvitation[];
  changeInvitationRole: (invitationId: number, newRole: PermissionEnum) => void;
}> = ({ invitations, changeInvitationRole, deleteInvitation }) => (
  <div className='mt-6'>
    <h3 className='text-lg font-semibold mb-3'>Existing Invitations</h3>
    <div className='flex flex-col space-y-2'>
      {invitations.length > 0 ? (
        invitations.map((invitation) => (
          <InvitationItem
            deleteInvitation={deleteInvitation}
            key={invitation.id}
            invitation={invitation}
            changeInvitationRole={changeInvitationRole}
          />
        ))
      ) : (
        <p className='text-sm text-gray-500'>No invitations found.</p>
      )}
    </div>
  </div>
);

const InvitationItem: React.FC<{
  invitation: IInvitation;
  changeInvitationRole: (invitationId: number, newRole: PermissionEnum) => void;
  deleteInvitation: (invitationId: number) => void;
}> = ({ invitation, changeInvitationRole, deleteInvitation }) => {
  const [openMenu, setOpenMenu] = useState(false);

  return (
    <div className='flex items-center justify-between bg-gray-50 border p-3 rounded-lg'>
      <div>
        <p className='font-medium'>{invitation?.receiver?.email}</p>
        <p className='text-sm text-gray-600'>Role: {invitation.role}</p>
      </div>
      <div className='relative'>
        <RequirePermission permission={PermissionEnum.ADMIN}>
          <button
            type='button'
            onClick={() => setOpenMenu((prev) => !prev)}
            className='p-2 hover:bg-gray-200 rounded-full'
          >
            <BsThreeDots size={18} />
          </button>
          {openMenu && (
            <RoleDropdown
              invitation={invitation}
              changeInvitationRole={changeInvitationRole}
              deleteInvitation={deleteInvitation}
              closeMenu={() => setOpenMenu(false)}
            />
          )}
        </RequirePermission>
      </div>
    </div>
  );
};

const RoleDropdown: React.FC<{
  invitation: IInvitation;
  changeInvitationRole: (invitationId: number, newRole: PermissionEnum) => void;
  deleteInvitation: (invitationId: number) => void;
  closeMenu: () => void;
}> = ({ invitation, changeInvitationRole, deleteInvitation, closeMenu }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        closeMenu();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeMenu]);

  return (
    <div
      ref={ref}
      className='absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-md z-10 overflow-hidden'
    >
      {invitation.role !== PermissionEnum.READ && (
        <button
          type='button'
          className='block w-full px-4 py-2 text-left hover:bg-gray-100'
          onClick={() => {
            changeInvitationRole(invitation.id, PermissionEnum.READ);
            closeMenu();
          }}
        >
          Change to READ
        </button>
      )}
      {invitation.role !== PermissionEnum.EDIT && (
        <button
          type='button'
          className='block w-full px-4 py-2 text-left hover:bg-gray-100'
          onClick={() => {
            changeInvitationRole(invitation.id, PermissionEnum.EDIT);
            closeMenu();
          }}
        >
          Change to EDIT
        </button>
      )}
      <button
        type='button'
        className='block w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100'
        onClick={() => {
          deleteInvitation(invitation.id);
          closeMenu();
        }}
      >
        Delete Invitation
      </button>
    </div>
  );
};

export default InvitationModal;
