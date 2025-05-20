'use client';

import React from 'react';

import { useForm } from 'react-hook-form';

import Modal from '@/ui/Modal';
import { PermissionEnum } from '@/models/enums';
import { IInvitation } from '@/models/models';

import InvitationList from './InvitationList';
import InvitationForm from './InvitationForm';

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

export default InvitationModal;
