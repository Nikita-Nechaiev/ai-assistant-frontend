'use client';

import React, { useEffect, useCallback } from 'react';
import { AiOutlineClose } from 'react-icons/ai';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel?: () => void;
  onSubmit?: () => void;
  cancelText?: string;
  submitText?: string;
  width?: string;
  title?: string;
  children?: React.ReactNode;
}

const Modal = ({
  isOpen,
  onClose,
  onCancel,
  onSubmit,
  cancelText = 'Cancel',
  submitText = 'Submit',
  width = 'w-96',
  title,
  children,
}: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }

    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleBackgroundClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter' && onSubmit) {
        event.preventDefault();
        onSubmit();
      }
    },
    [onSubmit],
  );

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'
      onClick={handleBackgroundClick}
    >
      <div
        className={`relative bg-white rounded-md shadow-md p-6 transition-all duration-300 ${width} overflow-y-auto`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <button
          onClick={onClose}
          className='absolute top-3 right-3 text-gray-500 hover:text-gray-700'
        >
          <AiOutlineClose size={20} />
        </button>

        {title && <h2 className='text-lg font-bold mb-4'>{title}</h2>}

        <div className={`mb-6`}>{children}</div>

        <div className='flex justify-end space-x-4'>
          {onCancel && (
            <button
              className='py-2 px-4 border border-mainDark bg-mainLight text-mainDark hover:bg-gray-100 rounded'
              onClick={onCancel}
            >
              {cancelText}
            </button>
          )}
          {onSubmit && (
            <button
              className='py-2 px-4 bg-mainDark text-mainLight hover:bg-mainDarkHover rounded'
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
