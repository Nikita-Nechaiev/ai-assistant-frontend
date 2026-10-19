'use client';

import React, { useCallback, useEffect } from 'react';

import { useForm } from 'react-hook-form';
import { Socket } from 'socket.io-client';
import { FiUserPlus, FiShield } from 'react-icons/fi';

import WorkspaceModal from '@/components/common/WorkspaceModal';
import { PermissionEnum, SnackbarStatusEnum } from '@/models/enums';
import useSnackbarStore from '@/store/useSnackbarStore';
import { useInvitationModalSocket } from '@/hooks/sockets/useInvitationModalSocket';

import InvitationForm, { InvitationFormInputs } from './InvitationForm';
import InvitationList from './InvitationList';

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
    formState: { errors, isSubmitting },
  } = useForm<InvitationFormInputs>({ defaultValues: { email: '', role: PermissionEnum.READ } });
  const handleError = useCallback((message: string) => setSnackbar(message, SnackbarStatusEnum.ERROR), [setSnackbar]);
  const { invitations, createInvitation, changeInvitationRole, deleteInvitation, fetchNotifications } =
    useInvitationModalSocket(socket, handleError);

  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen, fetchNotifications]);

  const close = () => {
    reset();
    onClose();
  };
  const onSubmit = async (form: InvitationFormInputs) => {
    try {
      await createInvitation({ ...form, email: form.email.trim() });
      await fetchNotifications();
      setSnackbar(`Invitation has been sent to ${form.email}`, SnackbarStatusEnum.SUCCESS);
      close();
    } catch (error) {
      setSnackbar(error instanceof Error ? error.message : 'Failed to send invitation', SnackbarStatusEnum.ERROR);
    }
  };

  return (
    <WorkspaceModal
      isOpen={isOpen}
      onClose={close}
      onCancel={close}
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      pendingText='Sending…'
      title='Better work starts together.'
      description='Invite a collaborator to your session and choose what they can do.'
      icon={<FiUserPlus size={21} aria-hidden='true' />}
      submitText='Send invitation'
      className='max-w-[560px]'
    >
      <InvitationForm control={control} errors={errors} />
      <div className='mt-4 flex items-center gap-2.5 rounded-lg bg-accent/60 px-3.5 py-2.5 text-sm leading-5 text-muted-foreground'>
        <FiShield size={15} className='shrink-0 text-primary' aria-hidden='true' />
        <p>You stay in control. Manage collaborator access and invitations in this session.</p>
      </div>
      <InvitationList
        invitations={invitations}
        deleteInvitation={deleteInvitation}
        changeInvitationRole={changeInvitationRole}
      />
    </WorkspaceModal>
  );
};

export default InvitationModal;
