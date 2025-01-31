'use client';

import React, { FC, ReactNode, MouseEvent, useCallback } from 'react';
import { AiOutlineClose } from 'react-icons/ai';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel?: () => void;
  onSubmit?: () => void;
  cancelText?: string;
  submitText?: string;
  width?: string; // e.g. 'w-96', 'w-[500px]', etc.
  title?: string;
  children?: ReactNode;
}

const Modal: FC<ModalProps> = ({
  isOpen,
  onClose,
  onCancel,
  onSubmit,
  cancelText = 'Cancel',
  submitText = 'Submit',
  width = 'w-96',
  title,
  children,
}) => {
  if (!isOpen) return null;

  const handleBackgroundClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'
      onClick={handleBackgroundClick}
    >
      <div className={`relative bg-white rounded-md shadow-md p-6 ${width}`}>
        <button
          onClick={onClose}
          className='absolute top-3 right-3 text-gray-500 hover:text-gray-700'
        >
          <AiOutlineClose size={20} />
        </button>

        {title && <h2 className='text-lg font-bold mb-4'>{title}</h2>}

        <div className='mb-6'>{children}</div>

        <div className='flex justify-end space-x-4'>
          {onCancel && (
            <button
              className='py-2 px-4 bg-gray-300 hover:bg-gray-400 rounded'
              onClick={onCancel}
            >
              {cancelText}
            </button>
          )}
          {onSubmit && (
            <button
              className='py-2 px-4 bg-blue-500 text-white hover:bg-blue-600 rounded'
              onClick={onSubmit}
            >
              {submitText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
