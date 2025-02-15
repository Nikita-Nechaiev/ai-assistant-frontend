'use client';

import React from 'react';
import Modal from '@/ui/Modal';

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
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onCancel={onCancel}
      onSubmit={onSubmit}
      title={"Confirm your action"}
      submitText={submitText}
      cancelText='Cancel'
      width='w-[30vw]'
    >
      <p className='text-mainDark text-lg font-semibold mb-6 text-center'>
        {description}
      </p>
    </Modal>
  );
};

export default ConfirmationModal;
