'use client';

import React from 'react';

import { FiTrash2 } from 'react-icons/fi';

import WorkspaceModal from '@/components/common/WorkspaceModal';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onCancel: () => void;
  description: string;
  submitText: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onCancel,
  description,
  submitText,
}) => (
  <WorkspaceModal
    isOpen={isOpen}
    onClose={onClose}
    onSubmit={onSubmit}
    onCancel={onCancel}
    title='Confirm deletion'
    icon={<FiTrash2 size={21} aria-hidden='true' />}
    submitText={submitText}
    destructive
    className='max-w-[460px]'
  >
    <p className='text-base leading-6 text-muted-foreground'>{description}</p>
  </WorkspaceModal>
);

export default ConfirmationModal;
