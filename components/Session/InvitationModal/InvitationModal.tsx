'use client';

import React, { useEffect } from 'react';

import { useForm } from 'react-hook-form';
import { Socket } from 'socket.io-client';

import Modal from '@/ui/Modal';
import { PermissionEnum, SnackbarStatusEnum } from '@/models/enums';
import useSnackbarStore from '@/store/useSnackbarStore';
import { useInvitationModalSocket } from '@/hooks/sockets/useInvitationModalSocket';

import InvitationForm from './InvitationForm';
import InvitationList from './InvitationList';

interface FormInputs {
  email: string;
  role: PermissionEnum;
}

interface InvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  socket: Socket;
}

const InvitationModal: React.FC<InvitationModalProps> = ({ isOpen, onClose, socket }) => {
  const { setSnackbar } = useSnackbarStore();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormInputs>({
    defaultValues: { email: '', role: PermissionEnum.READ },
  });

  const { invitations, createInvitation, changeInvitationRole, deleteInvitation, fetchNotifications } =
    useInvitationModalSocket(socket, (msg) => setSnackbar(msg, SnackbarStatusEnum.ERROR));

  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen, fetchNotifications]);

  const onSubmit = async (form: FormInputs) => {
    try {
      await createInvitation(form);
      await fetchNotifications();
      setSnackbar(`Invitation has been sent to ${form.email}`, SnackbarStatusEnum.SUCCESS);
      reset();
      onClose();
    } catch (e: any) {
      setSnackbar(e?.message || 'Failed to send invitation', SnackbarStatusEnum.ERROR);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        reset();
        onClose();
      }}
      onSubmit={handleSubmit(onSubmit)}
      width='w-full max-w-xl'
      title='Invite a Collaborator'
      submitText='Send Invitation'
      cancelText='Cancel'
    >
      <InvitationForm control={control} errors={errors} />

      <InvitationList
        invitations={invitations}
        deleteInvitation={deleteInvitation}
        changeInvitationRole={changeInvitationRole}
      />
    </Modal>
  );
};

export default InvitationModal;
